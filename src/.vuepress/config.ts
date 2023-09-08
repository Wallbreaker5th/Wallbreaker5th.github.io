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
});
