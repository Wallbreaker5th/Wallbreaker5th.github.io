import { defineClientConfig } from "@vuepress/client";
import baiduAnalytics from "vue-baidu-analytics";

export default defineClientConfig({
  enhance({ app, router, siteData }) {
    app.use(baiduAnalytics, {
      router: router,
      siteIdList: ["74813e89f42b6950a8264a139cb12fa2"],
      isDebug: true,
    });
  },
  setup() {},
  rootComponents: [],
});
