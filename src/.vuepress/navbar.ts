import { navbar } from "vuepress-theme-hope";

export default navbar([
  "/",
  {
    text: "博文",
    icon: "pen-to-square",
    prefix: "/",
    children: [
      {
        text: "突发奇想",
        icon: "lightbulb",
        link: "category/突发奇想/",
      },
      {
        text: "算法竞赛",
        icon: "code",
        link: "category/oi×icpc/",
      },
      {
        text: "Typst",
        icon: "file-lines",
        link: "category/typst/",
      }
    ]
  },
  {
    text: "关于我",
    icon: "user",
    link: "/intro"
  }
]);
