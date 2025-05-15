import { createApp } from "vue";
import Dashboard from "./components/Dashboard.js";

// Mount Dashboard
createApp({
  components: { Dashboard },
}).mount("#mapApp");

// Create map centered on Tokyo
const map = L.map("map").setView([35.6895, 139.6917], 13);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

// Static "you are here" marker
const myLocation = [35.6895, 139.6917];
L.marker(myLocation).addTo(map).bindPopup("You are here");

// Simulated static friends
const friends = [
  { name: "Alvin", lat: 35.693, lng: 139.7 },
  { name: "Sarah", lat: 35.685, lng: 139.71 },
  { name: "John", lat: 35.698, lng: 139.695 },
];

friends.forEach(({ name, lat, lng }) => {
  L.marker([lat, lng]).addTo(map).bindPopup(`${name} (friend)`);
});

const friendBtn = document.querySelectorAll(".menu-item span.label")[1]; // second button
if (friendBtn) {
  friendBtn.textContent = `👥 On Map ${friends.length}`;
}

const directionsBtn = document.querySelectorAll(".menu-item")[0]; // first button
let routeLayer = null;

if (directionsBtn) {
  const menu = document.createElement("div");
  menu.style.position = "absolute";
  menu.style.top = "80px";
  menu.style.left = "100px";
  menu.style.padding = "20px 24px";
  menu.style.background = "#fff";
  menu.style.border = "2px solid #888";
  menu.style.borderRadius = "12px";
  menu.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
  menu.style.display = "none";
  menu.style.zIndex = 999;
  menu.style.fontSize = "20px";
  menu.style.minWidth = "520px";
  menu.style.maxHeight = "600px";
  menu.style.lineHeight = "2";

  document.body.appendChild(menu);

  friends.forEach((friend) => {
    const btn = document.createElement("button");
    btn.textContent = friend.name;
    btn.style.display = "block";
    btn.style.margin = "4px 0";
    btn.style.width = "100%";
    btn.style.border = "none";
    btn.style.background = "#1e1e1e";
    btn.style.color = "white";
    btn.style.padding = "6px";
    btn.style.borderRadius = "5px";
    btn.style.cursor = "pointer";
    btn.addEventListener("click", () => {
      if (routeLayer) map.removeLayer(routeLayer);

      routeLayer = L.polyline([myLocation, [friend.lat, friend.lng]], {
        color: "blue",
        dashArray: "6",
      }).addTo(map);

      map.fitBounds(routeLayer.getBounds());

      directionsBtn.querySelector("span").textContent = `➡️ To ${friend.name}`;
      menu.style.display = "none";
    });
    menu.appendChild(btn);
  });

  // Toggle menu on button click
  directionsBtn.addEventListener("click", () => {
    menu.style.display = menu.style.display === "none" ? "block" : "none";
  });

  // Hide menu when clicking elsewhere
  window.addEventListener("click", (e) => {
    if (!menu.contains(e.target) && !directionsBtn.contains(e.target)) {
      menu.style.display = "none";
    }
  });
}
