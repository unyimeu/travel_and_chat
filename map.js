import { createApp } from "vue";
import Dashboard from "./components/Dashboard.js";

// Mount Dashboard component using Vue
createApp({
  components: { Dashboard }
}).mount("#mapApp");

// Create a map centered on Tokyo
const map = L.map('map').setView([35.6895, 139.6917], 13); // [lat, lng], zoom

// Load OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Example markers
const markers = [
  { lat: 35.7128, lng: 139.7783, label: "User 1" },
  { lat: 35.7033, lng: 139.7430, label: "User 2" },
  { lat: 35.6992, lng: 139.7900, label: "Group A" },
];

markers.forEach(({ lat, lng, label }) => {
  L.marker([lat, lng]).addTo(map)
    .bindPopup(label);
});
