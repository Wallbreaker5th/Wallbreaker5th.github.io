import { sidebar } from "vuepress-theme-hope";

export default sidebar({
  "/": [
    "",
    {
      text: "文章",
      icon: "book",
      prefix: "posts/",
      children: [
        {
          text: "突发奇想",
          icon: "lightbulb",
          prefix: "inspiration/",
          children: "structure"
        },
        {
          text: "算法竞赛",
          icon: "code",
          prefix: "OI_ICPC/",
          children: "structure"
        },
        {
          text: "Typst",
          icon: "file-lines",
          prefix: "typst/",
          children: "structure"
        },
        {
          text: "闲话",
          icon: "comment-dots",
          prefix: "musings/",
          children: "structure"
        }
      ]
    },
    "intro",
  ],
});
