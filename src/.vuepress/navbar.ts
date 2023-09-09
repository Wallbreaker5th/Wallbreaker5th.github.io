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
      }
    ]
  },
]);
