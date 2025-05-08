import { createApp } from "vue";

createApp({
  methods: {
    openChats() {
      window.location.href = "index.html";
    }
  }
})
  .mount("#intermediateApp");
