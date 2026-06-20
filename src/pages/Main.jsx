import { useState, useEffect, useCallback } from "react";
import "./Main.css";
import Reservation from "./Reservation";
import AICheck from "./AICheck";
import ReviewWrite from "./ReviewWrite";
import ItemRegister from "./ItemRegister";
import { itemAPI } from "../api";
import ItemEdit from "./ItemEdit";


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

// 물품 목록은 itemAPI에서 동적으로 불러옴 (Main 컴포넌트 내 useEffect 참고)

const CHAT_LIST = [
  { id:1, name:"이서연", item:"DJI 매빅3 프로 드론",     lastMsg:"📩 대여 요청이 도착했습니다", time:"방금",     unread:1 },
  { id:2, name:"한소희", item:"블랙다이아몬드 등산화",   lastMsg:"📩 대여 요청이 도착했습니다", time:"5분 전",   unread:1 },
  { id:3, name:"오성현", item:"마키타 충전 드릴",        lastMsg:"📩 대여 요청이 도착했습니다", time:"1시간 전", unread:1 },
  { id:4, name:"송미래", item:"콜맨 4인용 텐트",         lastMsg:"📩 대여 요청이 도착했습니다", time:"어제",     unread:1 },
];


const MY_RENTALS = [
  { id:201, name:"DJI 매빅3 프로 드론", owner:"이서연", price:120000, status:"active", date:"5/15 ~ 5/17", image:"🚁" },
  { id:202, name:"콜맨 4인용 텐트",     owner:"송미래", price:25000,  status:"done",   date:"5/10 ~ 5/12", image:"⛺" },
  { id:203, name:"젠하이저 마이크",     owner:"최수아", price:35000,  status:"done",   date:"4/28 ~ 4/30", image:"🎙️" },
];

const MY_ITEMS_DATA = [
  { id:101, name:"니콘 Z6II 미러리스", category:"촬영장비", price:65000, status:"available", image:"📷", reviews:8,  rating:4.7, seller:"나", sellerRating:4.9, sellerTrades:12, desc:"내가 등록한 물품.", location:"서울" },
  { id:102, name:"고프로 히어로 12",   category:"촬영장비", price:28000, status:"rented",    image:"🎥", reviews:15, rating:4.9, seller:"나", sellerRating:4.9, sellerTrades:12, desc:"내가 등록한 물품.", location:"서울" },
];

const MY_REVIEWS = [
  { id:1, item:"콜맨 4인용 텐트", image:"⛺", rating:5, date:"5/13", text:"상태도 좋고 친절하셨어요. 다음에 또 빌릴게요!" },
  { id:2, item:"젠하이저 마이크", image:"🎙️", rating:4, date:"5/1",  text:"음질 깨끗하고 구성품 완벽했습니다." },
];

const FULL_CATEGORIES = [
  { group:"촬영·영상",    mainCats:["촬영장비","드론"], items:["카메라/DSLR","미러리스","드론","짐벌/스태빌라이저","조명 장비","삼각대","렌즈","액션캠"] },
  { group:"음향·방송",    mainCats:["음향장비"],        items:["마이크","스피커","앰프/믹서","헤드폰/이어폰","레코더","방송 장비"] },
  { group:"아웃도어·캠핑", mainCats:["캠핑","등산장비"], items:["텐트","침낭/매트","캠핑 의자/테이블","등산화","등산 스틱","배낭","랜턴"] },
  { group:"공구·DIY",     mainCats:["공구"],            items:["전동 드릴","그라인더","측정 공구","용접 장비","사다리","발전기"] },
  { group:"스포츠·레저",   mainCats:["스포츠"],         items:["자전거","킥보드/전동","골프 장비","서핑/수상레저","스키/보드","헬스 기구","라켓 스포츠"] },
  { group:"디지털·가전",   mainCats:["기타"],           items:["노트북","태블릿","빔프로젝터","게임기","3D 프린터","VR 기기"] },
  { group:"파티·이벤트",   mainCats:["기타"],           items:["포토부스","조명/무드등","현수막/배너","테이블웨어","음향 세트"] },
  { group:"기타",         mainCats:["기타"],           items:["악기","미술 도구","공연 소품","기타 장비"] },
];

const INITIAL_NOTIFICATIONS = [
  { id:1, type:"reservation", icon:"📅", title:"새로운 대여 예약 신청",   desc:"이서연님이 'DJI 매빅3 프로 드론' 예약을 신청했어요", time:"방금",     unread:true },
  { id:2, type:"chat",        icon:"💬", title:"새 메시지",               desc:"한소희: 사이즈 270 맞으시죠?",                       time:"5분 전",   unread:true },
  { id:3, type:"wish",        icon:"❤️", title:"찜한 물품 알림",          desc:"'캐논 EOS R5'이 대여 가능 상태로 전환됐어요",       time:"1시간 전", unread:false },
  { id:4, type:"return",      icon:"📦", title:"반납 요청",               desc:"송미래님이 '콜맨 4인용 텐트' 반납을 요청했어요",     time:"어제",     unread:false },
  { id:5, type:"review",      icon:"⭐", title:"리뷰가 등록됐어요",       desc:"최수아님이 '젠하이저 마이크'에 5점 리뷰를 남겼어요",  time:"2일 전",   unread:false },
];

function ChatRoom({ chat, onBack, onAICheck }) {
  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState([]);
  // ✅ pending(신청 대기) → reserved → active → returning / rejected
  const [rentalStatus, setRentalStatus] = useState("pending");

  const send = () => {
    if (!msg.trim()) return;
    setMessages(prev => [...prev, {
      id: Date.now(), from:"me", text: msg,
      time: new Date().toLocaleTimeString("ko-KR",{hour:"2-digit",minute:"2-digit"})
    }]);
    setMsg("");
  };

  const STATUS_LABELS = {
    pending:"대여 신청됨", reserved:"예약 확정", active:"대여중",
    returning:"반납 요청됨", rejected:"신청 거절됨"
  };
  const STATUS_COLORS = {
    pending:"#F59E0B", reserved:"#16A34A", active:"var(--accent2)",
    returning:"var(--red)", rejected:"var(--text3)"
  };

  const accept = () => {
    setRentalStatus("reserved");
    setMessages([{
      id: Date.now(), from:"other",
      text:`${chat.item} 대여 신청을 수락했어요. 일정 조율해보세요!`,
      time: new Date().toLocaleTimeString("ko-KR",{hour:"2-digit",minute:"2-digit"})
    }]);
  };
  const reject = () => {
  setRentalStatus("rejected");
  };


  const chatLocked = rentalStatus === "pending" || rentalStatus === "rejected";

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

      {/* 거래 상태 카드 */}
      <div className="chatroom-rental-card">
        <div className="crc-left">
          <span className="crc-dot" style={{background:STATUS_COLORS[rentalStatus]}} />
          <div>
            <div className="crc-status" style={{color:STATUS_COLORS[rentalStatus]}}>
              {STATUS_LABELS[rentalStatus]}
            </div>
            <div className="crc-item">{chat.item}</div>
          </div>
        </div>
        <div className="crc-actions">
          {rentalStatus === "pending" && (
            <>
              <button className="crc-btn" onClick={reject}>거절</button>
              <button className="crc-btn primary" onClick={accept}>수락</button>
            </>
          )}
          {rentalStatus === "reserved" && (
            <button className="crc-btn primary" onClick={()=>setRentalStatus("active")}>대여 확정</button>
          )}
          {rentalStatus === "active" && (
            <>
              <button className="crc-btn" onClick={()=>onAICheck && onAICheck()}>AI 검수</button>
              <button className="crc-btn primary" onClick={()=>setRentalStatus("returning")}>반납 요청</button>
            </>
          )}
          {rentalStatus === "returning" && (
            <button className="crc-btn primary" onClick={()=>alert("반납 완료 처리됐습니다.")}>반납 확인</button>
          )}
        </div>
      </div>

      <div className="chatroom-body">
        {rentalStatus === "pending" && (
          <div className="empty-state" style={{margin:"auto", maxWidth:280}}>
            <div className="empty-icon">📩</div>
            <p style={{fontWeight:700, color:"var(--text)"}}>
              {chat.name}님의 대여 신청이 도착했어요
            </p>
            <p style={{fontSize:"13px", color:"var(--text2)", lineHeight:1.6, marginTop:4}}>
              📦 <strong>{chat.item}</strong><br/>
              수락하시면 채팅으로 세부 사항을<br/>조율할 수 있어요
            </p>
            <div style={{display:"flex", gap:10, marginTop:14, width:"100%"}}>
              <button className="btn-ghost" style={{flex:1}} onClick={reject}>거절</button>
              <button className="btn-primary" style={{flex:1, padding:"12px"}} onClick={accept}>수락하기</button>
            </div>
          </div>
        )}

        {rentalStatus === "rejected" && (
          <div className="empty-state" style={{margin:"auto"}}>
            <div className="empty-icon">🚫</div>
            <p>대여 신청을 거절했어요</p>
            <p style={{fontSize:"13px", color:"var(--text3)"}}>이 채팅은 더 이상 사용할 수 없어요</p>
          </div>
        )}

        {!chatLocked && (
          messages.length === 0 ? (
            <div className="empty-state" style={{margin:"auto"}}>
              <div className="empty-icon">💬</div>
              <p>아직 메시지가 없어요</p>
              <p style={{fontSize:"12px", color:"var(--text3)"}}>먼저 인사를 건네보세요</p>
            </div>
          ) : (
            <>
              <div className="chat-date-divider"><span>오늘</span></div>
              {messages.map(m => (
                <div key={m.id} className={`chat-bubble-wrap ${m.from}`}>
                  {m.from==="other" && <div className="chat-b-avatar">{chat.name[0]}</div>}
                  <div className="chat-bubble-col">
                    <div className={`chat-bubble ${m.from}`}>{m.text}</div>
                    <div className="chat-bubble-time">{m.time}</div>
                  </div>
                </div>
              ))}
            </>
          )
        )}
      </div>

      <div className="chatroom-input-bar">
        <button className="chat-attach-btn" disabled={chatLocked}>＋</button>
        <input className="chatroom-input"
          placeholder={chatLocked ? "수락 후 채팅을 시작할 수 있어요" : "메시지를 입력하세요..."}
          value={msg} disabled={chatLocked}
          onChange={e=>setMsg(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&send()} />
        <button className="chat-send-btn" onClick={send} disabled={chatLocked}>↑</button>
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
  const [reservationItem, setReservationItem] = useState(null);
  const [aiCheckItem, setAiCheckItem]         = useState(null);
  const [aiCheckMode, setAiCheckMode]         = useState("after");
  const [reviewTarget, setReviewTarget]       = useState(null);
  const [editItem, setEditItem]               = useState(null);

  // ── DB 물품 목록 상태
  const [items, setItems]       = useState([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [itemsError, setItemsError]     = useState(false);

  // ── 물품 목록 API 호출 (마운트 시 + 등록 완료 후 재호출)
  const fetchItems = useCallback(async () => {
    setItemsLoading(true);
    setItemsError(false);
    try {
      const res = await itemAPI.list();
      // 백엔드 응답이 { results: [...] } 형태이거나 배열일 수 있음
      const list = Array.isArray(res) ? res : (res.results ?? []);
      // 백엔드 필드명 → 프론트 통일 (price_day → price 등)
      const normalized = list.map(it => ({
        ...it,
        name:     it.name     ?? it.title ?? "",
        id:       it.id       ?? it.item_id,
        price:    it.price    ?? it.price_day ?? 0,
        status:   (it.status ?? "AVAILABLE").toUpperCase() === "AVAILABLE" ? "available" : "rented",
        image:    it.image    ?? "📦",
        rating:   it.rating   ?? 0,
        reviews:  it.reviews  ?? it.review_count ?? 0,
        seller:   it.seller   ?? it.owner_name ?? it.owner ?? "판매자",
        sellerRating: it.sellerRating ?? it.owner_rating ?? 0,
        sellerTrades: it.sellerTrades ?? it.owner_trades ?? 0,
        desc:     it.desc     ?? it.description ?? "",
      }));
      setItems(normalized);
    } catch {
      setItemsError(true);
    } finally {
      setItemsLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  // ✅ 신규 상태
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [profile, setProfile] = useState({
    nickname: user?.username || user?.name || "사용자",
    email: user?.email || "",
    push: true, marketing: false, nightMute: true,
  });

  const doSearch    = (q) => { setSearchQuery(q); setFilterCat("전체"); setPage("search"); };
  const openCat     = (id) => { setFilterCat(id); setSearchQuery(""); setPage("search"); };
  const goDetail    = (item, from) => { setSelected(item); setPrevPage(from ?? page); setPage("detail"); };
  const toggleWish  = (id) => setWishlist(p => p.includes(id) ? p.filter(i => i !== id) : [...p, id]);

  const filtered = items.filter(item => {
    const matchCat    = filterCat === "전체" || item.category === filterCat;
    const matchSearch = !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const totalUnread = CHAT_LIST.reduce((a, c) => a + c.unread, 0);
  const unreadNotif = notifications.filter(n => n.unread).length;

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
        <button className={`card-wish ${wishlist.includes(item.id) ? "on" : ""}`}
          onClick={e => { e.stopPropagation(); toggleWish(item.id); }}>
          {wishlist.includes(item.id) ? "❤️" : "🤍"}
        </button>
      </div>
      <div className="card-body">
        <div className="card-top">
          <span className="card-cat">{item.category}</span>
          <span className={`card-status ${item.status}`}>{item.status === "available" ? "대여 가능" : "대여 중"}</span>
        </div>
        <h3 className="card-name">{item.name}</h3>
        <div className="card-meta"><span>📍 {item.location}</span><span>⭐ {item.rating}</span></div>
        <div className="card-footer">
          <span className="card-price">{item.price.toLocaleString()}원<span className="card-unit">/일</span></span>
          <span className="card-review">{item.reviews}개 리뷰</span>
        </div>
      </div>
    </div>
  );

  // ── 그룹 전체보기: 해당 그룹의 mainCats에 속하는 ITEMS ─────────────
  if (page === "groupResult") {
    const group = FULL_CATEGORIES.find(g => g.group === searchQuery);
    const groupItems = group ? items.filter(it => group.mainCats.includes(it.category)) : [];
    return (
      <div className="main-bg">
        <nav className="navbar">
          <button className="nav-back" onClick={() => setPage("category")}><span>←</span></button>
          <div className="nav-logo">{searchQuery}</div>
          <div style={{ width: 36 }} />
        </nav>
        <div className="search-content">
          <div className="result-info">
            <span className="result-count">{groupItems.length}개</span>의 장비
            <span className="result-keyword"> · {searchQuery} 전체</span>
          </div>
          {groupItems.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <p>이 카테고리의 물품이 아직 없어요</p>
            </div>
          ) : (
            <div className="item-grid">
              {groupItems.map(it => <ItemCard key={it.id} item={it} from="groupResult" />)}
            </div>
          )}
        </div>
        <div style={{ height: 80 }} />
        <BottomNav />
      </div>
    );
  }

  // ── 전체 카테고리 ─────────────────────────────────────────────
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
              <div className="fullcat-group-head">
                <div className="fullcat-group-title" style={{borderBottom:"none", paddingBottom:0}}>{group.group}</div>
                <button className="fullcat-group-all"
                  onClick={() => { setSearchQuery(group.group); setPage("groupResult"); }}>
                  전체보기 
                </button>
              </div>
              <div className="fullcat-item-grid">
                {group.items.map((item) => (
                  <button key={item} className="fullcat-item-btn"
                    onClick={() => { setFilterCat("전체"); setSearchQuery(item); setPage("search"); }}>
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

  if (page === "reservation") {
    return <Reservation item={reservationItem} onBack={() => setPage("detail")} onComplete={() => setPage("home")} user={user} />;
  }
  if (page === "aicheck") {
    return <AICheck item={aiCheckItem} mode={aiCheckMode} onBack={() => setPage("mypage")} onDone={() => setPage("mypage")} />;
  }
  if (page === "review") {
    return <ReviewWrite target={reviewTarget} onBack={() => setPage("mypage")} onComplete={() => setPage("mypage")} />;
  }

  // ── 알림 페이지 ─────────────────────────────────────────────
  if (page === "notifications") {
    const markAll = () => setNotifications(prev => prev.map(n => ({...n, unread:false})));
    return (
      <div className="main-bg">
        <nav className="navbar">
          <button className="nav-back" onClick={() => setPage("home")}><span>←</span></button>
          <div className="nav-logo">알림</div>
          <button className="btn-ghost sm" onClick={markAll}>모두 읽음</button>
        </nav>
        <div className="notif-wrap">
          {notifications.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">🔔</div><p>알림이 없어요</p></div>
          ) : notifications.map(n => (
            <div key={n.id} className={`notif-item ${n.unread?"unread":""}`}
              onClick={() => setNotifications(prev => prev.map(x => x.id===n.id?{...x,unread:false}:x))}>
              <div className="notif-icon">{n.icon}</div>
              <div className="notif-body">
                <div className="notif-title">{n.title}</div>
                <div className="notif-desc">{n.desc}</div>
                <div className="notif-time">{n.time}</div>
              </div>
              {n.unread && <span className="notif-dot-new" />}
            </div>
          ))}
        </div>
        <BottomNav />
      </div>
    );
  }

  // ── 찜 목록 페이지 ───────────────────────────────────────────
  if (page === "wishlist") {
    const wishItems = items.filter(it => wishlist.includes(it.id));
    return (
      <div className="main-bg">
        <nav className="navbar">
          <button className="nav-back" onClick={() => setPage("mypage")}><span>←</span></button>
          <div className="nav-logo">찜 목록</div>
          <div style={{width:36}} />
        </nav>
        <div className="wish-wrap">
          {wishItems.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">❤️</div>
              <p>찜한 물품이 없어요</p>
              <p style={{fontSize:"13px", color:"var(--text3)"}}>마음에 드는 장비를 찜해보세요</p>
            </div>
          ) : (
            <div className="item-grid">
              {wishItems.map(it => <ItemCard key={it.id} item={it} from="wishlist" />)}
            </div>
          )}
        </div>
        <BottomNav />
      </div>
    );
  }

  // ── 설정 페이지 ──────────────────────────────────────────────
  if (page === "settings") {
    const editNick = () => {
      const v = prompt("새 닉네임을 입력하세요", profile.nickname);
      if (v && v.trim()) setProfile(p => ({...p, nickname:v.trim()}));
    };
    const changePw = () => {
      const cur = prompt("현재 비밀번호");
      if (!cur) return;
      const nw = prompt("새 비밀번호 (6자 이상)");
      if (!nw || nw.length < 6) { alert("6자 이상 입력해주세요"); return; }
      const nw2 = prompt("새 비밀번호 확인");
      if (nw !== nw2) { alert("비밀번호가 일치하지 않습니다"); return; }
      alert("비밀번호가 변경됐어요");
    };
    const Toggle = ({ on, onClick }) => (
      <button className={`settings-toggle ${on?"on":""}`} onClick={onClick} />
    );
    return (
      <div className="main-bg">
        <nav className="navbar">
          <button className="nav-back" onClick={() => setPage("mypage")}><span>←</span></button>
          <div className="nav-logo">설정</div>
          <div style={{width:36}} />
        </nav>

        <div className="settings-wrap">
          <div className="settings-group">
            <div className="settings-group-title">계정</div>
            <div className="settings-row" onClick={editNick}>
              <span className="settings-row-label">닉네임</span>
              <span className="settings-row-val">{profile.nickname} ›</span>
            </div>
            <div className="settings-row">
              <span className="settings-row-label">이메일</span>
              <span className="settings-row-val">{profile.email || "—"}</span>
            </div>
            <div className="settings-row" onClick={changePw}>
              <span className="settings-row-label">비밀번호 변경</span>
              <span className="settings-row-val">›</span>
            </div>
            <div className="settings-row" onClick={()=>alert("프로필 사진 변경 (백엔드 연결 후)")}>
              <span className="settings-row-label">프로필 사진</span>
              <span className="settings-row-val">›</span>
            </div>
          </div>

          <div className="settings-group">
            <div className="settings-group-title">알림</div>
            <div className="settings-row">
              <span className="settings-row-label">푸시 알림</span>
              <Toggle on={profile.push} onClick={()=>setProfile(p=>({...p,push:!p.push}))} />
            </div>
            <div className="settings-row">
              <span className="settings-row-label">마케팅·이벤트 알림</span>
              <Toggle on={profile.marketing} onClick={()=>setProfile(p=>({...p,marketing:!p.marketing}))} />
            </div>
            <div className="settings-row">
              <span className="settings-row-label">야간 무음 (22시~08시)</span>
              <Toggle on={profile.nightMute} onClick={()=>setProfile(p=>({...p,nightMute:!p.nightMute}))} />
            </div>
          </div>

          <div className="settings-group">
            <div className="settings-group-title">앱 정보</div>
            <div className="settings-row" onClick={()=>alert("이용약관")}>
              <span className="settings-row-label">이용약관</span><span className="settings-row-val">›</span>
            </div>
            <div className="settings-row" onClick={()=>alert("개인정보처리방침")}>
              <span className="settings-row-label">개인정보처리방침</span><span className="settings-row-val">›</span>
            </div>
            <div className="settings-row">
              <span className="settings-row-label">앱 버전</span>
              <span className="settings-row-val">v1.0.0</span>
            </div>
          </div>

          <div className="settings-group">
            <div className="settings-row" onClick={onLogout}>
              <span className="settings-row-label">로그아웃</span>
              <span className="settings-row-val">›</span>
            </div>
            <div className="settings-row" onClick={()=>window.confirm("정말 탈퇴하시겠어요?") && alert("탈퇴 처리됐습니다.")}>
              <span className="settings-row-label settings-danger">회원 탈퇴</span>
              <span className="settings-row-val">›</span>
            </div>
          </div>
        </div>
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
            <button className={`btn-icon-nav ${wishlist.includes(selected.id) ? "wish-on" : ""}`}
              onClick={() => toggleWish(selected.id)}>
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
              <div className="date-picker-btn"><div className="dp-label">시작일</div><div className="dp-val">날짜 선택</div></div>
              <div className="dp-arrow">→</div>
              <div className="date-picker-btn"><div className="dp-label">반납일</div><div className="dp-val">날짜 선택</div></div>
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
            <button className="btn-reserve" onClick={() => { setReservationItem(selected); setPage("reservation"); }}>예약하기</button>
          ) : (
            <button className="btn-reserve disabled">현재 대여 중</button>
          )}
        </div>
      </div>
    );
  }

  if (page === "itemedit") {
  return <ItemEdit item={editItem} onBack={() => setPage("mypage")} onComplete={() => { fetchItems(); setPage("mypage"); }} />;
}


  if (page === "register") {
    return <ItemRegister onBack={() => setPage("home")} onComplete={() => { fetchItems(); setPage("home"); }} user={user} />;
  }

  if (page === "chat") {
    if (chatOpen) {
      return (
        <div className="main-bg">
          <ChatRoom chat={chatOpen} onBack={() => setChatOpen(null)}
            onAICheck={() => { setAiCheckItem({name: chatOpen.item, image:"📦"}); setAiCheckMode("after"); setPage("aicheck"); setChatOpen(null); }} />
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
                <div className="chat-item-top"><span className="chat-name">{chat.name}</span><span className="chat-time">{chat.time}</span></div>
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

  if (page === "mypage") {
    const activeRentalCount = MY_RENTALS.filter(r=>r.status==="active").length;
    return (
      <div className="main-bg">
        <nav className="navbar">
          <div className="nav-logo">⚡ BILLIM</div>
          <div className="nav-right">
            <button className="btn-icon-nav" onClick={()=>setPage("settings")}>⚙️</button>
            <button className="btn-ghost sm" onClick={onLogout}>로그아웃</button>
          </div>
        </nav>

        <div className="my-profile-card">
          <div className="my-avatar-big">{profile.nickname?.[0] || "U"}</div>
          <div className="my-name">{profile.nickname}</div>
          <div className="my-email">{profile.email}</div>
          <div className="my-stats-row">
            <div className="my-stat"><span className="my-stat-val">12</span><span className="my-stat-lbl">대여</span></div>
            <div className="my-stat-div" />
            <div className="my-stat"><span className="my-stat-val">3</span><span className="my-stat-lbl">등록</span></div>
            <div className="my-stat-div" />
            <div className="my-stat"><span className="my-stat-val">4.9 ⭐</span><span className="my-stat-lbl">평점</span></div>
          </div>
        </div>

        <div className="my-quick-row">
          <div className="my-quick-btn" onClick={()=>setMyTab("rentals")}>
            <span className="my-quick-icon">📦</span>
            <span className="my-quick-count">{activeRentalCount}</span>
            <span className="my-quick-lbl">대여 중</span>
          </div>
          <div className="my-quick-btn" onClick={()=>setPage("wishlist")}>
            <span className="my-quick-icon">❤️</span>
            <span className="my-quick-count">{wishlist.length}</span>
            <span className="my-quick-lbl">찜 목록</span>
          </div>
          <div className="my-quick-btn" onClick={()=>setMyTab("reviews")}>
            <span className="my-quick-icon">⭐</span>
            <span className="my-quick-count">{MY_REVIEWS.length}</span>
            <span className="my-quick-lbl">리뷰</span>
          </div>
          <div className="my-quick-btn" onClick={()=>setPage("notifications")}>
            <span className="my-quick-icon">🔔</span>
            <span className="my-quick-count">{unreadNotif}</span>
            <span className="my-quick-lbl">알림</span>
          </div>
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
                {r.status === "active" && (
                  <button className="ai-check-btn"
                    onClick={() => { setAiCheckItem({...r, image:r.image}); setAiCheckMode("after"); setPage("aicheck"); }}>
                    🤖 AI 검수 시작
                  </button>
                )}
                <div className="rental-meta">👤 {r.owner} · 📅 {r.date}</div>
                <div className="rental-price">{r.price.toLocaleString()}원</div>
                {r.status === "done" && (
                  <button className="review-write-btn" onClick={() => { setReviewTarget(r); setPage("review"); }}>
                    ✏️ 리뷰 작성하기
                  </button>
                )}
              </div>
            </div>
          ))}

          {myTab === "myitems" && (
            <div>
              <button className="add-item-btn" onClick={() => setPage("register")}>＋ 새 물품 등록</button>
              <div className="item-grid">
                {MY_ITEMS_DATA.map(item => (
                  <div key={item.id} style={{position:"relative"}}>
                    <ItemCard item={item} from="mypage" />
                    <div className="my-item-actions">
                      <button className="my-item-edit-btn" onClick={() => { setEditItem(item); setPage("itemedit"); }}>✏️ 수정</button>
                      <button className="my-item-delete-btn" onClick={async () => {
                        if (!window.confirm(`'${item.name}' 을 삭제할까요?`)) return;
                        try {
                          await itemAPI.delete(item.id);
                          fetchItems();
                        } catch {
                          alert("삭제에 실패했어요. 다시 시도해주세요.");
                        }
                      }}>🗑️ 삭제</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}


          {myTab === "reviews" && (
            MY_REVIEWS.length === 0 ? (
              <div className="empty-state" style={{ paddingTop:"60px" }}>
                <div className="empty-icon">⭐</div>
                <p>아직 작성한 리뷰가 없어요</p>
              </div>
            ) : MY_REVIEWS.map(r => (
              <div key={r.id} className="rental-card">
                <div className="rental-img">{r.image}</div>
                <div className="rental-body">
                  <div className="rental-name">{r.item}</div>
                  <div className="rental-meta">{"⭐".repeat(r.rating)} · {r.date}</div>
                  <div style={{fontSize:"13px", color:"var(--text2)", lineHeight:1.6, marginTop:"6px"}}>{r.text}</div>
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{ height:80 }} />
        <BottomNav />
      </div>
    );
  }

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
          <div className="cat-row">
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

  // ── HOME ─────────────────────────────────────────────────
  return (
    <div className="main-bg">
      <nav className="navbar">
        <div className="nav-logo">⚡ BILLIM</div>
        <div className="nav-right">
          <button className="btn-icon-nav notif-btn" onClick={()=>setPage("notifications")}>
            🔔{unreadNotif>0 && <span className="notif-dot" />}
          </button>
          <button className="nav-avatar-btn" onClick={() => setPage("mypage")}>
            {profile.nickname?.[0] || "U"}
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
          <button className="section-more" onClick={() => setPage("category")}> 전체보기</button>
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
          <button className="section-more" onClick={() => { setFilterCat("전체"); setSearchQuery(""); setPage("search"); }}>전체보기</button>
        </div>
        {itemsLoading ? (
          <div className="items-loading">
            {[1,2,3].map(i => <div key={i} className="item-skeleton" />)}
          </div>
        ) : itemsError ? (
          <div className="items-error-box">
            <span>⚠️ 서버에 연결할 수 없어요</span>
            <button onClick={fetchItems}>다시 시도</button>
          </div>
        ) : items.filter(i => i.status === "available").length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <p>등록된 장비가 없어요</p>
          </div>
        ) : (
          <div className="item-grid">
            {items.filter(i => i.status === "available").slice(0, 4).map(item => (
              <ItemCard key={item.id} item={item} from="home" />
            ))}
          </div>
        )}
      </div>

      <div className="home-section">
        <div className="section-header">
          <h2 className="section-title">✨ 최근 등록</h2>
          <button className="section-more" onClick={() => { setFilterCat("전체"); setSearchQuery(""); setPage("search"); }}>전체보기</button>
        </div>
        {!itemsLoading && !itemsError && (
          <div className="item-grid">
            {items.slice(-3).map(item => <ItemCard key={item.id} item={item} from="home" />)}
          </div>
        )}
      </div>

      <div style={{ height:80 }} />
      <BottomNav />
    </div>
  );
}
