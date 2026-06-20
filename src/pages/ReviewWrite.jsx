import { useState } from "react";
import "./ReviewWrite.css";

const SUB_RATINGS = [
  { id:"condition", label:"물품 상태", icon:"📦" },
  { id:"response",  label:"거래 응대", icon:"💬" },
  { id:"time",      label:"시간 약속", icon:"⏰" },
];

const QUICK_TAGS = ["깨끗해요","구성품 완벽","친절해요","시간 약속 잘 지켜요","설명이 정확해요","재이용 의사 있어요","포장이 꼼꼼해요"];

function StarRow({ value, onChange, size="big" }) {
  const [hover, setHover] = useState(0);
  return (
    <div className={`star-row ${size}`}>
      {[1,2,3,4,5].map(n => (
        <button key={n}
          className={`star-btn ${n<=(hover||value)?"on":""}`}
          onMouseEnter={()=>setHover(n)}
          onMouseLeave={()=>setHover(0)}
          onClick={()=>onChange(n)}
        >★</button>
      ))}
    </div>
  );
}

export default function ReviewWrite({ target, onBack, onComplete }) {
  const [rating, setRating]         = useState(0);
  const [subRatings, setSubRatings] = useState({ condition:0, response:0, time:0 });
  const [tags, setTags]             = useState([]);
  const [text, setText]             = useState("");
  const [photos, setPhotos]         = useState([]);
  const [error, setError]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [done, setDone]             = useState(false);

  const toggleTag = (t) =>
    setTags(p => p.includes(t) ? p.filter(x=>x!==t) : [...p, t]);

  const submit = () => {
    if (rating === 0) { setError("별점을 선택해주세요"); return; }
    if (text.trim().length < 10) { setError("후기를 10자 이상 입력해주세요"); return; }
    setError("");
    setLoading(true);
    setTimeout(() => { setLoading(false); setDone(true); }, 1000);
  };

  const STAR_LABELS = ["","별로예요","아쉬워요","보통이에요","좋아요","최고예요"];

  if (done) return (
    <div className="rvw-done-bg">
      <div className="rvw-done-card">
        <div className="rvw-done-emoji">⭐</div>
        <h2 className="rvw-done-title">후기 작성 완료!</h2>
        <p className="rvw-done-sub">소중한 후기가 등록됐어요<br/>더 나은 대여 문화를 만들어주셔서 감사해요</p>
        <button className="btn-primary" onClick={onComplete}>확인</button>
      </div>
    </div>
  );

  return (
    <div className="rvw-bg">
      <div className="rvw-header">
        <button className="nav-back" onClick={onBack}><span>←</span></button>
        <div className="rvw-header-title">후기 작성</div>
        <div style={{width:36}} />
      </div>

      <div className="rvw-body">
        {/* 물품 정보 */}
        <div className="rvw-item-card">
          <span className="rvw-item-img">{target?.image}</span>
          <div>
            <div className="rvw-item-name">{target?.name}</div>
            <div className="rvw-item-meta">거래 완료 · {target?.date || "5/10 ~ 5/12"}</div>
            <div className="rvw-seller-row">
              <div className="rvw-seller-avatar">{target?.owner?.[0]||"판"}</div>
              <span>{target?.owner || "판매자"}</span>
            </div>
          </div>
        </div>

        {/* 별점 */}
        <div className="rvw-section">
          <div className="rvw-section-title">전체 만족도 <span className="req">*</span></div>
          <div className="rvw-big-star-wrap">
            <StarRow value={rating} onChange={setRating} size="big" />
            {rating > 0 && (
              <div className="rvw-star-label">{STAR_LABELS[rating]}</div>
            )}
          </div>
        </div>

        {/* 세부 평가 */}
        <div className="rvw-section">
          <div className="rvw-section-title">세부 평가</div>
          <div className="rvw-sub-list">
            {SUB_RATINGS.map(s => (
              <div key={s.id} className="rvw-sub-row">
                <span className="rvw-sub-icon">{s.icon}</span>
                <span className="rvw-sub-label">{s.label}</span>
                <StarRow value={subRatings[s.id]} onChange={v=>setSubRatings(p=>({...p,[s.id]:v}))} size="small" />
              </div>
            ))}
          </div>
        </div>

        {/* 빠른 태그 */}
        <div className="rvw-section">
          <div className="rvw-section-title">이런 점이 좋았어요</div>
          <div className="rvw-tags-wrap">
            {QUICK_TAGS.map(t => (
              <button key={t}
                className={`rvw-tag ${tags.includes(t)?"active":""}`}
                onClick={() => toggleTag(t)}>
                {tags.includes(t)?"✓ ":""}{t}
              </button>
            ))}
          </div>
        </div>

        {/* 텍스트 */}
        <div className="rvw-section">
          <div className="rvw-section-title">후기 내용 <span className="req">*</span></div>
          <textarea
            className="rvw-textarea"
            placeholder="대여 경험을 솔직하게 남겨주세요&#10;다른 사용자에게 큰 도움이 됩니다 (최소 10자)"
            value={text}
            onChange={e => setText(e.target.value)}
            rows={5}
          />
          <div className="rvw-char-count">{text.length}자</div>
        </div>

        {/* 사진 첨부 */}
        <div className="rvw-section">
          <div className="rvw-section-title">사진 첨부 <span className="rvw-optional">(선택)</span></div>
          <div className="rvw-photo-row">
            {photos.map((p,i) => (
              <div key={i} className="rvw-photo-item">
                <span>{p}</span>
                <button className="rvw-photo-del" onClick={()=>setPhotos(ps=>ps.filter((_,j)=>j!==i))}>✕</button>
              </div>
            ))}
            {photos.length < 3 && (
              <button className="rvw-photo-add"
                onClick={()=>setPhotos(p=>[...p,["📷","🎥","📸"][p.length]])}>
                <span>+</span>
                <span>사진</span>
              </button>
            )}
          </div>
        </div>

        {error && <div className="rvw-error">⚠ {error}</div>}

        <div style={{height:100}}/>
      </div>

      <div className="rvw-bottom-bar">
        <button className="btn-primary" onClick={submit} disabled={loading}>
          {loading ? "등록 중..." : "후기 등록하기"}
        </button>
      </div>
    </div>
  );
}
