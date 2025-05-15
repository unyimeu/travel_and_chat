import { createApp } from "vue";
import { GraffitiLocal } from "@graffiti-garden/implementation-local";
import { GraffitiPlugin } from "@graffiti-garden/wrapper-vue";
import Dashboard from "./components/Dashboard.js";

const graffiti = new GraffitiLocal();
createApp({
  methods: {
    openChats() {
      window.location.href = "home.html";
    },
    openMap() {
      window.location.href = "map.html";
    },
    openFriends() {
      window.location.href = "add-friend.html";
    },
    openGroups() {
      window.location.href = "groups.html";
    },
  },
})
  .use(GraffitiPlugin, { graffiti })
  .component("Dashboard", Dashboard)
  .mount("#intermediateApp");
