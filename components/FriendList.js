export default {
    name: "FriendList",
    data() {
      return {
        friendships: [],
      };
    },
    mounted() {
      this.$watch(
        () => this.$refs.friendsDiscover?.$data?.objects,
        (newObjects) => {
          const me = this.$graffitiSession?.value?.actor;
          if (!newObjects || !me) return;
          this.friendships = newObjects
            .filter((o) => o.value.user === me)
            .map((o) => o.value.friend);
        },
        { immediate: true }
      );
    },
    template: `
      <div class="friend-list-container">
        <h2>Your Friends</h2>
        <p v-if="friendships.length === 0">You currently have no friends.</p>
        <ul v-else>
          <li v-for="f in friendships" :key="f">{{ f }}</li>
        </ul>
  
        <graffiti-discover
          ref="friendsDiscover"
          :channels="[$graffitiSession?.value?.actor, 'friendships']"
          :schema="{
            properties: {
              value: {
                type: 'object',
                properties: {
                  type: { const: 'Friendship' },
                  user: { type: 'string' },
                  friend: { type: 'string' }
                },
                required: ['type', 'user', 'friend']
              }
            }
          }"
        />
      </div>
    `,
  };
  