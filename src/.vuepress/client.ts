import { defineClientConfig } from "vuepress/client";
import baiduAnalytics from "vue-baidu-analytics";
import TypstRenderer from "./components/TypstRenderer.vue";

export default defineClientConfig({
  enhance({ app, router, siteData }) {
    app.use(baiduAnalytics, {
      router: router,
      siteIdList: ["74813e89f42b6950a8264a139cb12fa2"],
      isDebug: true,
    });
    app.component("TypstRenderer", TypstRenderer);
  },
  setup() {},
  rootComponents: [],
});
