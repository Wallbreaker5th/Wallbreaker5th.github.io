import { defineUserConfig } from "vuepress";
import { viteBundler } from "@vuepress/bundler-vite";
import theme from "./theme.js";

export default defineUserConfig({
  base: "/",

  lang: "zh-CN",
  title: "Wallbreaker5th 的博客",
  description: "Wallbreaker5th 的博客",

  theme,

  bundler: viteBundler({
    viteOptions: {},
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
