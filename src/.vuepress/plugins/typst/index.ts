import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, extname, join, relative, sep } from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";
import type MarkdownIt from "markdown-it";
import type { App, Page, Plugin } from "vuepress/core";
import {
  DynLayoutCompiler,
  NodeCompiler,
  type CompileDocArgs,
  type NodeTypstDocument,
} from "@myriaddreamin/typst-ts-node-compiler";

type TypstArtifact = {
  filename: string;
  content: Buffer | string;
};

const rendererManifest: Record<string, string> = {};
const emittedArtifacts = new Map<string, TypstArtifact>();

const SVG_LANG = "typst-render-as-svg";
const ARTIFACT_LANG = "typst-render-as-artifact";
const ARTIFACT_DIR = "typst-artifacts";
const BLOG_METADATA_LABEL = "<blog-metadata>";
const BLOG_TYPST_PACKAGE_IMPORT = ".vuepress/typst/packages/local/wdoc-post-to-blog/0.1.0/lib.typ";
const CSS_PX_PER_PT = 96 / 72;
const RESPONSIVE_LAYOUT_WIDTHS = [320, 480, 640, 800, 960, 1120, 1280, 1440].map(
  (width) => width / CSS_PX_PER_PT,
);

type TypstBlogMetadata = {
  title?: unknown;
  description?: unknown;
  keywords?: unknown;
  date?: unknown;
};

type TypstHtmlCompilation = {
  compiler: NodeCompiler;
  document: NodeTypstDocument;
};

const decodeHtml = (value: string): string =>
  value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'");

const escapeAttr = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const normalizePublicPath = (path: string): string =>
  path.startsWith("/") ? path : `/${path.replaceAll("\\", "/")}`;

const hashFor = (kind: string, source: string): string =>
  createHash("sha256").update(kind).update("\0").update(source).digest("hex").slice(0, 16);

const publicUrlFor = (filename: string): string => `/${ARTIFACT_DIR}/${filename}`;

const rememberArtifact = (filename: string, content: Buffer | string): string => {
  emittedArtifacts.set(filename, { filename, content });
  return publicUrlFor(filename);
};

const contentTypeForArtifact = (filename: string): string => {
  if (filename.endsWith(".svg")) {
    return "image/svg+xml; charset=utf-8";
  }

  return "application/octet-stream";
};

const serveTypstArtifact = (
  req: IncomingMessage,
  res: ServerResponse,
  next: (err?: unknown) => void,
): void => {
  const pathname = new URL(req.url ?? "", "http://vuepress.local").pathname;
  const prefix = `/${ARTIFACT_DIR}/`;

  if (!pathname.startsWith(prefix)) {
    next();
    return;
  }

  const filename = decodeURIComponent(pathname.slice(prefix.length));
  const artifact = emittedArtifacts.get(filename);

  if (!artifact) {
    res.statusCode = 404;
    res.end(`Typst artifact not found: ${filename}`);
    return;
  }

  res.statusCode = 200;
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Content-Type", contentTypeForArtifact(filename));
  res.end(artifact.content);
};

const configureTypstEnvironment = (app: App): void => {
  process.env.TYPST_PACKAGE_PATH = app.dir.source(".vuepress", "typst", "packages");
  process.env.TYPST_PACKAGE_CACHE_PATH = app.dir.cache("typst", "packages");
};

const createCompiler = (app: App, workspace = app.dir.source()): NodeCompiler =>
  NodeCompiler.create({
    workspace,
    fontArgs: [
      {
        fontPaths: [app.dir.public("assets", "fonts")],
      },
    ],
  });

const createDynamicLayoutCompiler = (app: App, workspace = app.dir.source()): DynLayoutCompiler => {
  const compiler = DynLayoutCompiler.fromBoxed(createCompiler(app, workspace).intoBoxed());
  compiler.setLayoutWidths(RESPONSIVE_LAYOUT_WIDTHS);
  return compiler;
};

const compileTypstHtmlDocument = (
  app: App,
  args: CompileDocArgs,
  diagnosticName: string,
): TypstHtmlCompilation => {
  configureTypstEnvironment(app);
  const compiler = createCompiler(app);
  const result = compiler.compileHtml(args);
  const document = result.result;

  if (result.hasError() || !document) {
    result.printErrors();
    throw new Error(`Typst HTML compilation failed for ${diagnosticName}`);
  }

  return { compiler, document };
};

const svgSnippetSource = (source: string): string => `#import "${BLOG_TYPST_PACKAGE_IMPORT}": *
#show: init.with(width: auto, page_margin: 4pt)
${source}
`;

const artifactSnippetSource = (source: string): string => `#import "${BLOG_TYPST_PACKAGE_IMPORT}": *
#show: init
${source}
`;

const compileSvgSnippet = (app: App, source: string): string => {
  configureTypstEnvironment(app);
  const filename = `${hashFor("svg", source)}.svg`;
  if (!emittedArtifacts.has(filename)) {
    const svg = createCompiler(app).svg({
      mainFileContent: svgSnippetSource(source),
      resetRead: true,
    });
    rememberArtifact(filename, svg);
  }

  return `<p class="typst-svg-block"><img class="typst-svg-image" :src="'${publicUrlFor(filename)}'" alt="Typst rendered SVG"></p>`;
};

const compileArtifactSnippet = (app: App, source: string): string => {
  configureTypstEnvironment(app);
  const filename = `${hashFor(`artifact:${RESPONSIVE_LAYOUT_WIDTHS.join(",")}`, source)}.sir`;
  if (!emittedArtifacts.has(filename)) {
    const dynamicCompiler = createDynamicLayoutCompiler(app);
    const artifact = dynamicCompiler.vector({
      mainFileContent: artifactSnippetSource(source),
      inputs: { "wdoc-export-target": "paged" },
      resetRead: true,
    });
    rememberArtifact(filename, artifact);
  }

  return `<TypstRenderer artifact="${publicUrlFor(filename)}" />`;
};

const resolvePublicSourcePath = (app: App, sourcePath: string): string => {
  const normalized = sourcePath.replace(/^\//, "").replaceAll("/", sep);
  return app.dir.public(normalized);
};

const compilePublicTypstRendererSource = (app: App, sourcePath: string): void => {
  const publicPath = normalizePublicPath(sourcePath);

  if (rendererManifest[publicPath]) {
    return;
  }

  configureTypstEnvironment(app);
  const absolutePath = resolvePublicSourcePath(app, publicPath);
  const source = readFileSync(absolutePath, "utf8");
  const filename = `${hashFor(`renderer:${RESPONSIVE_LAYOUT_WIDTHS.join(",")}`, `${publicPath}\0${source}`)}.sir`;

  if (!emittedArtifacts.has(filename)) {
    const dynamicCompiler = createDynamicLayoutCompiler(app, app.dir.public());
    const artifact = dynamicCompiler.vector({
      mainFilePath: absolutePath,
      inputs: { "wdoc-export-target": "paged" },
      resetRead: true,
    });
    rememberArtifact(filename, artifact);
  }

  rendererManifest[publicPath] = publicUrlFor(filename);
};

const scanTypstRendererTags = (app: App, content: string): void => {
  const rendererTagRE = /<TypstRenderer\b[^>]*\bpath=(["'])(.*?)\1[^>]*\/?>/g;
  for (const match of content.matchAll(rendererTagRE)) {
    compilePublicTypstRendererSource(app, decodeHtml(match[2]));
  }
};

const resolveTypstPagePath = (app: App, filePath: string): string => {
  const relativePath = relative(app.dir.source(), filePath).replaceAll("\\", "/");
  const withoutExt = relativePath.replace(/\.typ$/i, "");

  if (withoutExt.endsWith("/README") || withoutExt.endsWith("/index")) {
    return `/${withoutExt.replace(/\/(?:README|index)$/i, "/")}`;
  }

  return `/${withoutExt}.html`;
};

const extractTagContent = (html: string, tag: string): string => {
  const match = html.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? match[1].trim() : "";
};

const extractMeta = (html: string, name: string): string => {
  const metaRE = new RegExp(`<meta\\s+name=["']${name}["']\\s+content=["']([^"']*)["'][^>]*>`, "i");
  const match = html.match(metaRE);
  return match ? decodeHtml(match[1]) : "";
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const stringFromMetadata = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim() ? value : undefined;

const keywordValuesFromMetadata = (keywords: unknown): string[] => {
  if (Array.isArray(keywords)) {
    return keywords.filter((item): item is string => typeof item === "string");
  }

  if (typeof keywords === "string") {
    return keywords.split(",");
  }

  return [];
};

const dateFromMetadata = (value: unknown): Date | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) {
    return undefined;
  }

  return new Date(Date.UTC(year, month - 1, day));
};

const queryTypstBlogMetadata = (compiler: NodeCompiler, document: NodeTypstDocument): TypstBlogMetadata => {
  const values = compiler.query(document, { selector: BLOG_METADATA_LABEL, field: "value" });
  const value = Array.isArray(values) ? values[0] : undefined;

  return isRecord(value) ? value : {};
};

const keywordsToFrontmatter = (keywords: unknown): { category?: string[]; tag?: string[] } => {
  const values = keywordValuesFromMetadata(keywords).map((item) => item.trim()).filter(Boolean);
  const category: string[] = [];
  const tag: string[] = [];

  for (const value of values) {
    const categoryMatch = value.match(/^Category:\s*(.+)$/i);
    if (categoryMatch) {
      category.push(categoryMatch[1].trim());
    } else {
      tag.push(value);
    }
  }

  return {
    ...(category.length ? { category } : {}),
    ...(tag.length ? { tag } : {}),
  };
};

const metadataToFrontmatter = (metadata: TypstBlogMetadata): Record<string, unknown> => {
  const title = stringFromMetadata(metadata.title);
  const description = stringFromMetadata(metadata.description);
  const date = dateFromMetadata(metadata.date);

  return {
    ...keywordsToFrontmatter(metadata.keywords),
    ...(title ? { title } : {}),
    ...(description ? { description, excerpt: description } : {}),
    ...(date ? { date } : {}),
  };
};

const slugify = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-");

const applyHeadingIds = (html: string, pagePath: string): { html: string; headers: Page["headers"] } => {
  const headers: Page["headers"] = [];

  const rendered = html.replace(/<h([2-6])>([\s\S]*?)<\/h\1>/g, (full, levelText: string, rawTitle: string) => {
    const title = decodeHtml(rawTitle.replace(/<[^>]+>/g, "")).trim();
    const level = Number(levelText);
    const slug = slugify(title) || `heading-${headers.length + 1}`;
    headers.push({ level, title, slug, link: `${pagePath}#${slug}`, children: [] });
    return `<h${level} id="${escapeAttr(slug)}">${rawTitle}</h${level}>`;
  });

  return { html: rendered, headers };
};

const renderTypstCodeBlocks = (app: App, html: string): string =>
  html.replace(
    /<pre><code\s+data-lang=["'](typst-render-as-svg|typst-render-as-artifact)["']>([\s\S]*?)<\/code><\/pre>/g,
    (_full, lang: string, rawCode: string) => {
      const source = decodeHtml(rawCode.replace(/<br\s*\/?>/g, "\n"));
      return lang === SVG_LANG ? compileSvgSnippet(app, source) : compileArtifactSnippet(app, source);
    },
  );

const renderTypstArticle = (app: App, page: Page): void => {
  if (!page.filePath || page.filePathRelative === null || extname(page.filePath) !== ".typ") {
    return;
  }

  configureTypstEnvironment(app);

  const { compiler, document } = compileTypstHtmlDocument(app, {
    mainFilePath: page.filePath,
    inputs: { "wdoc-export-target": "html" },
    resetRead: true,
  }, page.filePathRelative);
  const metadata = queryTypstBlogMetadata(compiler, document);
  const fullHtml = compiler.html(document);

  if (!fullHtml) {
    throw new Error(`Typst HTML export returned empty output for ${page.filePathRelative}`);
  }

  const title = stringFromMetadata(metadata.title) || extractTagContent(fullHtml, "title") || page.title;
  const description = stringFromMetadata(metadata.description) || extractMeta(fullHtml, "description");
  const body = extractTagContent(fullHtml, "body");
  const processedBody = renderTypstCodeBlocks(app, body);
  const { html, headers } = applyHeadingIds(processedBody, page.path);

  page.title = title;
  page.contentRendered = `<div class="typst-html-article">${html}</div>`;
  page.sfcBlocks.template = {
    ...page.sfcBlocks.template,
    type: "template",
    content: page.contentRendered,
    contentStripped: page.contentRendered,
    tagOpen: "<template>",
    tagClose: "</template>",
  };
  page.headers = headers;
  page.frontmatter = {
    ...page.frontmatter,
    ...metadataToFrontmatter(metadata),
    title,
    ...(description ? { description, excerpt: description } : {}),
  };
  page.data.title = page.title;
  page.data.headers = page.headers;
  page.data.frontmatter = page.frontmatter;
};

const createMarkdownTypstPlugin = (app: App): ((md: MarkdownIt) => void) => (md) => {
  const defaultFenceRenderer = md.renderer.rules.fence?.bind(md.renderer.rules);

  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const lang = token.info.trim().split(/\s+/)[0];

    if (lang === SVG_LANG) {
      return compileSvgSnippet(app, token.content);
    }

    if (lang === ARTIFACT_LANG) {
      return compileArtifactSnippet(app, token.content);
    }

    return defaultFenceRenderer
      ? defaultFenceRenderer(tokens, idx, options, env, self)
      : self.renderToken(tokens, idx, options);
  };
};

export const typstPlugin = (): Plugin => ({
  name: "vuepress-plugin-local-typst",

  define: () => ({
    __TYPST_ARTIFACT_MANIFEST__: rendererManifest,
  }),

  extendsPageOptions: (options, app) => {
    if (options.filePath && extname(options.filePath) === ".typ") {
      const { compiler, document } = compileTypstHtmlDocument(app, {
        mainFilePath: options.filePath,
        inputs: { "wdoc-export-target": "html" },
        resetRead: true,
      }, options.filePath);
      const metadata = queryTypstBlogMetadata(compiler, document);

      options.path = resolveTypstPagePath(app, options.filePath);
      options.frontmatter = {
        ...options.frontmatter,
        ...metadataToFrontmatter(metadata),
      };
    }
  },

  extendsMarkdown: (md, app) => {
    md.use(createMarkdownTypstPlugin(app));
  },

  extendsPage: (page, app) => {
    renderTypstArticle(app, page);
    scanTypstRendererTags(app, page.contentRendered);
  },

  extendsBundlerOptions: (bundlerOptions) => {
    bundlerOptions.viteOptions ??= {};
    bundlerOptions.viteOptions.optimizeDeps ??= {};
    bundlerOptions.viteOptions.optimizeDeps.exclude = [
      ...(bundlerOptions.viteOptions.optimizeDeps.exclude ?? []),
      "@myriaddreamin/typst.ts",
      "@myriaddreamin/typst.ts/renderer",
      "@myriaddreamin/typst-ts-renderer",
    ];
    bundlerOptions.viteOptions.plugins = [
      ...(bundlerOptions.viteOptions.plugins ?? []),
      {
        name: "vuepress-plugin-local-typst-artifacts",
        configureServer: (server) => {
          server.middlewares.use(serveTypstArtifact);
        },
      },
    ];
  },

  onGenerated: (app) => {
    const outputDir = app.dir.dest(ARTIFACT_DIR);
    mkdirSync(outputDir, { recursive: true });

    for (const artifact of emittedArtifacts.values()) {
      const outputPath = join(outputDir, artifact.filename);
      mkdirSync(dirname(outputPath), { recursive: true });
      writeFileSync(outputPath, artifact.content);
    }
  },
});

export default typstPlugin;
