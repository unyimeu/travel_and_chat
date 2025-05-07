import { createApp } from "vue";
import { GraffitiLocal } from "@graffiti-garden/implementation-local";
import { GraffitiRemote } from "@graffiti-garden/implementation-remote";
import { GraffitiPlugin } from "@graffiti-garden/wrapper-vue";


// Single Graffiti instance
const graffiti = new GraffitiLocal();

createApp({
  methods: {
    openChats() {
      window.location.href = "index.html";
    }
    // You can add other methods here later (openMaps, openFriends, etc.)
  },
  async mounted() {
    // Wait for Graffiti to load auth state
    await graffiti.waitForReady();
    // If still not logged in, send back to login
    if (!graffiti.session.value) {
      window.location.href = "login.html";
    }
  }
})
  .use(GraffitiPlugin, { graffiti })
  .mount("#intermediateApp");
