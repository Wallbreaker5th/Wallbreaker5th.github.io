<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { withBase } from "vuepress/client";
import { createTypstRenderer, type RenderSession, type TypstRenderer } from "@myriaddreamin/typst.ts/renderer";
import type { TypstDomDocument } from "@myriaddreamin/typst.ts/dom";
import * as rendererWrapper from "@myriaddreamin/typst-ts-renderer";
// @ts-expect-error Vite resolves wasm assets to versioned public URLs.
import rendererWasmUrl from "@myriaddreamin/typst-ts-renderer/wasm?url";

declare const __TYPST_ARTIFACT_MANIFEST__: Record<string, string>;
declare global {
  interface Window {
    typstBindSemantics?: (page: HTMLElement, svg: SVGSVGElement, semantics: HTMLElement) => void;
    typstBindSvgDom?: (page: HTMLElement, svg: SVGSVGElement) => void;
  }
}

const rendererWrapperWithObjectInit = {
  ...rendererWrapper,
  default: (moduleOrPath?: unknown) => rendererWrapper.default({ module_or_path: moduleOrPath }),
};
const CSS_PX_PER_PT = 96 / 72;

const props = defineProps<{
  artifact?: string;
  path?: string;
  pixelPerPt?: number;
}>();

const container = ref<HTMLElement>();
const canvas = ref<HTMLElement>();
const artifactData = ref<Uint8Array>();
const status = ref("正在加载 Typst 排版产物……");
let observer: ResizeObserver | undefined;
let renderToken = 0;
let rendererPromise: Promise<TypstRenderer> | undefined;
let domDocument: TypstDomDocument | undefined;
let disposeSession: (() => void) | undefined;
let sessionReadyPromise: Promise<void> | undefined;
let resolveSessionReady: (() => void) | undefined;
let rejectSessionReady: ((reason?: unknown) => void) | undefined;
let lastRenderedWidth = 0;
let viewportChangeHandler: (() => void) | undefined;

const artifactUrl = computed(() => {
  if (props.artifact) {
    return props.artifact;
  }

  if (props.path) {
    return __TYPST_ARTIFACT_MANIFEST__[props.path] ?? __TYPST_ARTIFACT_MANIFEST__[withBase(props.path)];
  }

  return undefined;
});

const ensureRenderer = async (): Promise<void> => {
  if (!rendererPromise) {
    const renderer = createTypstRenderer();
    rendererPromise = renderer.init({
      getWrapper: () => rendererWrapperWithObjectInit,
      getModule: () => rendererWasmUrl,
    }).then(() => renderer);
  }

  await rendererPromise;
};

const getRenderer = async (): Promise<TypstRenderer> => {
  await ensureRenderer();

  return rendererPromise as Promise<TypstRenderer>;
};

const disposeDomSession = (): void => {
  domDocument?.dispose();
  domDocument = undefined;
  disposeSession?.();
  disposeSession = undefined;
  sessionReadyPromise = undefined;
  resolveSessionReady = undefined;
  rejectSessionReady = undefined;

  if (canvas.value) {
    canvas.value.innerHTML = "";
  }
};

const retrieveDOMState = () => {
  const element = canvas.value;
  const rect = element?.getBoundingClientRect();

  return {
    width: element?.clientWidth ?? 0,
    height: element?.clientHeight ?? 0,
    window: {
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
    },
    boundingRect: {
      left: rect?.left ?? 0,
      top: rect?.top ?? 0,
      right: rect?.right ?? 0,
    },
  };
};

type DomRenderOptions = Parameters<TypstRenderer["renderDom"]>[0] & {
  retrieveDOMState: typeof retrieveDOMState;
};

const ensureTypstDomGlobals = (): void => {
  window.typstBindSemantics ??= () => {};
  window.typstBindSvgDom ??= () => {};
};

const ensureDomSession = async (): Promise<void> => {
  if (domDocument) {
    return;
  }

  if (!canvas.value) {
    return;
  }

  if (sessionReadyPromise) {
    return sessionReadyPromise;
  }

  const renderer = await getRenderer();
  ensureTypstDomGlobals();
  sessionReadyPromise = new Promise((resolve, reject) => {
    resolveSessionReady = resolve;
    rejectSessionReady = reject;
  });

  void renderer.runWithSession(async (session: RenderSession) => {
    await new Promise<void>(async (dispose) => {
      try {
        disposeSession = dispose;
        const renderOptions: DomRenderOptions = {
          renderSession: session,
          container: canvas.value as HTMLElement,
          pixelPerPt: props.pixelPerPt ?? 4,
          domScale: CSS_PX_PER_PT,
          retrieveDOMState,
        };

        domDocument = await renderer.renderDom(renderOptions);
        resolveSessionReady?.();
      } catch (error) {
        rejectSessionReady?.(error);
        dispose();
      }
    });
  }).catch((error) => {
    if (disposeSession || !sessionReadyPromise) {
      return;
    }

    rejectSessionReady?.(error);
  });

  await sessionReadyPromise;
};

const renderArtifact = async (): Promise<void> => {
  if (!canvas.value || !artifactData.value) {
    return;
  }

  await ensureDomSession();
  domDocument?.addChangement(["new", artifactData.value as unknown as string]);
};

const requestViewportLayout = (): void => {
  if (!domDocument) {
    return;
  }

  domDocument.addViewportChange();
};

const requestContainerLayout = (): void => {
  const width = container.value?.clientWidth ?? 0;
  if (width <= 0 || Math.abs(width - lastRenderedWidth) < 1) {
    return;
  }

  lastRenderedWidth = width;

  if (domDocument) {
    domDocument.addViewportChange();
    return;
  }

  void render();
};

const loadArtifact = async (): Promise<void> => {
  const url = artifactUrl.value;
  if (!url) {
    status.value = props.path ? `没有找到 ${props.path} 对应的 Typst 构建产物。` : "缺少 Typst 构建产物路径。";
    return;
  }

  const response = await fetch(withBase(url));
  if (!response.ok) {
    throw new Error(`Failed to fetch Typst artifact: ${response.status} ${response.statusText}`);
  }

  artifactData.value = new Uint8Array(await response.arrayBuffer());
};

const render = async (): Promise<void> => {
  if (!canvas.value || !artifactData.value) {
    return;
  }

  const token = ++renderToken;
  await nextTick();

  const width = container.value?.clientWidth ?? 0;

  if (token !== renderToken || !canvas.value || !artifactData.value || width <= 0) {
    return;
  }

  lastRenderedWidth = width;
  await renderArtifact();
};

onMounted(async () => {
  try {
    await loadArtifact();
    await render();
    observer = new ResizeObserver(requestContainerLayout);

    if (container.value) {
      observer.observe(container.value);
    }

    viewportChangeHandler = requestViewportLayout;
    window.addEventListener("resize", viewportChangeHandler);
    window.addEventListener("scroll", viewportChangeHandler, { passive: true });
  } catch (error) {
    status.value = error instanceof Error ? error.message : String(error);
  }
});

onBeforeUnmount(() => {
  observer?.disconnect();
  if (viewportChangeHandler) {
    window.removeEventListener("resize", viewportChangeHandler);
    window.removeEventListener("scroll", viewportChangeHandler);
  }
  disposeDomSession();
});

watch(artifactUrl, async () => {
  try {
    lastRenderedWidth = 0;
    disposeDomSession();
    await loadArtifact();
    await render();
  } catch (error) {
    status.value = error instanceof Error ? error.message : String(error);
  }
});
</script>

<template>
  <div ref="container" class="typst-artifact-block">
    <div ref="canvas" class="typst-artifact-canvas">
      {{ status }}
    </div>
  </div>
</template>
