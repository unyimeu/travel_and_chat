export default {
  name: "AddFriend",
  data() {
    return {
      friendName: "",
      statusMessage: "",
    };
  },
  methods: {
    async sendFriendRequest() {
      const session = this.$graffitiSession.value;
      const name = this.friendName.trim();

      if (!name) {
        this.statusMessage = "Please enter a name.";
        setTimeout(() => (this.statusMessage = ""), 3000);
        return;
      }

      await this.$graffiti.put(
        {
          value: {
            type: "Friend",
            name: name,
            describes: session.actor,
            timestamp: Date.now(),
          },
          channels: ["designftw"],
        },
        session
      );

      this.statusMessage = "Friend request sent!";
      this.friendName = "";
      setTimeout(() => (this.statusMessage = ""), 3000);
    },
  },

  template: `
    <div class="add-friend-container">
      <h2>ADD FRIEND</h2>
      <p>Type a name to add them as a friend:</p>
      <div class="add-friend-form">
  <input v-model="friendName" type="text" placeholder="Insert username" />
  <button @click="sendFriendRequest">Send Request</button>
</div>

      <p v-if="statusMessage">{{ statusMessage }}</p>

      <h3 style="margin-top: 30px;">Your Friends</h3>

      <graffiti-discover
        :channels="['designftw']"
        :schema="{
          properties: {
            value: {
              required: ['type', 'name'],
              properties: {
                type: { const: 'Friend' },
                name: { type: 'string' }
              }
            }
          }
        }"
        v-slot="{ objects }"
      >
        <p v-if="objects.length === 0">You currently have no friends.</p>
        <ul v-else class="friend-list">
          <li v-for="f in objects" :key="f.url">
            <img src="components/images/blankprofile.png" class="friend-avatar" alt="avatar" />

            <span class="friend-name">{{ f.value.name }}</span>
          </li>
        </ul>
      </graffiti-discover>
    </div>
  `,
};
