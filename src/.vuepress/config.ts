import { defineUserConfig } from "vuepress";
import { relative } from "node:path";
import { viteBundler } from "@vuepress/bundler-vite";
import theme from "./theme.js";
import { typstPlugin } from "./plugins/typst/index.js";

export default defineUserConfig({
  base: "/",

  lang: "zh-CN",
  title: "Wallbreaker5th 的博客",
  description: "Wallbreaker5th 的博客",

  theme,

  pagePatterns: ["**/*.md", "**/*.typ", "!.vuepress", "!node_modules"],

  // Normalize all page paths to lowercase so that routes, generated links
  // and output files are case-consistent. Some hosting/CDN setups serve files
  // case-insensitively, but VuePress' client-side router is case-sensitive,
  // so paths with uppercase letters (e.g. posts/OI_ICPC/*.md) could otherwise
  // end up 404ing. See vuepress-theme-hope issue #4555.
  extendsPageOptions: (options, app) => {
    if (options.path) {
      // Pages whose path is already set (e.g. .typ pages set by the typst plugin)
      options.path = options.path.toLowerCase();
    } else if (options.filePath) {
      // Markdown pages: infer the route path the same way VuePress does,
      // then normalize it to lowercase.
      const filePathRelative = relative(app.dir.source(), options.filePath).replace(/\\/g, "/");
      options.path = `/${filePathRelative}`
        .replace(/\.md$/, ".html")
        .replace(/\/(README|index)\.html$/i, "/")
        .toLowerCase();
    }
  },

  plugins: [typstPlugin()],

  bundler: viteBundler({
    viteOptions: {
      ssr: {
        noExternal: ['@microsoft/clarity']
      }
    },
    vuePluginOptions: {},
  }),

  head: [
    // <!-- pdf.js v3.5.141 -->
    // <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.5.141/pdf.min.js"></script>
    // <link rel="stylesheet" href="/core/examples/typst.ts.css" />
    // <link
    //   rel="stylesheet"
    //   href="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.5.141/pdf_viewer.min.css"
    //   integrity="sha512-Jf9DLkegLgARLR151csVkPvcVt4cOUhslrSZwiTAe9mqFL/BbYRDmxCOioCtbHifEgjsBFbrVhOMQ3mYPDLrqQ=="
    //   crossorigin="anonymous"
    //   referrerpolicy="no-referrer"
    //   />
    // <script>
    //   pdfjsLib.GlobalWorkerOptions.workerSrc =
    //     'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.5.141/pdf.worker.min.js';
    // </script>

    [
      "script",
      {
        onload:
          "pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.5.141/pdf.worker.min.js';",
        src: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.5.141/pdf.min.js",
      },
    ],
    [
      "link",
      {
        rel: "stylesheet",
        href: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.5.141/pdf_viewer.min.css",
        integrity:
          "sha512-Jf9DLkegLgARLR151csVkPvcVt4cOUhslrSZwiTAe9mqFL/BbYRDmxCOioCtbHifEgjsBFbrVhOMQ3mYPDLrqQ==",
        crossorigin: "anonymous",
        referrerpolicy: "no-referrer",
      },
    ],
  ],

  // Enable it with pwa
  // shouldPrefetch: false,
});
