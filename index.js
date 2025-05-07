import { createApp } from "vue";
import { GraffitiLocal } from "@graffiti-garden/implementation-local";
import { GraffitiRemote } from "@graffiti-garden/implementation-remote";
import { GraffitiPlugin } from "@graffiti-garden/wrapper-vue";

const ReactionButton = {
  props: ["messageUrl"],
  data() {
    return {
      reactions: [],
    };
  },
  methods: {
    async toggleReaction() {
      const session = this.$graffitiSession.value;
      const existing = this.reactions.find(
        (r) =>
          r.value?.type === "reaction" &&
          r.value?.messageUrl === this.messageUrl &&
          r.actor === session.actor
      );

      if (existing) {
        await this.$graffiti.delete(existing, session);
      } else {
        await this.$graffiti.put(
          {
            value: {
              type: "reaction",
              messageUrl: this.messageUrl,
              timestamp: Date.now(),
            },
            channels: [this.messageUrl],
          },
          session
        );
      }
    },
  },
  template: `
    <graffiti-discover
      :channels="[messageUrl]"
      :schema="{
        properties: {
          value: {
            required: ['type', 'messageUrl'],
            properties: {
              type: { const: 'reaction' },
              messageUrl: { type: 'string' }
            }
          }
        }
      }"
      v-slot="{ objects }"
    >
      <button @click="toggleReaction">
        👍 {{ objects.length }}
      </button>
      <div style="display: none">{{ reactions = objects }}</div>
    </graffiti-discover>
  `,
};

createApp({
  data() {
    return {
      loggedIn: false,
      myMessage: "",
      sending: false,
      groupName: "",
      selectedChannel: null,
      editingMessage: null,
      editContent: "",
      newGroupName: "",
      groupNameObjects: [],
      activeMenu: null,
      showGroupInfo: false,
      groupDescription: "",
      groupMembers: [],
      profile: {
        name: "",
        pronouns: "",
        bio: "",
        icon: "",
      },
      showProfileEditor: false,
      profileObjects: [],
      profileDraft: {
        name: "",
        pronouns: "",
        bio: "",
        icon: "",
      },
    };
  },
  methods: {
    startLogin() {
      this.$graffiti.login().then(() => {
        this.loggedIn = true;
      });
    },
    async handleLogout() {
      // 1) call Graffiti’s logout
      await this.$graffiti.logout(this.$graffitiSession.value);
      // 2) then send them back to the login page
      window.location.href = "login.html";
    },
    toggleMessageMenu(message) {
      this.activeMenu = this.activeMenu === message ? null : message;
    },
    async sendMessage(session) {
      if (!this.myMessage || !this.selectedChannel) return;
      this.sending = true;
      await this.$graffiti.put(
        {
          value: {
            content: this.myMessage,
            published: Date.now(),
          },
          channels: [this.selectedChannel],
        },
        session
      );
      this.myMessage = "";
      this.sending = false;
      await this.$nextTick();
      this.$refs.messageInput.focus();
    },
    async createGroup(session) {
      const newChannel = crypto.randomUUID();
      await this.$graffiti.put(
        {
          value: {
            activity: "Create",
            object: {
              type: "Group Chat",
              name: this.groupName,
              channel: newChannel,
            },
          },
          channels: ["designftw"],
        },
        session
      );
      await this.$graffiti.put(
        {
          value: {
            name: this.groupName,
            describes: newChannel,
          },
          channels: ["designftw"],
        },
        session
      );
      this.selectedChannel = newChannel;
      this.groupName = "";
    },
    startEdit(message) {
      this.editingMessage = message;
      this.editContent = message.value.content;
    },
    cancelEdit() {
      this.editingMessage = null;
      this.editContent = "";
    },
    async saveEdit(message) {
      await this.$graffiti.patch(
        {
          value: [
            {
              op: "replace",
              path: "/content",
              value: this.editContent,
            },
          ],
        },
        message,
        this.$graffitiSession.value
      );
      this.editingMessage = null;
      this.editContent = "";
    },
    async deleteMessage(message) {
      await this.$graffiti.delete(message, this.$graffitiSession.value);
    },
    async renameGroup() {
      if (!this.newGroupName || !this.selectedChannel) return;
      await this.$graffiti.put(
        {
          value: {
            name: this.newGroupName,
            describes: this.selectedChannel,
          },
          channels: ["designftw"],
        },
        this.$graffitiSession.value
      );
      this.newGroupName = "";
    },
    getGroupName(channel) {
      const matches = this.groupNameObjects.filter(
        (obj) => obj.value.describes === channel
      );
      if (matches.length === 0) return null;
      const latest = matches.reduce((a, b) => {
        const aTime = a.value.published ?? a.timestamp ?? 0;
        const bTime = b.value.published ?? b.timestamp ?? 0;
        return aTime > bTime ? a : b;
      });
      return latest.value.name;
    },
    updateGroupNameObjects(objs) {
      this.groupNameObjects = objs;
    },

    async saveProfile() {
      const session = this.$graffitiSession.value;
      const newProfile = {
        ...this.profileDraft,
        generator: "https://unyimeu.github.io/travel_and_chat/",
        describes: session.actor,
        name: "My Name",
        published: Date.now(),
      };

      const profileObject = {
        value: newProfile,
        channels: ["designftw-2025-studio2", session.actor],
      };
      console.log("Saving profile", profileObject);

      await this.$graffiti.put(profileObject, session);

      this.profile = { ...this.profileDraft };
      this.showProfileEditor = false;
    },

    updateProfileObjects(objects) {
      this.profileObjects = objects;
      const latest = objects.reduce((a, b) =>
        (a.value.published ?? 0) > (b.value.published ?? 0) ? a : b
      );
      this.profile = {
        name: latest.value.name || "",
        pronouns: latest.value.pronouns || "",
        bio: latest.value.bio || "",
        icon: latest.value.icon || "",
      };
    },

    startProfileEdit() {
      this.profileDraft = { ...this.profile };
      this.showProfileEditor = true;
    },
  },
  mounted() {
    const unwatch = this.$watch(
      () => this.$refs.groupNameDiscover?.$data?.objects,
      (newObjects) => {
        if (newObjects) this.groupNameObjects = newObjects;
      },
      { immediate: true }
    );

    const unwatchProfile = this.$watch(
      () => this.$refs.profileDiscover?.$data?.objects,
      (newObjects) => {
        if (newObjects) this.updateProfileObjects(newObjects);
      },
      { immediate: true }
    );
  },
})
  .component("reaction-button", ReactionButton)
  .use(GraffitiPlugin, {
    //graffiti: new GraffitiLocal(),
    graffiti: new GraffitiRemote(),
  })
  .mount("#app");

const toggleMenuBtn = document.getElementById("toggleGroupMenu");
const groupMenu = document.getElementById("groupMenu");
const showCreateFormBtn = document.getElementById("showCreateForm");
const createGroupForm = document.getElementById("createGroupForm");

if (toggleMenuBtn) {
  toggleMenuBtn.addEventListener("click", () => {
    groupMenu.classList.toggle("hidden");
  });
}
if (showCreateFormBtn) {
  showCreateFormBtn.addEventListener("click", () => {
    groupMenu.classList.add("hidden");
    createGroupForm.classList.remove("hidden");
    createGroupForm.classList.remove("showing");
  });
}
