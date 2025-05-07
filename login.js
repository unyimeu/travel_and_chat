// login.js
import { createApp } from "vue";
import { GraffitiRemote } from "@graffiti-garden/implementation-remote";
import { GraffitiPlugin } from "@graffiti-garden/wrapper-vue";

// 1) Instantiate your Graffiti backend just once
const graffiti = new GraffitiRemote();

createApp({
  data() {
    return {
      loading: false,
    };
  },
  methods: {
    async startLogin() {
      this.loading = true;
      // Fire off Graffiti's built-in login flow.
      // After the OAuth dance completes, Graffiti will rehydrate session
      // and update this.$graffitiSession.value.
      await this.$graffiti.login();
      // We don’t redirect here—you’ll be returned to this page
      // and the watcher below will catch the session change.
    },
  },
  mounted() {
    // 2) If you land here already logged in, go straight to chat:
    if (this.$graffitiSession.value) {
      window.location.href = "index.html";
      return;
    }

    // 3) Otherwise, watch for session.value to flip truthy
    const stopWatching = this.$watch(
      () => this.$graffitiSession.value,
      (newVal) => {
        if (newVal) {
          stopWatching();              // stop the watcher
          window.location.href = "index.html";
        }
      }
    );
  },
})
  .use(GraffitiPlugin, { graffiti })
  .mount("#loginApp");
