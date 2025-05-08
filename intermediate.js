import { createApp } from "vue";
import { GraffitiLocal } from "@graffiti-garden/implementation-local";
import { GraffitiPlugin } from "@graffiti-garden/wrapper-vue";

const graffiti = new GraffitiLocal();
createApp({
  methods: {
    openChats() {
      window.location.href = "home.html";
    },
  },
})
  .use(GraffitiPlugin, { graffiti })
  .mount("#intermediateApp");
