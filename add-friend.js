import { createApp } from "vue";
import { GraffitiPlugin } from "@graffiti-garden/wrapper-vue";
import { GraffitiLocal } from "@graffiti-garden/implementation-local";
import AddFriend from "./components/AddFriend.js";
import Dashboard from "./components/Dashboard.js";

createApp({
  components: { AddFriend, Dashboard },
})
  .use(GraffitiPlugin, { graffiti: new GraffitiLocal() })
  .mount("#addFriendApp");
