import { useState } from "react";
import "./Main.css";
import ItemRegister from "./ItemRegister";

const MAIN_CATEGORIES = [
  { id:"촬영장비", label:"촬영 장비", icon:"📷", color:"#EEF2FF" },
  { id:"등산장비", label:"등산 장비", icon:"🏔️", color:"#F0FDF4" },
  { id:"공구",     label:"공구",     icon:"🔧", color:"#FFF7ED" },
  { id:"캠핑",     label:"캠핑",     icon:"⛺", color:"#F0F9FF" },
  { id:"스포츠",   label:"스포츠",   icon:"⚽", color:"#FFF1F2" },
  { id:"음향장비", label:"음향 장비", icon:"🎙️", color:"#FAF5FF" },
  { id:"드론",     label:"드론",     icon:"🚁", color:"#ECFDF5" },
  { id:"기타",     label:"기타",     icon:"📦", color:"#F8FAFC" },
];
const FILTER_CATEGORIES = ["전체","촬영장비","등산장비","공구","캠핑","스포츠","음향장비","드론","기타"];

const ITEMS = [
  { id:1,  name:"소니 A7IV 풀프레임 미러리스",  category:"촬영장비", price:80000,  rating:4.9, reviews:34, status:"available", location:"서울 마포구",  image:"📷", seller:"김민준", sellerRating:4.8, sellerTrades:47, desc:"최신 풀프레임 미러리스 카메라. 배터리 2개, SD카드 포함. 케이스와 함께 대여 가능합니다." },
  { id:2,  name:"DJI 매빅3 프로 드론",          category:"드론",     price:120000, rating:4.8, reviews:22, status:"available", location:"서울 강남구",  image:"🚁", seller:"이서연", sellerRating:5.0, sellerTrades:31, desc:"4/3 CMOS 센서 탑재 프로 드론. 비행 시간 43분. 여행, 촬영, 측량 등 다목적 활용 가능합니다." },
  { id:3,  name:"고다이 LED 스튜디오 조명 세트", category:"촬영장비", price:45000,  rating:4.7, reviews:18, status:"rented",    location:"경기 성남시",  image:"💡", seller:"박지훈", sellerRating:4.6, sellerTrades:22, desc:"스튜디오급 LED 조명 2개 세트. 색온도 3200K~5600K 조절 가능. 삼각대 포함." },
  { id:4,  name:"젠하이저 MKH416 샷건 마이크",  category:"음향장비", price:35000,  rating:4.9, reviews:41, status:"available", location:"서울 용산구",  image:"🎙️", seller:"최수아", sellerRating:4.9, sellerTrades:58, desc:"방송용 샷건 마이크. XLR 케이블 및 쇼크마운트 포함. 야외 촬영에 최적화." },
  { id:5,  name:"시그마 50mm f/1.4 Art 렌즈",   category:"촬영장비", price:30000,  rating:4.6, reviews:15, status:"available", location:"서울 은평구",  image:"🔭", seller:"정도현", sellerRating:4.7, sellerTrades:19, desc:"Art 라인 대구경 표준 렌즈. 보케 표현 탁월. 소니 E마운트 어댑터 포함." },
  { id:6,  name:"맨프로토 055 카본 삼각대",      category:"촬영장비", price:20000,  rating:4.5, reviews:29, status:"available", location:"인천 남동구", image:"📐", seller:"강예진", sellerRating:4.5, sellerTrades:14, desc:"카본 파이버 경량 삼각대. 최대 높이 170cm. 볼헤드 포함. 여행용으로 탁월." },
  { id:7,  name:"캐논 EOS R5 8K 미러리스",      category:"촬영장비", price:100000, rating:5.0, reviews:12, status:"available", location:"서울 송파구", image:"📸", seller:"윤재원", sellerRating:5.0, sellerTrades:9,  desc:"8K RAW 동영상 촬영 가능. 배터리 3개 포함. 보증 기간 내 기기 완전 보장 대여." },
  { id:8,  name:"로데 NT-USB 콘덴서 마이크",     category:"음향장비", price:18000,  rating:4.4, reviews:37, status:"rented",    location:"서울 마포구",  image:"🎤", seller:"임지민", sellerRating:4.3, sellerTrades:26, desc:"USB 연결형 콘덴서 마이크. 팝필터, 스탠드 포함. 팟캐스트·보이스 레코딩에 최적." },
  { id:9,  name:"블랙다이아몬드 등산화",          category:"등산장비", price:15000,  rating:4.7, reviews:55, status:"available", location:"서울 노원구",  image:"🥾", seller:"한소희", sellerRating:4.8, sellerTrades:63, desc:"방수 고어텍스 등산화. 270mm(42 사이즈). 발목 지지력 탁월. 세척 완료 상태." },
  { id:10, name:"마키타 충전 드릴 드라이버",     category:"공구",     price:12000,  rating:4.6, reviews:43, status:"available", location:"경기 수원시",  image:"🔧", seller:"오성현", sellerRating:4.6, sellerTrades:38, desc:"18V 리튬이온 배터리 2개 포함. 비트 세트 32종 제공. 가정용·인테리어 공사 적합." },
  { id:11, name:"콜맨 4인용 텐트",               category:"캠핑",     price:25000,  rating:4.8, reviews:67, status:"available", location:"경기 가평군",  image:"⛺", seller:"송미래", sellerRating:4.9, sellerTrades:71, desc:"방수 4인용 돔 텐트. 폴대, 팩, 가방 포함. 세척 후 보관 상태 양호." },
  { id:12, name:"살로몬 등산 스틱 세트",          category:"등산장비", price:8000,   rating:4.5, reviews:31, status:"available", location:"서울 도봉구",  image:"🏔️", seller:"권태양", sellerRating:4.4, sellerTrades:18, desc:"알루미늄 경량 등산스틱 2개 세트. 길이 조절 가능. 고무 팁 예비 1쌍 포함." },
];

const CHAT_LIST = [
  { id:1, name:"이서연", item:"DJI 매빅3 프로 드론",     lastMsg:"네, 내일 오전 10시에 뵙겠습니다!", time:"방금",   unread:2 },
  { id:2, name:"한소희", item:"블랙다이아몬드 등산화",   lastMsg:"사이즈 270 맞으시죠?",              time:"5분 전", unread:0 },
  { id:3, name:"오성현", item:"마키타 충전 드릴",        lastMsg:"대여 완료되셨나요?",                time:"1시간 전", unread:1 },
  { id:4, name:"송미래", item:"콜맨 4인용 텐트",         lastMsg:"감사합니다 잘 사용했어요!",         time:"어제",   unread:0 },
];

const MY_RENTALS = [
  { id:201, name:"DJI 매빅3 프로 드론", owner:"이서연", price:120000, status:"active", date:"5/15 ~ 5/17", image:"🚁" },
  { id:202, name:"콜맨 4인용 텐트",     owner:"송미래", price:25000,  status:"done",   date:"5/10 ~ 5/12", image:"⛺" },
  { id:203, name:"젠하이저 마이크",     owner:"최수아", price:35000,  status:"done",   date:"4/28 ~ 4/30", image:"🎙️" },
];

const MY_ITEMS_DATA = [
  { id:101, name:"니콘 Z6II 미러리스", category:"촬영장비", price:65000, status:"available", image:"📷", reviews:8,  rating:4.7, seller:"나", sellerRating:4.9, sellerTrades:12, desc:"내가 등록한 물품입니다.", location:"서울" },
  { id:102, name:"고프로 히어로 12",   category:"촬영장비", price:28000, status:"rented",    image:"🎥", reviews:15, rating:4.9, seller:"나", sellerRating:4.9, sellerTrades:12, desc:"내가 등록한 물품입니다.", location:"서울" },
];

const FULL_CATEGORIES = [
  {
    group: "촬영·영상",
    items: ["카메라/DSLR", "미러리스", "드론", "짐벌/스태빌라이저", "조명 장비", "삼각대", "렌즈", "액션캠"],
  },
  {
    group: "음향·방송",
    items: ["마이크", "스피커", "앰프/믹서", "헤드폰/이어폰", "레코더", "방송 장비"],
  },
  {
    group: "아웃도어·캠핑",
    items: ["텐트", "침낭/매트", "캠핑 의자/테이블", "등산화", "등산 스틱", "배낭", "랜턴"],
  },
  {
    group: "공구·DIY",
    items: ["전동 드릴", "그라인더", "측정 공구", "용접 장비", "사다리", "발전기"],
  },
  {
    group: "스포츠·레저",
    items: ["자전거", "킥보드/전동", "골프 장비", "서핑/수상레저", "스키/보드", "헬스 기구", "라켓 스포츠"],
  },
  {
    group: "디지털·가전",
    items: ["노트북", "태블릿", "빔프로젝터", "게임기", "3D 프린터", "VR 기기"],
  },
  {
    group: "파티·이벤트",
    items: ["포토부스", "조명/무드등", "현수막/배너", "테이블웨어", "음향 세트"],
  },
  {
    group: "기타",
    items: ["악기", "미술 도구", "공연 소품", "기타 장비"],
  },
];


function ChatRoom({ chat, onBack }) {
  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState([
    { id:1, from:"other", text:"안녕하세요! 물품 대여 문의드립니다.", time:"14:20" },
    { id:2, from:"me",    text:"네 안녕하세요! 어떤 날짜로 생각하고 계세요?", time:"14:21" },
    { id:3, from:"other", text:`${chat.item} 5월 15일부터 17일까지 대여 가능할까요?`, time:"14:22" },
    { id:4, from:"me",    text:"네, 가능합니다! 직거래 가능하시죠?", time:"14:23" },
    { id:5, from:"other", text:chat.lastMsg, time:"14:30" },
  ]);

  const send = () => {
    if (!msg.trim()) return;
    setMessages(prev => [...prev, {
      id: Date.now(), from:"me", text: msg,
      time: new Date().toLocaleTimeString("ko-KR", { hour:"2-digit", minute:"2-digit" })
    }]);
    setMsg("");
  };

  return (
    <div className="chatroom-wrap">
      <div className="chatroom-header">
        <button className="nav-back" onClick={onBack}><span>←</span></button>
        <div className="chatroom-title-col">
          <div className="chatroom-name">{chat.name}</div>
          <div className="chatroom-item-tag">📦 {chat.item}</div>
        </div>
        <button className="btn-icon-nav">⋮</button>
      </div>

      <div className="chatroom-body">
        <div className="chat-date-divider"><span>오늘</span></div>
        {messages.map(m => (
          <div key={m.id} className={`chat-bubble-wrap ${m.from}`}>
            {m.from === "other" && <div className="chat-b-avatar">{chat.name[0]}</div>}
            <div className="chat-bubble-col">
              <div className={`chat-bubble ${m.from}`}>{m.text}</div>
              <div className="chat-bubble-time">{m.time}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="chatroom-input-bar">
        <button className="chat-attach-btn">＋</button>
        <input
          className="chatroom-input"
          placeholder="메시지를 입력하세요..."
          value={msg}
          onChange={e => setMsg(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
        />
        <button className="chat-send-btn" onClick={send}>↑</button>
      </div>
    </div>
  );
}

export default function Main({ user, onLogout }) {
  const [page, setPage]               = useState("home");
  const [search, setSearch]           = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCat, setFilterCat]     = useState("전체");
  const [selected, setSelected]       = useState(null);
  const [prevPage, setPrevPage]       = useState("home");
  const [chatOpen, setChatOpen]       = useState(null);
  const [myTab, setMyTab]             = useState("rentals");
  const [wishlist, setWishlist]       = useState([]);

  const doSearch    = (q) => { setSearchQuery(q); setFilterCat("전체"); setPage("search"); };
  const openCat     = (id) => { setFilterCat(id); setSearchQuery(""); setPage("search"); };
  const goDetail    = (item, from) => { setSelected(item); setPrevPage(from ?? page); setPage("detail"); };
  const toggleWish  = (id) => setWishlist(p => p.includes(id) ? p.filter(i => i !== id) : [...p, id]);

  const filtered = ITEMS.filter(item => {
    const matchCat    = filterCat === "전체" || item.category === filterCat;
    const matchSearch = !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const totalUnread = CHAT_LIST.reduce((a, c) => a + c.unread, 0);

  const BottomNav = () => (
    <div className="bottom-nav">
      {[
        { id:"home",   icon:"🏠", label:"홈" },
        { id:"search", icon:"🔍", label:"검색" },
        { id:"register", special:true },
        { id:"chat",   icon:"💬", label:"채팅", badge: totalUnread },
        { id:"mypage", icon:"👤", label:"마이" },
      ].map(tab =>
        tab.special ? (
          <button key="reg" className="bottom-nav-add" onClick={() => setPage("register")}>
            <span className="bnav-plus">＋</span>
          </button>
        ) : (
          <button
            key={tab.id}
            className={`bottom-nav-btn ${page === tab.id ? "active" : ""}`}
            onClick={() => { if (tab.id === "chat") setChatOpen(null); setPage(tab.id); }}
          >
            <div className="bnav-icon-wrap">
              <span className="bnav-icon">{tab.icon}</span>
              {tab.badge > 0 && <span className="bnav-badge">{tab.badge}</span>}
            </div>
            <span className="bnav-label">{tab.label}</span>
          </button>
        )
      )}
    </div>
  );

  const ItemCard = ({ item, from }) => (
    <div className="item-card" onClick={() => goDetail(item, from)}>
      <div className="card-img">
        <span>{item.image}</span>
        <button
          className={`card-wish ${wishlist.includes(item.id) ? "on" : ""}`}
          onClick={e => { e.stopPropagation(); toggleWish(item.id); }}
        >
          {wishlist.includes(item.id) ? "❤️" : "🤍"}
        </button>
      </div>
      <div className="card-body">
        <div className="card-top">
          <span className="card-cat">{item.category}</span>
          <span className={`card-status ${item.status}`}>{item.status === "available" ? "대여 가능" : "대여 중"}</span>
        </div>
        <h3 className="card-name">{item.name}</h3>
        <div className="card-meta">
          <span>📍 {item.location}</span>
          <span>⭐ {item.rating}</span>
        </div>
        <div className="card-footer">
          <span className="card-price">{item.price.toLocaleString()}원<span className="card-unit">/일</span></span>
          <span className="card-review">{item.reviews}개 리뷰</span>
        </div>
      </div>
    </div>
  );

  // ── DETAIL ──────────────────────────────────────
// ── CATEGORY FULL ──────────────────────────────────────
if (page === "category") {
  return (
    <div className="main-bg">
      <nav className="navbar">
        <button className="nav-back" onClick={() => setPage("home")}><span>←</span></button>
        <div className="nav-logo">전체 카테고리</div>
        <div style={{ width: 36 }} />
      </nav>

      <div className="fullcat-wrap">
        {FULL_CATEGORIES.map((group) => (
          <div key={group.group} className="fullcat-group">
            <div className="fullcat-group-title">{group.group}</div>
            <div className="fullcat-item-grid">
              {group.items.map((item) => (
                <button
                  key={item}
                  className="fullcat-item-btn"
                  onClick={() => { setFilterCat("전체"); setSearchQuery(item); setPage("search"); }}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ height: 80 }} />
      <BottomNav />
    </div>
  );
}


  if (page === "detail" && selected) {
    return (
      <div className="main-bg">
        <nav className="navbar">
          <button className="nav-back" onClick={() => setPage(prevPage)}><span>←</span></button>
          <div className="nav-logo">⚡ BILLIM</div>
          <div className="nav-right">
            <button
              className={`btn-icon-nav ${wishlist.includes(selected.id) ? "wish-on" : ""}`}
              onClick={() => toggleWish(selected.id)}
            >
              {wishlist.includes(selected.id) ? "❤️" : "🤍"}
            </button>
            <button className="btn-icon-nav">⋮</button>
          </div>
        </nav>

        <div className="detail-wrap">
          <div className="detail-img-box">
            <span className="detail-emoji">{selected.image}</span>
            <span className={`detail-status-badge ${selected.status}`}>
              {selected.status === "available" ? "✓ 대여 가능" : "✗ 대여 중"}
            </span>
          </div>

          <div className="detail-section">
            <div className="detail-cat-row">
              <span className="detail-cat-tag">{selected.category}</span>
              <span className="detail-location">📍 {selected.location}</span>
            </div>
            <h1 className="detail-title">{selected.name}</h1>
            <div className="detail-price-row">
              <span className="detail-price-num">{selected.price.toLocaleString()}원</span>
              <span className="detail-price-unit"> / 1일</span>
            </div>
            <div className="detail-rating-row">
              <span className="detail-star">⭐ {selected.rating}</span>
              <span className="detail-reviews">· 리뷰 {selected.reviews}개</span>
            </div>
          </div>

          <div className="detail-divider" />

          <div className="detail-section">
            <h3 className="detail-section-title">대여 기간 선택</h3>
            <div className="date-picker-row">
              <div className="date-picker-btn">
                <div className="dp-label">시작일</div>
                <div className="dp-val">날짜 선택</div>
              </div>
              <div className="dp-arrow">→</div>
              <div className="date-picker-btn">
                <div className="dp-label">반납일</div>
                <div className="dp-val">날짜 선택</div>
              </div>
            </div>
          </div>

          <div className="detail-divider" />

          <div className="detail-section">
            <h3 className="detail-section-title">물품 설명</h3>
            <p className="detail-desc-text">{selected.desc}</p>
            <p className="detail-notice">📌 대여 전·후 사진 촬영 필수. 반납 시 AI 이미지 비교 진행.</p>
          </div>

          <div className="detail-divider" />

          <div className="detail-section">
            <h3 className="detail-section-title">판매자 정보</h3>
            <div className="seller-card">
              <div className="seller-avatar">{selected.seller[0]}</div>
              <div className="seller-info">
                <div className="seller-name">{selected.seller}</div>
                <div className="seller-meta">⭐ {selected.sellerRating} · 거래 {selected.sellerTrades}회</div>
              </div>
              <button className="btn-chat" onClick={() => { setChatOpen(CHAT_LIST[0]); setPage("chat"); }}>채팅</button>
            </div>
          </div>

          <div style={{ height:120 }} />
        </div>

        <div className="detail-bottom-bar">
          <div className="detail-price-mini">
            <span className="dpm-price">{selected.price.toLocaleString()}원</span>
            <span className="dpm-unit">/일</span>
          </div>
          {selected.status === "available" ? (
            <button className="btn-reserve" onClick={() => alert("예약 기능은 백엔드 연결 후 사용 가능합니다.")}>예약하기</button>
          ) : (
            <button className="btn-reserve disabled">현재 대여 중</button>
          )}
        </div>
      </div>
    );
  }

  // ── REGISTER ──────────────────────────────────────
  if (page === "register") {
    return <ItemRegister onBack={() => setPage("home")} onComplete={() => setPage("home")} user={user} />;
  }

  // ── CHAT ──────────────────────────────────────────
  if (page === "chat") {
    if (chatOpen) {
      return (
        <div className="main-bg">
          <ChatRoom chat={chatOpen} onBack={() => setChatOpen(null)} />
          <BottomNav />
        </div>
      );
    }
    return (
      <div className="main-bg">
        <nav className="navbar">
          <div className="nav-logo">⚡ BILLIM</div>
          <div className="nav-right"><button className="btn-icon-nav">✏️</button></div>
        </nav>

        <div className="page-top-wrap">
          <h2 className="page-title">채팅</h2>
          {totalUnread > 0 && <span className="page-unread-badge">{totalUnread}개 읽지 않음</span>}
        </div>

        <div className="chat-list-wrap">
          {CHAT_LIST.map(chat => (
            <div key={chat.id} className="chat-item" onClick={() => setChatOpen(chat)}>
              <div className="chat-avatar-wrap">
                <div className="chat-avatar">{chat.name[0]}</div>
                {chat.unread > 0 && <span className="chat-avatar-dot" />}
              </div>
              <div className="chat-item-body">
                <div className="chat-item-top">
                  <span className="chat-name">{chat.name}</span>
                  <span className="chat-time">{chat.time}</span>
                </div>
                <div className="chat-item-item">📦 {chat.item}</div>
                <div className="chat-item-bottom">
                  <span className="chat-last-msg">{chat.lastMsg}</span>
                  {chat.unread > 0 && <span className="chat-unread">{chat.unread}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ height:80 }} />
        <BottomNav />
      </div>
    );
  }

  // ── MY PAGE ──────────────────────────────────────
  if (page === "mypage") {
    return (
      <div className="main-bg">
        <nav className="navbar">
          <div className="nav-logo">⚡ BILLIM</div>
          <div className="nav-right">
            <button className="btn-icon-nav">⚙️</button>
            <button className="btn-ghost sm" onClick={onLogout}>로그아웃</button>
          </div>
        </nav>

        <div className="my-profile-card">
          <div className="my-avatar-big">{user?.name?.[0] || "U"}</div>
          <div className="my-name">{user?.name || "사용자"}</div>
          <div className="my-email">{user?.email}</div>
          <div className="my-stats-row">
            <div className="my-stat"><span className="my-stat-val">12</span><span className="my-stat-lbl">대여</span></div>
            <div className="my-stat-div" />
            <div className="my-stat"><span className="my-stat-val">3</span><span className="my-stat-lbl">등록</span></div>
            <div className="my-stat-div" />
            <div className="my-stat"><span className="my-stat-val">4.9 ⭐</span><span className="my-stat-lbl">평점</span></div>
          </div>
        </div>

        <div className="my-quick-row">
          {[
            { icon:"📦", label:"대여 중", count:1 },
            { icon:"❤️", label:"찜 목록", count:wishlist.length },
            { icon:"⭐", label:"리뷰",   count:5 },
            { icon:"🔔", label:"알림",   count:2 },
          ].map((q, i) => (
            <div key={i} className="my-quick-btn">
              <span className="my-quick-icon">{q.icon}</span>
              <span className="my-quick-count">{q.count}</span>
              <span className="my-quick-lbl">{q.label}</span>
            </div>
          ))}
        </div>

        <div className="my-tabs">
          {[{id:"rentals",label:"대여 내역"},{id:"myitems",label:"내 물품"},{id:"reviews",label:"리뷰"}].map(t => (
            <button key={t.id} className={`my-tab-btn ${myTab === t.id ? "active" : ""}`} onClick={() => setMyTab(t.id)}>{t.label}</button>
          ))}
        </div>

        <div className="my-tab-content">
          {myTab === "rentals" && MY_RENTALS.map(r => (
            <div key={r.id} className="rental-card">
              <div className="rental-img">{r.image}</div>
              <div className="rental-body">
                <span className={`rental-status-tag ${r.status}`}>{r.status === "active" ? "대여중" : "완료"}</span>
                <div className="rental-name">{r.name}</div>
                <div className="rental-meta">👤 {r.owner} · 📅 {r.date}</div>
                <div className="rental-price">{r.price.toLocaleString()}원</div>
                {r.status === "done" && (
                  <button className="review-write-btn">리뷰 작성하기 →</button>
                )}
              </div>
            </div>
          ))}

          {myTab === "myitems" && (
            <div>
              <button className="add-item-btn" onClick={() => setPage("register")}>＋ 새 물품 등록</button>
              <div className="item-grid">
                {MY_ITEMS_DATA.map(item => <ItemCard key={item.id} item={item} from="mypage" />)}
              </div>
            </div>
          )}

          {myTab === "reviews" && (
            <div className="empty-state" style={{ paddingTop:"60px" }}>
              <div className="empty-icon">⭐</div>
              <p>아직 작성한 리뷰가 없어요</p>
              <p style={{ fontSize:"13px", color:"var(--text3)", marginTop:"4px" }}>대여 완료 후 리뷰를 남겨보세요</p>
            </div>
          )}
        </div>

        <div style={{ height:80 }} />
        <BottomNav />
      </div>
    );
  }

  // ── SEARCH ──────────────────────────────────────
  if (page === "search") {
    return (
      <div className="main-bg">
        <nav className="navbar">
          <button className="nav-back" onClick={() => { setPage("home"); setSearchQuery(""); setFilterCat("전체"); }}><span>←</span></button>
          <div className="nav-logo">⚡ BILLIM</div>
          <button className="btn-icon-nav">⊞</button>
        </nav>

        <div className="search-page-top">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input className="search-input" placeholder="장비 이름, 카테고리 검색..." value={search}
              onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && doSearch(search)} />
            {search && <button className="search-clear" onClick={() => { setSearch(""); setSearchQuery(""); setFilterCat("전체"); }}>✕</button>}
            <button className="search-submit" onClick={() => doSearch(search)}>검색</button>
          </div>
        </div>

        <div className="search-content">
          <div className="cat-row"
            onMouseDown={e => { const el = e.currentTarget; el.isDragging = true; el.startX = e.pageX - el.scrollLeft; }}
            onMouseMove={e => { const el = e.currentTarget; if (!el.isDragging) return; el.scrollLeft = e.pageX - el.startX; }}
            onMouseUp={e => { e.currentTarget.isDragging = false; }}
            onMouseLeave={e => { e.currentTarget.isDragging = false; }}
          >
            {FILTER_CATEGORIES.map(cat => (
              <button key={cat} className={`cat-btn ${filterCat === cat ? "active" : ""}`} onClick={() => setFilterCat(cat)}>{cat}</button>
            ))}
          </div>

          <div className="result-info">
            <span className="result-count">{filtered.length}개</span>의 장비
            {searchQuery && <span className="result-keyword"> · "{searchQuery}" 검색 결과</span>}
            {filterCat !== "전체" && !searchQuery && <span className="result-keyword"> · {filterCat}</span>}
          </div>

          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <p>검색 결과가 없습니다</p>
              <button className="btn-ghost" onClick={() => { setSearch(""); setSearchQuery(""); setFilterCat("전체"); }}>전체 보기</button>
            </div>
          ) : (
            <div className="item-grid">
              {filtered.map(item => <ItemCard key={item.id} item={item} from="search" />)}
            </div>
          )}
        </div>

        <div style={{ height:80 }} />
        <BottomNav />
      </div>
    );
  }

  // ── HOME ──────────────────────────────────────
  return (
    <div className="main-bg">
      <nav className="navbar">
        <div className="nav-logo">⚡ BILLIM</div>
        <div className="nav-right">
          <button className="btn-icon-nav notif-btn">
            🔔<span className="notif-dot" />
          </button>
          <button className="nav-avatar-btn" onClick={() => setPage("mypage")}>
            {user?.name?.[0] || "U"}
          </button>
        </div>
      </nav>

      <div className="hero">
        <div className="hero-tag">장비 대여 플랫폼</div>
        <h1 className="hero-title">필요한 장비를<br /><span className="hero-accent">지금 바로</span> 빌리세요</h1>
        <p className="hero-sub">카메라·드론·조명·공구·캠핑 장비를 간편하게</p>

        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input className="search-input" placeholder="장비 이름, 카테고리 검색..." value={search}
            onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && doSearch(search)} />
          {search && <button className="search-clear" onClick={() => setSearch("")}>✕</button>}
          <button className="search-submit" onClick={() => doSearch(search)}>검색</button>
        </div>
      </div>

      <div className="home-section">
        <div className="section-header">
          <h2 className="section-title">카테고리</h2>
          <button className="section-more" onClick={() => setPage("category")}> 전체보기 → </button>
        </div>
        <div className="cat-grid">
          {MAIN_CATEGORIES.map(cat => (
            <button key={cat.id} className="cat-grid-btn" style={{"--cat-bg": cat.color}} onClick={() => openCat(cat.id)}>
              <span className="cat-grid-icon">{cat.icon}</span>
              <span className="cat-grid-label">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="home-section">
        <div className="section-header">
          <h2 className="section-title">🔥 인기 장비</h2>
          <button className="section-more" onClick={() => { setFilterCat("전체"); setSearchQuery(""); setPage("search"); }}>전체보기 →</button>
        </div>
        <div className="item-grid">
          {ITEMS.filter(i => i.status === "available").slice(0, 4).map(item => (
            <ItemCard key={item.id} item={item} from="home" />
          ))}
        </div>
      </div>

      <div className="home-section">
        <div className="section-header">
          <h2 className="section-title">✨ 최근 등록</h2>
          <button className="section-more" onClick={() => { setFilterCat("전체"); setSearchQuery(""); setPage("search"); }}>전체보기 →</button>
        </div>
        <div className="item-grid">
          {ITEMS.slice(-3).map(item => <ItemCard key={item.id} item={item} from="home" />)}
        </div>
      </div>

      <div style={{ height:80 }} />
      <BottomNav />
    </div>
  );
}
