import { useState, useEffect, useRef } from "react";
import { bookingAPI, BillimWebSocket } from "../api";
import "./Reservation.css";

const DAYS_KR   = ["일","월","화","수","목","금","토"];
const MONTHS_KR = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];

// ── 팝업 타입별 스타일 ──
const POPUP_CONFIG = {
  SYSTEM:       { icon: "📢", color: "rgba(79,70,229,.1)",  border: "rgba(79,70,229,.3)",  label: "시스템 알림" },
  PAY_FORM:     { icon: "💳", color: "rgba(22,163,74,.08)", border: "rgba(22,163,74,.35)", label: "결제 요청" },
  PAY_COMPLETE: { icon: "🎉", color: "rgba(251,191,36,.1)", border: "rgba(251,191,36,.4)", label: "결제 완료" },
};

// ── 캘린더 ──────────────────────────────────
function Calendar({ onSelect, startDate, endDate, pickingEnd }) {
  const today = new Date(); today.setHours(0,0,0,0);
  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const firstDay  = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const cells     = Array(firstDay).fill(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);

  const prev = () => { if (month===0){setYear(y=>y-1);setMonth(11);}else setMonth(m=>m-1); };
  const next = () => { if (month===11){setYear(y=>y+1);setMonth(0);}else setMonth(m=>m+1); };
  const g    = (d) => { const dt=new Date(year,month,d); dt.setHours(0,0,0,0); return dt; };

  return (
    <div className="cal">
      <div className="cal-nav-row">
        <button className="cal-nav-btn" onClick={prev}>‹</button>
        <span className="cal-month-label">{year}년 {MONTHS_KR[month]}</span>
        <button className="cal-nav-btn" onClick={next}>›</button>
      </div>
      <div className="cal-dow">
        {DAYS_KR.map((d,i)=>(
          <span key={d} className={i===0?"sun":i===6?"sat":""}>{d}</span>
        ))}
      </div>
      <div className="cal-grid">
        {cells.map((d,i)=>{
          if (!d) return <button key={i} className="cal-cell empty" />;
          const dt   = g(d);
          const isS  = startDate && dt.getTime()===startDate.getTime();
          const isE  = endDate   && dt.getTime()===endDate.getTime();
          const isR  = startDate && endDate && dt>startDate && dt<endDate;
          const isDis= dt<today || (pickingEnd && startDate && dt<=startDate);
          return (
            <button key={i} disabled={isDis}
              className={["cal-cell", isS?"cs":"", isE?"ce":"", isR?"cr":"", isDis?"cd":""].join(" ")}
              onClick={()=>!isDis&&onSelect(dt)}
            >{d}</button>
          );
        })}
      </div>
    </div>
  );
}

// ── 실시간 팝업 컴포넌트 ──────────────────────
function WsPopup({ popup, onClose, onPayNow }) {
  if (!popup) return null;
  const cfg = POPUP_CONFIG[popup.message_type] || POPUP_CONFIG.SYSTEM;
  return (
    <div className="rsv-ws-overlay" onClick={onClose}>
      <div className="rsv-ws-popup"
        style={{ background: cfg.color, borderColor: cfg.border }}
        onClick={e => e.stopPropagation()}
      >
        <div className="rsv-ws-popup-top">
          <span className="rsv-ws-popup-icon">{cfg.icon}</span>
          <span className="rsv-ws-popup-label">{cfg.label}</span>
          <button className="rsv-ws-close" onClick={onClose}>✕</button>
        </div>
        <p className="rsv-ws-popup-msg">{popup.message}</p>
        {popup.message_type === "PAY_FORM" && (
          <button className="rsv-ws-pay-btn" onClick={onPayNow}>
            💳 지금 결제하기
          </button>
        )}
      </div>
    </div>
  );
}

// ── 메인 Reservation 컴포넌트 ────────────────
export default function Reservation({ item, onBack, onComplete, user }) {
  const [step,      setStep]    = useState(0);
  const [startDate, setStart]   = useState(null);
  const [endDate,   setEnd]     = useState(null);
  const [pickingEnd,setPick]    = useState(false);
  const [method,    setMethod]  = useState("direct");
  const [request,   setReq]     = useState("");
  const [loading,   setLoad]    = useState(false);
  const [done,      setDone]    = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [roomId,    setRoomId]  = useState(null);
  const [wsPopup,   setWsPopup] = useState(null);  // 실시간 팝업
  const [wsStatus,  setWsStatus]= useState("disconnected"); // connected | disconnected | error
  const [error,     setError]   = useState("");
  const wsRef = useRef(null);

  // ── WebSocket 연결 (예약 완료 후 채팅방 room_id 확보 시점)
  useEffect(() => {
    if (!roomId) return;

    const ws = new BillimWebSocket(roomId, {
      onOpen:    ()  => setWsStatus("connected"),
      onClose:   ()  => setWsStatus("disconnected"),
      onError:   ()  => setWsStatus("error"),
      onMessage: (data) => {
        // SYSTEM, PAY_FORM, PAY_COMPLETE 팝업 수신
        if (["SYSTEM","PAY_FORM","PAY_COMPLETE"].includes(data.message_type)) {
          setWsPopup(data);
        }
      },
    });

    ws.connect();
    wsRef.current = ws;

    return () => ws.disconnect();
  }, [roomId]);

  const nights = (startDate && endDate)
    ? Math.round((endDate - startDate) / 86400000)
    : 0;
  const total  = nights * (item?.price || 0);
  const fmt    = d => d ? `${d.getMonth()+1}/${d.getDate()}` : "선택";
  const fmtFull= d => d ? `${d.getFullYear()}.${d.getMonth()+1}.${d.getDate()}` : "";
  const toISO  = d => d ? `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}` : "";

  const handleSelect = (d) => {
    if (!pickingEnd) { setStart(d); setEnd(null); setPick(true); }
    else {
      if (d <= startDate) { setStart(d); setEnd(null); }
      else { setEnd(d); setPick(false); }
    }
  };

  // ── [단계 1] 예약 생성 API 호출
  const submit = async () => {
    setError("");
    setLoad(true);
    try {
      const res = await bookingAPI.create({
        item:       item?.id,
        owner:      user?.id,
        start_date: toISO(startDate),
        end_date:   toISO(endDate),
      });
      // 백엔드 응답에서 예약 ID와 채팅방 ID 추출
      setBookingId(res.id);
      setRoomId(res.chat_room_id ?? res.room_id ?? res.chatroom?.id);
      setDone(true);
    } catch (err) {
      const msg = err?.detail?.detail || err?.detail?.non_field_errors?.[0]
        || "예약 요청에 실패했어요. 다시 시도해주세요.";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoad(false);
    }
  };

  // ── [단계 3] 결제 완료 API 호출
  const handlePayNow = async () => {
    if (!bookingId) return;
    setWsPopup(null);
    setLoad(true);
    try {
      await bookingAPI.paymentComplete(bookingId);
      // 결제 완료 후 PAY_COMPLETE 팝업은 WebSocket으로 자동 수신
    } catch (err) {
      setError("결제 처리 중 오류가 발생했어요.");
    } finally {
      setLoad(false);
    }
  };

  // ── 완료 화면
  if (done) return (
    <div className="rsv-done-bg">
      {/* WebSocket 실시간 팝업 */}
      <WsPopup popup={wsPopup} onClose={() => setWsPopup(null)} onPayNow={handlePayNow} />

      <div className="rsv-done-card">
        <div className="rsv-done-emoji">🎉</div>
        <h2 className="rsv-done-title">예약 완료!</h2>
        <p className="rsv-done-sub">
          판매자에게 알림이 전송됐어요<br/>
          채팅으로 세부 사항을 조율해보세요
        </p>

        {/* WebSocket 연결 상태 표시 */}
        <div className={`rsv-ws-status rsv-ws-${wsStatus}`}>
          <span className="rsv-ws-dot" />
          {wsStatus === "connected"
            ? "실시간 알림 연결됨"
            : wsStatus === "error"
            ? "알림 연결 오류"
            : "알림 연결 중..."}
        </div>

        <div className="rsv-done-info">
          <div className="rsv-done-row"><span>물품</span><span>{item?.name}</span></div>
          <div className="rsv-done-row"><span>기간</span><span>{fmtFull(startDate)} ~ {fmtFull(endDate)}</span></div>
          <div className="rsv-done-row"><span>일수</span><span>{nights}일</span></div>
          <div className="rsv-done-row accent"><span>총 금액</span><span>{total.toLocaleString()}원</span></div>
          {bookingId && (
            <div className="rsv-done-row"><span>예약 번호</span><span>#{bookingId}</span></div>
          )}
        </div>
        <button className="btn-primary" onClick={onComplete}>확인</button>
      </div>
    </div>
  );

  return (
    <div className="rsv-bg">
      {/* WebSocket 실시간 팝업 (예약 진행 중에도 수신 가능) */}
      <WsPopup popup={wsPopup} onClose={() => setWsPopup(null)} onPayNow={handlePayNow} />

      <div className="rsv-header">
        <button className="nav-back" onClick={step===0 ? onBack : ()=>setStep(0)}><span>←</span></button>
        <div className="rsv-title">대여 예약</div>
        <div className="rsv-step-tag">{step+1}/2</div>
      </div>

      <div className="rsv-prog-track">
        <div className="rsv-prog-fill" style={{width:`${(step+1)/2*100}%`}} />
      </div>

      {/* ── STEP 0: 날짜 선택 ── */}
      {step === 0 && (
        <div className="rsv-body">
          <div className="rsv-item-row">
            <span className="rsv-item-img">{item?.image || "📦"}</span>
            <div>
              <div className="rsv-item-name">{item?.name}</div>
              <div className="rsv-item-price">{item?.price?.toLocaleString() ?? item?.price_day?.toLocaleString()}원 / 일</div>
            </div>
          </div>

          <div className="rsv-date-row">
            <div className={`rsv-date-chip ${!pickingEnd?"active":""} ${startDate?"filled":""}`}
              onClick={()=>setPick(false)}>
              <div className="rdc-label">시작일</div>
              <div className="rdc-val">{fmt(startDate)}</div>
            </div>
            <span className="rsv-arrow">→</span>
            <div className={`rsv-date-chip ${pickingEnd?"active":""} ${endDate?"filled":""}`}
              onClick={()=>startDate&&setPick(true)}>
              <div className="rdc-label">반납일</div>
              <div className="rdc-val">{fmt(endDate)}</div>
            </div>
          </div>

          <p className="rsv-hint">{pickingEnd ? "📅 반납일을 선택해주세요" : "📅 시작일을 선택해주세요"}</p>

          <Calendar onSelect={handleSelect} startDate={startDate} endDate={endDate} pickingEnd={pickingEnd} />

          {nights > 0 && (
            <div className="rsv-total-chip">
              {nights}일 대여 &nbsp;·&nbsp; 총 <strong>{total.toLocaleString()}원</strong>
            </div>
          )}

          <div className="rsv-bottom">
            <button className="btn-primary" disabled={!startDate || !endDate} onClick={()=>setStep(1)}>
              다음 단계 →
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 1: 예약 확인 및 제출 ── */}
      {step === 1 && (
        <div className="rsv-body">
          <h3 className="rsv-sub-title">예약 정보 확인</h3>
          <div className="rsv-confirm-card">
            <div className="rsv-item-row" style={{marginBottom:0}}>
              <span className="rsv-item-img">{item?.image || "📦"}</span>
              <div>
                <div className="rsv-item-name">{item?.name}</div>
                <div className="rsv-item-price">{item?.category} · {item?.location}</div>
              </div>
            </div>
            <div className="rsv-divider"/>
            <div className="rsv-confirm-row"><span>대여 기간</span><span>{fmtFull(startDate)} ~ {fmtFull(endDate)}</span></div>
            <div className="rsv-confirm-row"><span>일수</span><span>{nights}일</span></div>
            <div className="rsv-confirm-row"><span>하루 가격</span><span>{(item?.price ?? item?.price_day)?.toLocaleString()}원</span></div>
            <div className="rsv-confirm-row accent"><span>총 금액</span><span>{total.toLocaleString()}원</span></div>
          </div>

          <h3 className="rsv-sub-title">거래 방법</h3>
          <div className="rsv-method-row">
            {[{id:"direct",icon:"🤝",label:"직접 거래"},{id:"delivery",icon:"📦",label:"택배 거래"}].map(m=>(
              <button key={m.id}
                className={`rsv-method-btn ${method===m.id?"active":""}`}
                onClick={()=>setMethod(m.id)}>
                <span className="rmb-icon">{m.icon}</span>
                <span>{m.label}</span>
              </button>
            ))}
          </div>

          <h3 className="rsv-sub-title">요청사항 <span className="rsv-optional">(선택)</span></h3>
          <textarea className="rsv-textarea" rows={3}
            value={request} onChange={e=>setReq(e.target.value)}
            placeholder={"판매자에게 전달할 내용\n예: 배터리 완충 부탁드립니다"} />

          <div className="rsv-ai-notice">
            <span>🤖</span>
            <span>대여 시작 전 AI가 물품 사진을 분석해 손상 여부를 기록합니다.</span>
          </div>

          <div className="rsv-ws-notice">
            <span>🔔</span>
            <span>예약 후 제공자의 승인 여부가 실시간으로 알림으로 전달됩니다.</span>
          </div>

          {error && <div className="rsv-error-box">⚠ {error}</div>}

          <div className="rsv-bottom">
            <button className="btn-primary" onClick={submit} disabled={loading}>
              {loading ? "처리 중..." : `${total.toLocaleString()}원 예약 확정`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
