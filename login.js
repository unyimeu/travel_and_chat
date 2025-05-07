import { createApp } from "vue";
import { GraffitiLocal } from "@graffiti-garden/implementation-local";
import { GraffitiPlugin } from "@graffiti-garden/wrapper-vue";

// switch to the local implementation
const graffiti = new GraffitiLocal();

createApp({
  data() {
    return { loading: false };
  },
  methods: {
    async startLogin() {
      this.loading = true;
      // use local Graffiti login
      await graffiti.login();
      // on success, go to the intermediate page
      window.location.href = "intermediate.html";
    }
  }
})
  .use(GraffitiPlugin, { graffiti })
  .mount("#loginApp");
