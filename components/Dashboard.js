export default {
  name: "Dashboard",
  template: `
      <div class="dashboard-sidebar">
        <!-- Back Button -->
        <div class="sidebar-header">
          <button  class="back-button"
          @click="backButton"><</button>
        </div>
  
        <!-- Profile Picture and Info -->
        <div class="profile-section">
          <img 
            :src="profile.icon || 'components/images/blankprofile.png'" 
            class="profile-pic" 
            alt="Profile Picture" 
          />
          <div v-if="profile.name || profile.pronouns || profile.bio" class="profile-info">
            <strong>{{ profile.name }}</strong><br />
            <span>{{ profile.pronouns }}</span>
            <p class="bio" v-if="profile.bio">{{ profile.bio }}</p>
          </div>
          <button 
            @click="startProfileEdit" 
            class="logic small" 
            style="color: black; background-color: #e0e0e0; padding: 6px 12px; border-radius: 6px; margin-top: 10px;"
          >
            Edit Profile
          </button>
        </div>
        <div v-if="showProfileEditor" class="profile-panel">
          <label>Name:</label>
          <input v-model="profileDraft.name" type="text" placeholder="e.g., Alex" />
          <label>Pronouns:</label>
          <input v-model="profileDraft.pronouns" type="text" placeholder="e.g., they/them" />
          <label>Bio:</label>
          <textarea v-model="profileDraft.bio"></textarea>
          <label>Profile Pic URL:</label>
          <input v-model="profileDraft.icon" type="text" />
    
          <button class="logic" @click="saveProfile" style="color: black; background-color:rgb(81, 196, 71); padding: 6px 12px; border-radius: 6px; margin-top: 10px;">Save</button >
          <button class="logic" @click="showProfileEditor = false" style="background-color: red; color: white">
            Cancel
          </button>
        </div>
  
        <div class="sidebar-buttons">
          <button class="icon-button"><span>🕒</span> 7:00 pm</button>
          <button class="icon-button" @click="openMap"><span>📍</span> Tokyo, JP</button>
          <button class="icon-button" @click="openFriends"><span>✔️</span> Status: ON</button>
          <button class="icon-button"><span>🔕</span> Notifications 0</button>
          <button class="icon-button" @click="openFriends"><span>👤</span> Friends 3</button>
          <button class="icon-button"><span>⚙️</span> Settings</button>
        </div>
  
        <!-- Logout Button at Bottom -->
        <div class="logout-wrapper">
          <button class="logic logout-button" @click="handleLogout">
            <img id="logoutbutton" src="images/logout.png" alt="Log out" />
          </button>
        </div>
  
        <!-- Profile Editor Panel -->
        
      </div>
    `,

  data() {
    return {
      profile: {
        name: "",
        pronouns: "",
        bio: "",
        icon: "",
      },
      profileDraft: {},
      showProfileEditor: false,
    };
  },

  methods: {
    startProfileEdit() {
      this.profileDraft = { ...this.profile };
      this.showProfileEditor = true;
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
      this.profile = { ...this.profileDraft };

      await this.$graffiti.put(profileObject, session);
      this.showProfileEditor = false;
    },

    async handleLogout() {
      await this.$graffiti.logout(this.$graffitiSession.value);
      window.location.href = "index.html";
    },
    async backButton() {
      window.location.href = "intermediate.html";
    },
    async openMap() {
      window.location.href = "map.html";
    },
    async openFriends() {
      window.location.href = "add-friend.html";
    },
  },
};
