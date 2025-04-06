import { defineClientConfig } from "vuepress/client";
import Clarity from '@microsoft/clarity';
import TypstRenderer from "./components/TypstRenderer.vue";


export default defineClientConfig({
  enhance({ app, router, siteData }) {
    app.component("TypstRenderer", TypstRenderer);
  },
  setup() {
    Clarity.init("qzwl6o429v");
  },
  rootComponents: [],
});
