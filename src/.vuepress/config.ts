import { defineUserConfig } from "vuepress";
import theme from "./theme.js";

export default defineUserConfig({
  base: "/",

  lang: "zh-CN",
  title: "Wallbreaker5th 的博客",
  description: "Wallbreaker5th 的博客",

  theme,

  // Enable it with pwa
  // shouldPrefetch: false,

  head: [
    [
      'script', {}, `
      var _hmt = _hmt || [];
      (function() {
        var hm = document.createElement("script");
        hm.src = "https://hm.baidu.com/hm.js?74813e89f42b6950a8264a139cb12fa2";
        var s = document.getElementsByTagName("script")[0]; 
        s.parentNode.insertBefore(hm, s);
      })();
      `
    ]
  ]
});
