<script setup lang="ts">
import { createTypstCompiler } from '@myriaddreamin/typst.ts/dist/esm/compiler.mjs';
import { $typst } from '@myriaddreamin/typst.ts/dist/esm/contrib/snippet.mjs';
import { preloadRemoteFonts, disableDefaultFontAssets, withPackageRegistry, withAccessModel } from '@myriaddreamin/typst.ts/dist/esm/options.init.mjs';
import { MemoryAccessModel } from '@myriaddreamin/typst.ts/dist/cjs/fs/memory.cjs';
import { FetchPackageRegistry } from '@myriaddreamin/typst.ts/dist/cjs/fs/package.cjs';
</script>
<script lang="ts">
export default {
  props: {
    path: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      code: '',
      width: 500,
      compiler: createTypstCompiler(),
      artifactData: new Map<Number, any>()
    }
  },
  methods: {
    async fetchCode() {
      const response = await fetch(this.path)
      this.code = await response.text()
    },
    observeSize() {
      const observer = new ResizeObserver(entries => {
        for (let entry of entries) {
          this.handleWidthChange(entry.contentBoxSize[0].inlineSize / 16 * 12)
        }
      })
      observer.observe(this.$refs.container)
    },
    handleWidthChange(newWidth: number) {
      const newFlooredWidth = Math.floor(newWidth / 50) * 50
      if (newFlooredWidth !== this.width) {
        this.width = newFlooredWidth;
        this.recompile();
      }
    },
    async prepareCompiler() {
      const m = new MemoryAccessModel();
      await this.compiler.init({
        getModule: () => '/wasm/typst_ts_web_compiler_bg.wasm',
        beforeBuild: [
          preloadRemoteFonts([
            'LXGWNeoXiHei.ttf',
            'FangZhengHeiTiJianTi-1.ttf',
            'NewCMMath-Regular.otf',
          ].map((fontName) => `/assets/fonts/${fontName}`)),
          preloadRemoteFonts([], { assets: ['cjk', 'emoji', 'text'], assetUrlPrefix: '/assets/fonts/' }),
          disableDefaultFontAssets(),
          withAccessModel(m),
          withPackageRegistry(new FetchPackageRegistry(m)),
        ]
      });
      await $typst.setCompilerInitOptions({
        getModule: () =>
          '/wasm/typst_ts_web_compiler_bg.wasm',
      });
      await $typst.setRendererInitOptions({
        getModule: () =>
          '/wasm/typst_ts_renderer_bg.wasm',
      });
      await this.compiler.addSource("/main.typ", this.code)
    },
    async recompile() {
      if (!this.artifactData.has(this.width)) {
        const encoder = new TextEncoder();
        this.compiler.mapShadow('/page_config.json', encoder.encode(JSON.stringify({
          width: this.width
        })));
        const artifactData = await this.compiler.compile({ mainFilePath: '/main.typ' });
        this.artifactData.set(this.width, artifactData);
        this.compiler.unmapShadow('/page_config.json');
      }
      await $typst.canvas(this.$refs.canvas, { vectorData: this.artifactData.get(this.width) });
    }
  },
  mounted() {
    this.fetchCode();
    this.prepareCompiler().then(() => {
      this.observeSize();
    });
  }
}
</script>

<template>
  <div ref="container">
    <div ref="canvas">
      正在初始化 Typst 编译器……
    </div>
  </div>
</template>
