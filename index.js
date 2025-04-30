import { createApp, nextTick } from "vue";
import { GraffitiLocal } from "@graffiti-garden/implementation-local";
import { GraffitiRemote } from "@graffiti-garden/implementation-remote";
import { GraffitiPlugin } from "@graffiti-garden/wrapper-vue";

createApp({
  data() {
    return {
      myMessage: "",
      sendingMessage: false,

      newGroupName: "",
      sending: false,

      channels: ["designftw"],
      selectedChannel: null,

      channelNames: {},

      inviteActorId: "",
      groupMembers: {},
      newMemberId: "",
      hiddenGroups: [],
    };
  },

  async mounted() {
    await this.fetchGroupNames();
  },

  methods: {
    async sendMessage(session) {
      if (!this.myMessage || !this.selectedChannel) return;

      const currentUser = this.$graffitiSession.value?.actor;
      const groupMembers = this.groupMembers[this.selectedChannel] || [];

      if (!groupMembers.includes(currentUser)) {
        alert(
          "You can't send messages to this group because you're not a member."
        );
        return;
      }

      this.sendingMessage = true;

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
      this.sendingMessage = false;
      await nextTick();
      this.$refs.messageInput.focus();
    },

    async createGroupChat(session) {
      if (!this.newGroupName) return;
      this.sending = true;

      const mychannel = crypto.randomUUID();
      this.channels.push(mychannel);

      const group = {
        activity: "Create",
        object: {
          type: "Group Chat",
          name: this.newGroupName,
          channel: mychannel,
        },
      };

      await this.$graffiti.put(
        {
          value: group,
          channels: ["designftw"],
        },
        session
      );

      await this.$graffiti.put(
        {
          value: {
            name: this.newGroupName,
            describes: mychannel,
          },
          channels: [mychannel],
        },
        session
      );

      this.channelNames[mychannel] = this.newGroupName;
      this.sending = false;
      this.newGroupName = "";
      await nextTick();
      this.$refs.groupNameInput.focus();
    },

    async deleteMessage(message, session) {
      await this.$graffiti.delete(message.url, session);
    },

    async editMessage(message, session) {
      const newContent = prompt("Edit message:", message.value.content);
      if (newContent === null || newContent === message.value.content) return;

      const patch = [
        {
          op: "replace",
          path: "/content",
          value: newContent,
        },
      ];

      try {
        await this.$graffiti.patch({ value: patch }, message.url, session);
      } catch (e) {
        console.error("Failed to patch message:", e);
      }
    },

    async updateGroupName(session, channel) {
      const newName = prompt("Enter a new group name:");
      if (!newName) return;

      const nameObject = {
        name: newName,
        describes: channel,
      };

      try {
        await this.$graffiti.put(
          {
            value: nameObject,
            channels: [channel],
          },
          session
        );

        this.channelNames[channel] = newName;
      } catch (e) {
        console.error("Failed to update group name:", e);
      }
    },

    async fetchGroupNames() {
      for (const ch of this.channels) {
        try {
          const results = await this.$graffiti.discover({ describes: ch });
          const nameObj = results.find((r) => r.value?.name);
          this.channelNames[ch] = nameObj?.value?.name || null;
        } catch (e) {
          console.error("Failed to fetch name for", ch, e);
          this.channelNames[ch] = null;
        }
      }
    },

    async addMember() {
      if (!this.selectedChannel || !this.newMemberId.trim()) return;

      if (!this.groupMembers[this.selectedChannel]) {
        this.groupMembers[this.selectedChannel] = [];
      }

      this.groupMembers[this.selectedChannel].push(this.newMemberId.trim());
      this.newMemberId = "";
    },

    async removeMember(index) {
      if (!this.selectedChannel || !this.groupMembers[this.selectedChannel])
        return;

      this.groupMembers[this.selectedChannel].splice(index, 1);
    },
    async enterGroup(ch) {
      this.selectedChannel = ch;
      if (!this.groupMembers[ch]) {
        this.groupMembers[ch] = [];
      }
      const me = this.$graffitiSession.value.actor;
      if (!this.groupMembers[ch].includes(me)) {
        this.groupMembers[ch].push(me);
      }
    },
    leaveGroup() {
      if (!this.hiddenGroups.includes(this.selectedChannel)) {
        this.hiddenGroups = [...this.hiddenGroups, this.selectedChannel];
      }
      this.selectedChannel = null;
    },
  },
})
  .use(GraffitiPlugin, {
    graffiti: new GraffitiLocal(),
    // graffiti: new GraffitiRemote(),
  })
  .mount("#app");
