// ======================
// 1) 대전 지도 고정 설정
// ======================
const daejeonCenter = [36.3504, 127.3845];

// 대전 대략 경계(조금 넉넉하게)
const daejeonBounds = L.latLngBounds(
  L.latLng(36.22, 127.23), // SW
  L.latLng(36.48, 127.56)  // NE
);

const map = L.map("map", {
  center: daejeonCenter,
  zoom: 12,
  minZoom: 11,
  maxZoom: 18,
  maxBounds: daejeonBounds,
  maxBoundsViscosity: 1.0, // 밖으로 못 밀고 나가게
});

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "&copy; OpenStreetMap"
}).addTo(map);

map.fitBounds(daejeonBounds);

// ======================
// 2) 가게 이름 목록 (스크린샷 기반)
//    "가게 이름만" 표시
// ======================
const STORE_NAMES = [
  "삼정회관",
  "옆집에 소머리해장국",

  "황소집",
  "광천식당",
  "진로집",
  "동그라미",
  "희락반점",
  "태화장",
  "성심당",
  "우동야",
  "장인약과",

  "치앙마이방콕",

  "벽돌 곱창",
  "맛찬들",
  "일당 감자탕",
  "양가 양미",

  "맛소야",
  "놀부네집",

  "독도바다",

  "땡큐베리마치",
  "마들렌 몽심",
  "소금빵 하레하레",
  "휘낭시에 정동문화사",

  "태양커피",
  "향미각",
  "화목한 우리집",
  "유성즉석떡볶이",

  "짬뽕 한 그릇",
  "미세노센세"
];

// ======================
// 3) (중요) 지오코딩: 이름 → 좌표
//    Nominatim(OpenStreetMap) 사용
//    - 처음만 느림(요청 제한), 이후 localStorage 캐시로 빠름
// ======================
const statusEl = document.getElementById("status");
const btnLoad = document.getElementById("btnLoad");
const btnReset = document.getElementById("btnReset");

const CACHE_KEY = "daejeon_store_coords_v1";
let cache = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");

function saveCache() {
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function geocodeOne(name) {
  // 캐시에 있으면 재사용
  if (cache[name]) return cache[name];

  // "대전"을 같이 붙여서 검색 정확도 올림
  const q = encodeURIComponent(`${name} 대전`);
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${q}`;

  const res = await fetch(url, {
    headers: {
      "Accept": "application/json"
    }
  });

  if (!res.ok) return null;
  const data = await res.json();
  if (!data || data.length === 0) return null;

  const lat = Number(data[0].lat);
  const lon = Number(data[0].lon);

  // 대전 범위 안에 있는 좌표만 인정(엉뚱한 지역 방지)
  const pt = L.latLng(lat, lon);
  if (!daejeonBounds.contains(pt)) return null;

  cache[name] = { lat, lon };
  saveCache();
  return cache[name];
}

const markersLayer = L.layerGroup().addTo(map);

function addMarker(name, lat, lon) {
    function googleMapsUrl(name) {
        // 구글 지도에서 검색 → 결과 화면에서 리뷰 확인 가능
        const q = encodeURIComponent(`${name} 대전`);
        return `https://www.google.com/maps/search/?api=1&query=${q}`;
      }
      
      function addMarker(name, lat, lon) {
        const marker = L.marker([lat, lon]).addTo(markersLayer);
      
        // ✅ 팝업: 가게 이름 + 리뷰 보러가기 버튼
        marker.bindPopup(`
          <div style="min-width:180px;">
            <b>${name}</b><br/>
            <a href="${googleMapsUrl(name)}" target="_blank" rel="noopener noreferrer"
               style="display:inline-block;margin-top:8px;padding:6px 10px;border:1px solid #ddd;border-radius:10px;text-decoration:none;">
              리뷰 보러가기
            </a>
          </div>
        `);
      
        // (선택) 툴팁
        marker.bindTooltip(name, { permanent: false, direction: "top" });
      }
      
}

btnReset?.addEventListener("click", () => {
  localStorage.removeItem(CACHE_KEY);
  cache = {};
  markersLayer.clearLayers();
  statusEl.textContent = "좌표 캐시 초기화 완료";
});

btnLoad?.addEventListener("click", async () => {
  markersLayer.clearLayers();

  const total = STORE_NAMES.length;
  let ok = 0, fail = 0;

  statusEl.textContent = `불러오는 중... (0/${total})`;

  // Nominatim은 빠르게 몰아치면 막힐 수 있어서 1.1초 간격으로 천천히 요청
  for (let i = 0; i < total; i++) {
    const name = STORE_NAMES[i];

    // 캐시 있으면 딜레이 없이 바로
    if (cache[name]) {
      addMarker(name, cache[name].lat, cache[name].lon);
      ok++;
      statusEl.textContent = `불러오는 중... (${i + 1}/${total}) ✅${ok} ❌${fail}`;
      continue;
    }

    const coord = await geocodeOne(name);
    if (coord) {
      addMarker(name, coord.lat, coord.lon);
      ok++;
    } else {
      fail++;
    }

    statusEl.textContent = `불러오는 중... (${i + 1}/${total}) ✅${ok} ❌${fail}`;

    // 요청 간격(중요)
    await sleep(1100);
  }

  statusEl.textContent = `완료 ✅${ok} / ❌${fail} (실패는 이름이 너무 흔하거나 검색 결과가 대전 밖일 때)`;
});
