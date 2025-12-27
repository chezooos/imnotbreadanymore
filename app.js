const map = L.map('map', { zoomControl: false }).setView([36.3504, 127.3845], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

let currentUser = null;   // 이메일
let currentTab = 'fav';
let userData = { favorites: [], reviews: [], likedReviews: [] };

// 기본 식당 목록
const defaultRestaurants = [
  { name: "삼정회관", area: "선화동", menu: "삼겹살, 양념꽃게장", phone: "042-252-0649", lat: 36.3314, lng: 127.4275 },
  { name: "소머리해장국", area: "선화동", menu: "소머리해장국", phone: "정보 없음", lat: 36.3310, lng: 127.4270 },
  { name: "황소집", area: "은행동", menu: "꼼장어, 숯불구이", phone: "042-256-7923", lat: 36.3275, lng: 127.4260 },
  { name: "광천식당", area: "은행동", menu: "두부두루치기", phone: "042-254-4519", lat: 36.3298, lng: 127.4248 },
  { name: "진로집", area: "은행동", menu: "두부두루치기", phone: "042-226-0914", lat: 36.3285, lng: 127.4255 },
  { name: "동그라미", area: "은행동", menu: "꼬마김밥, 우동", phone: "정보 없음", lat: 36.3290, lng: 127.4280 },
  { name: "희락반점", area: "은행동", menu: "유니짜장", phone: "042-256-0273", lat: 36.3305, lng: 127.4250 },
  { name: "태화장", area: "은행동", menu: "중식 (화상)", phone: "042-256-1044", lat: 36.3320, lng: 127.4320 },
  { name: "성심당", area: "은행동", menu: "튀김소보로", phone: "1588-8069", lat: 36.3278, lng: 127.4272 },
  { name: "성심당 우동야", area: "은행동", menu: "우동, 튀김", phone: "042-220-4131", lat: 36.3278, lng: 127.4272 },
  { name: "장인약과", area: "은행동", menu: "약과 디저트", phone: "정보 없음", lat: 36.3270, lng: 127.4285 },
  { name: "땡큐베리머치", area: "은행동", menu: "황치즈 케이크", phone: "042-252-0905", lat: 36.3265, lng: 127.4265 },
  { name: "치앙마이방콕", area: "소제동", menu: "태국음식", phone: "042-628-7890", lat: 36.3350, lng: 127.4390 },
  { name: "벽돌 곱창", area: "둔산동", menu: "한우곱창", phone: "042-485-9292", lat: 36.3485, lng: 127.3760 },
  { name: "맛찬들", area: "둔산동", menu: "숙성 삼겹살", phone: "042-485-6692", lat: 36.3490, lng: 127.3770 },
  { name: "일당 감자탕", area: "둔산동", menu: "뼈다귀 해장국", phone: "042-472-9449", lat: 36.3505, lng: 127.3790 },
  { name: "양가 양미", area: "둔산동", menu: "양곱창", phone: "정보 없음", lat: 36.3475, lng: 127.3780 },
  { name: "하레하레", area: "둔산동", menu: "소금빵", phone: "042-483-1595", lat: 36.3465, lng: 127.3810 },
  { name: "태양커피", area: "둔산동", menu: "아인슈페너", phone: "정보 없음", lat: 36.3510, lng: 127.3795 },
  { name: "맛소야", area: "중촌동", menu: "소고기 정육식당", phone: "042-222-2223", lat: 36.3430, lng: 127.4080 },
  { name: "놀부네집", area: "중촌동", menu: "소고기", phone: "정보 없음", lat: 36.3425, lng: 127.4075 },
  { name: "독도바다", area: "월평동", menu: "회, 해산물", phone: "042-482-0056", lat: 36.3580, lng: 127.3610 },
  { name: "짬뽕 한 그릇", area: "탄방동", menu: "짬뽕", phone: "042-488-0054", lat: 36.3440, lng: 127.3880 },
  { name: "미세노센세", area: "탄방동", menu: "일본식 카레", phone: "042-482-0390", lat: 36.3456, lng: 127.3891 },
  { name: "몽심", area: "한남대 인근", menu: "마들렌", phone: "정보 없음", lat: 36.3520, lng: 127.4220 },
  { name: "정동문화사", area: "정동", menu: "휘낭시에", phone: "042-223-5509", lat: 36.3330, lng: 127.4300 },
  { name: "향미각", area: "중리동", menu: "꼬막짬뽕", phone: "042-626-8252", lat: 36.3620, lng: 127.4250 },
  { name: "화목한 우리집", area: "유성", menu: "즉석 떡볶이", phone: "042-823-3334", lat: 36.3615, lng: 127.3440 }
];

let restaurants = [];
let localRestaurants = []; // 로컬 스토리지에 저장된 추가 식당

// 로컬 스토리지에서 데이터 로드
function loadLocalData() {
  // 추가된 식당 로드
  const saved = localStorage.getItem('localRestaurants');
  if (saved) {
    localRestaurants = JSON.parse(saved);
  }
  
  // 사용자 데이터 로드
  const savedUserData = localStorage.getItem('userData');
  if (savedUserData) {
    userData = JSON.parse(savedUserData);
  }
  
  // 로그인 정보 로드
  const savedUser = localStorage.getItem('currentUser');
  if (savedUser) {
    currentUser = savedUser;
    document.getElementById('auth-buttons').style.display = 'none';
    document.getElementById('user-info').style.display = 'flex';
    document.getElementById('display-user-id').innerText = savedUser.split('@')[0];
    document.getElementById('my-activity').style.display = 'block';
  }
}

// 로컬 스토리지에 데이터 저장
function saveLocalData() {
  localStorage.setItem('localRestaurants', JSON.stringify(localRestaurants));
  localStorage.setItem('userData', JSON.stringify(userData));
  if (currentUser) {
    localStorage.setItem('currentUser', currentUser);
  } else {
    localStorage.removeItem('currentUser');
  }
}

// 식당 목록 로드
function loadRestaurants() {
  restaurants = [...defaultRestaurants, ...localRestaurants];
  renderMarkers();
}

// 초기화
loadLocalData();
loadRestaurants();

// 마커 렌더링
function renderMarkers() {
  map.eachLayer(layer => { if (layer instanceof L.Marker) map.removeLayer(layer); });
  restaurants.forEach(rest => {
    const lat = Number(rest.lat);
    const lng = Number(rest.lng);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return;
    L.marker([lat, lng]).addTo(map).on('click', () => showDetail(rest.name));
  });
}

// 파일 선택 시 이름 표시
document.addEventListener('change', (e) => {
  if (e.target.id === 'review-image') {
    const fileName = e.target.files[0]?.name || "";
    document.getElementById('file-name-preview').innerText = fileName ? `📎 ${fileName}` : "";
  }
});

// 상세 페이지 표시
function showDetail(name) {
  const rest = restaurants.find(r => r.name === name);
  if (!rest) return;

  document.getElementById('initial-message').style.display = 'none';
  document.getElementById('res-detail-content').style.display = 'flex';
  document.getElementById('res-name').innerText = rest.name;
  document.getElementById('res-area').innerText = rest.area;
  document.getElementById('res-menu').innerText = rest.menu;
  document.getElementById('res-phone').innerText = rest.phone;

  const isFav = userData.favorites.includes(rest.name);
  const favBtn = document.getElementById('favorite-btn');
  favBtn.innerText = isFav ? "★" : "☆";
  favBtn.classList.toggle('active', isFav);

  renderReviews(rest.name);
  map.flyTo([Number(rest.lat), Number(rest.lng)], 16);
}

// 리뷰 렌더링
function renderReviews(resName) {
  const list = document.getElementById('review-list');
  list.innerHTML = "";
  userData.reviews.filter(r => r.resName === resName).forEach(rev => {
    const item = document.createElement('div');
    item.className = "review-item";
    const isLiked = userData.likedReviews.includes(rev.id);
    item.innerHTML = `
      <p style="font-size:14px; line-height:1.6; color:#444;">${rev.content}</p>
      ${rev.img ? `<img src="${rev.img}" class="review-img">` : ""}
      <button class="like-btn ${isLiked ? 'liked' : ''}" onclick="toggleLike(${rev.id})">❤️ ${isLiked ? '취소' : '좋아요'}</button>
    `;
    list.prepend(item);
  });
}

// 리뷰 등록 (이미지 포함) - 로컬 저장
function addReview() {
  if (!currentUser) return alert("로그인 후 이용 가능합니다.");
  const content = document.getElementById('review-content').value;
  const resName = document.getElementById('res-name').innerText;
  const imageFile = document.getElementById('review-image').files[0];

  if (!content) return alert("내용을 입력해주세요!");

  const saveReview = (imgSrc = "") => {
    userData.reviews.push({ id: Date.now(), resName, content, img: imgSrc });
    saveLocalData();
    document.getElementById('review-content').value = "";
    document.getElementById('review-image').value = "";
    document.getElementById('file-name-preview').innerText = "";
    showDetail(resName);
    updateActivityUI();
  };

  if (imageFile) {
    const reader = new FileReader();
    reader.onload = (e) => saveReview(e.target.result);
    reader.readAsDataURL(imageFile);
  } else {
    saveReview();
  }
}

// 좋아요 토글(로컬)
function toggleLike(id) {
  if (!currentUser) return alert("로그인 후 이용 가능합니다.");
  const idx = userData.likedReviews.indexOf(id);
  if (idx > -1) userData.likedReviews.splice(idx, 1);
  else userData.likedReviews.push(id);
  saveLocalData();
  showDetail(document.getElementById('res-name').innerText);
  updateActivityUI();
}

// 찜 토글(로컬)
function toggleFavorite() {
  if (!currentUser) return alert("로그인 후 이용 가능합니다.");
  const name = document.getElementById('res-name').innerText;
  const idx = userData.favorites.indexOf(name);
  if (idx > -1) userData.favorites.splice(idx, 1);
  else userData.favorites.push(name);
  saveLocalData();
  showDetail(name);
  updateActivityUI();
}

// 내 활동 탭 전환
function showActivity(type) {
  currentTab = type;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`tab-${type}`).classList.add('active');
  updateActivityUI();
}

// 내 활동 UI 업데이트(로컬)
function updateActivityUI() {
  const list = document.getElementById('activity-list');
  list.innerHTML = "";

  if (currentTab === 'fav') {
    userData.favorites.forEach(f => {
      const li = document.createElement('li');
      li.className = "activity-item";
      li.innerHTML = `📍 <strong>${f}</strong>`;
      li.onclick = () => showDetail(f);
      list.appendChild(li);
    });
  } else if (currentTab === 'rev') {
    userData.reviews.forEach(r => {
      const li = document.createElement('li');
      li.className = "activity-item";
      li.innerHTML = `<small style="color:#999">${r.resName}</small><p style="margin-top:5px;">${r.content.substring(0, 20)}...</p>`;
      li.onclick = () => showDetail(r.resName);
      list.appendChild(li);
    });
  } else if (currentTab === 'like') {
    userData.likedReviews.forEach(id => {
      const r = userData.reviews.find(rev => rev.id === id);
      if (r) {
        const li = document.createElement('li');
        li.className = "activity-item";
        li.innerHTML = `<small style="color:#999">${r.resName}</small><p style="margin-top:5px;">❤️ 좋아요 한 리뷰</p>`;
        li.onclick = () => showDetail(r.resName);
        list.appendChild(li);
      }
    });
  }
}

// 맛집 추가 (로컬 스토리지 저장)
function addRestaurant() {
  if (!currentUser) return alert("맛집 추가는 로그인 후 이용 가능합니다.");

  const name = document.getElementById('add-n').value.trim();
  const phone = document.getElementById('add-p').value.trim();
  const menu = document.getElementById('add-m').value.trim();
  const address = document.getElementById('add-a').value.trim();

  if (!name || !address) return alert("이름과 지역은 필수입니다!");

  const center = map.getCenter();

  // 로컬에 추가
  const newRestaurant = {
    name,
    area: address,
    menu: menu || "정보 없음",
    phone: phone || "정보 없음",
    lat: center.lat,
    lng: center.lng
  };

  localRestaurants.push(newRestaurant);
  saveLocalData();
  loadRestaurants();

  closeModal();

  // 추가 직후: 방금 추가한 가게 위치로 이동 + 상세 열기
  map.flyTo([center.lat, center.lng], 16);
  showDetail(name);
}

function openModal(type) {
  const area = document.getElementById('modal-content-area');
  document.getElementById('modal').style.display = 'block';

  if (type === 'login' || type === 'signup') {
    area.innerHTML = `
      <span onclick="closeModal()" style="position:absolute; right:25px; top:25px; cursor:pointer; font-size:24px; color:#aaa;">&times;</span>
      <h2 style="margin-bottom:30px; font-weight:800;">${type === 'login' ? '로그인' : '회원가입'}</h2>

      <div class="input-wrap"><label>이메일 주소</label><input type="email" id="u-email" placeholder="example@mail.com"></div>
      <div class="input-wrap"><label>비밀번호</label><input type="password" id="u-pw" placeholder="••••••••"></div>

      ${type === 'signup'
        ? `<div class="input-wrap"><label>닉네임</label><input type="text" id="u-nick" placeholder="닉네임"></div>`
        : ``}

      <button class="btn-primary" style="width:100%; height:55px; font-size:16px; margin-top:10px;" onclick="handleAuth('${type}')">확인</button>
    `;
  } else if (type === 'addRes') {
    area.innerHTML = `
      <span onclick="closeModal()" style="position:absolute; right:25px; top:25px; cursor:pointer; font-size:24px; color:#aaa;">&times;</span>
      <h2 style="margin-bottom:30px; font-weight:800;">새 맛집 추가</h2>
      <div class="input-wrap"><label>가게 이름</label><input id="add-n" placeholder="식당명을 입력하세요"></div>
      <div class="input-wrap"><label>전화번호</label><input id="add-p" placeholder="042-000-0000"></div>
      <div class="input-wrap"><label>대표 메뉴</label><input id="add-m" placeholder="가장 맛있는 메뉴"></div>
      <div class="input-wrap"><label>지역</label><input id="add-a" placeholder="예: 둔산동"></div>
      <button class="btn-primary" style="width:100%; height:55px; font-size:16px; margin-top:10px;" onclick="addRestaurant()">등록하기</button>
    `;
  }
}

function closeModal() {
  document.getElementById('modal').style.display = 'none';
}

// 로그인/회원가입 (로컬 스토리지 기반)
function handleAuth(type) {
  const email = document.getElementById('u-email').value.trim();
  const password = document.getElementById('u-pw').value.trim();
  const nickname = type === 'signup' ? document.getElementById('u-nick').value.trim() : null;

  if (!email || !password) return alert("이메일/비밀번호를 입력해주세요.");
  if (type === 'signup' && !nickname) return alert("닉네임을 입력해주세요.");

  // 간단한 로컬 인증 (실제 검증 없이 저장만)
  if (type === 'signup') {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    if (users[email]) {
      return alert("이미 가입된 이메일입니다.");
    }
    users[email] = { password, nickname };
    localStorage.setItem('users', JSON.stringify(users));
  }

  // 로그인 처리
  const users = JSON.parse(localStorage.getItem('users') || '{}');
  if (!users[email]) {
    return alert("가입되지 않은 이메일입니다. 회원가입을 먼저 해주세요.");
  }

  currentUser = email;
  saveLocalData();

  document.getElementById('auth-buttons').style.display = 'none';
  document.getElementById('user-info').style.display = 'flex';
  document.getElementById('display-user-id').innerText = users[email].nickname || email.split('@')[0];
  document.getElementById('my-activity').style.display = 'block';

  closeModal();
}

// 로그아웃
function logout() {
  currentUser = null;
  localStorage.removeItem('currentUser');
  document.getElementById('auth-buttons').style.display = 'flex';
  document.getElementById('user-info').style.display = 'none';
  document.getElementById('my-activity').style.display = 'none';
  userData = { favorites: [], reviews: [], likedReviews: [] };
  saveLocalData();
}

// 검색
document.getElementById('search-btn').onclick = () => {
  const q = document.getElementById('search-input').value;
  const r = restaurants.find(res => res.name.includes(q));
  if (r) showDetail(r.name);
  else alert("검색 결과가 없습니다.");
};
