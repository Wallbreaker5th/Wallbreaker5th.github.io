<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { withBase } from "vuepress/client";
import { createTypstRenderer, type TypstRenderer } from "@myriaddreamin/typst.ts/renderer";
import * as rendererWrapper from "@myriaddreamin/typst-ts-renderer";
// @ts-expect-error Vite resolves wasm assets to versioned public URLs.
import rendererWasmUrl from "@myriaddreamin/typst-ts-renderer/wasm?url";

declare const __TYPST_ARTIFACT_MANIFEST__: Record<string, string>;

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
let lastRenderedWidth = 0;

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
      getWrapper: () => rendererWrapper,
      getModule: () => rendererWasmUrl,
    }).then(() => renderer);
  }

  await rendererPromise;
};

const getRenderer = async (): Promise<TypstRenderer> => {
  await ensureRenderer();

  return rendererPromise as Promise<TypstRenderer>;
};

const renderArtifact = async (): Promise<void> => {
  if (!canvas.value || !artifactData.value) {
    return;
  }

  const renderer = await getRenderer();

  canvas.value.innerHTML = "";
  await renderer.renderToCanvas({
    container: canvas.value,
    format: "vector",
    artifactContent: artifactData.value,
    pixelPerPt: props.pixelPerPt ?? 4,
  });
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
    observer = new ResizeObserver(() => {
      const width = container.value?.clientWidth ?? 0;
      if (Math.abs(width - lastRenderedWidth) >= 1) {
        void render();
      }
    });

    if (container.value) {
      observer.observe(container.value);
    }
  } catch (error) {
    status.value = error instanceof Error ? error.message : String(error);
  }
});

onBeforeUnmount(() => {
  observer?.disconnect();
});

watch(artifactUrl, async () => {
  try {
    lastRenderedWidth = 0;
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
