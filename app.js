const daejeonCenter = [36.3504, 127.3845];

const map = L.map("map").setView(daejeonCenter, 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "&copy; OpenStreetMap"
}).addTo(map);

// 테스트 마커 1개
L.marker([36.3504, 127.3845]).addTo(map)
  .bindPopup("<b>대전 중심</b><br/>여기서 시작!");
