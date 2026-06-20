import { useState, useEffect } from "react";
import { itemAPI } from "../api";
import "./ItemRegister.css";

const CAT_ICONS = { "디지털기기":"📱", "공구":"🔧", "취미용품":"🎨" };
const DEFAULT_ICON = "📦";

const STEPS = ["기본 정보", "상세 설명", "가격·조건", "사진 등록"];

export default function ItemRegister({ onBack, onComplete, user }) {
  const [step,     setStep]    = useState(0);
  const [done,     setDone]    = useState(false);
  const [loading,  setLoad]    = useState(false);
  const [apiError, setApiError]= useState("");
  const [categories, setCats]  = useState([]); // 백엔드에서 불러온 카테고리
  const [form, setForm] = useState({
    name:"", categoryId:null, categoryName:"", desc:"", price:"",
    minDays:1, maxDays:14, location:"", precautions:"", tags:"", photos:[],
  });
  const [errors, setErrors] = useState({});

  // ── 카테고리 목록 API 호출
  useEffect(() => {
    fetch("/api/items/categories/", {
      headers: { "ngrok-skip-browser-warning": "true" }
    })
      .then(r => r.json())
      .then(data => setCats(Array.isArray(data) ? data : []))
      .catch(() => setCats([]));
  }, []);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const validate = () => {
    const e = {};
    if (step === 0) {
      if (!form.name.trim())      e.name     = "물품 이름을 입력해주세요";
      if (!form.categoryId)       e.category = "카테고리를 선택해주세요";
      if (!form.location.trim())  e.location = "위치를 입력해주세요";
    }
    if (step === 1 && !form.desc.trim()) e.desc = "물품 설명을 입력해주세요";
    if (step === 2 && (!form.price || isNaN(form.price) || Number(form.price) < 1000))
      e.price = "1,000원 이상의 올바른 가격을 입력해주세요";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next  = () => { if (validate()) setStep(s => s + 1); };
  const prev  = () => setStep(s => s - 1);

  // ── 실제 API 호출
  const submit = async () => {
    if (!validate()) return;
    setApiError("");
    setLoad(true);
    try {
      const token = localStorage.getItem("billim_token");
      await itemAPI.create({
        title:      form.name,           // 백엔드 필드: title
        category:   form.categoryId,     // 백엔드 필드: category (pk 숫자)
        owner:      user?.id,            // 백엔드 필드: owner (user pk)
        description: form.desc,
        price_day:  Number(form.price),
        min_days:   form.minDays,
        max_days:   form.maxDays,
        location:   form.location,
        precautions: form.precautions,
        tags:       form.tags,
      });
      setDone(true);
    } catch (err) {
      const detail = err?.detail || {};
      const first  = Object.values(detail)[0];
      const msg    = Array.isArray(first) ? first[0] : (detail?.detail || "등록에 실패했어요. 다시 시도해주세요.");
      setApiError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoad(false);
    }
  };

  const addPhoto    = () => {
    if (form.photos.length >= 5) return;
    const emojis = ["📷","🎥","🔭","💡","🎙️","🔧","⛺","🚁"];
    set("photos", [...form.photos, emojis[Math.floor(Math.random() * emojis.length)]]);
  };
  const removePhoto = (i) => set("photos", form.photos.filter((_,idx) => idx !== i));

  // ── 완료 화면
  if (done) return (
    <div className="ir-done-bg">
      <div className="ir-done-card">
        <div className="ir-done-anim">🎉</div>
        <h2 className="ir-done-title">등록 완료!</h2>
        <p className="ir-done-sub">
          <strong>{form.name}</strong>이<br />성공적으로 등록되었어요
        </p>
        <div className="ir-done-info-box">
          <div className="ir-done-info-row">
            <span>카테고리</span>
            <span>{CAT_ICONS[form.categoryName] || DEFAULT_ICON} {form.categoryName}</span>
          </div>
          <div className="ir-done-info-row">
            <span>가격</span><span>{Number(form.price).toLocaleString()}원/일</span>
          </div>
          <div className="ir-done-info-row">
            <span>위치</span><span>{form.location}</span>
          </div>
        </div>
        <button className="btn-primary" onClick={onComplete}>확인</button>
        <button className="ir-done-secondary" onClick={() => {
          setDone(false); setStep(0);
          setForm({ name:"",categoryId:null,categoryName:"",desc:"",price:"",minDays:1,maxDays:14,location:"",precautions:"",tags:"",photos:[] });
        }}>추가 등록하기</button>
      </div>
    </div>
  );

  return (
    <div className="ir-bg">
      <div className="ir-header">
        <button className="nav-back" onClick={step === 0 ? onBack : prev}><span>←</span></button>
        <div className="ir-header-title">물품 등록</div>
        <div className="ir-step-badge">{step + 1}/{STEPS.length}</div>
      </div>

      <div className="ir-progress-wrap">
        <div className="ir-progress-track">
          <div className="ir-progress-fill" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
        </div>
        <div className="ir-step-labels">
          {STEPS.map((s, i) => (
            <span key={i} className={`ir-step-lbl ${i === step ? "active" : i < step ? "done" : ""}`}>
              {i < step ? "✓" : s}
            </span>
          ))}
        </div>
      </div>

      <div className="ir-form-wrap">

        {/* ── STEP 0: 기본 정보 */}
        {step === 0 && (
          <div className="ir-step-body">
            <div className="ir-step-head">
              <h2 className="ir-step-title">기본 정보를<br />입력해주세요</h2>
              <p className="ir-step-desc">물품의 이름, 카테고리, 위치를 알려주세요</p>
            </div>

            <div className="input-wrap">
              <label>물품 이름 <span className="req">*</span></label>
              <input placeholder="예: 소니 A7IV 풀프레임 미러리스"
                value={form.name} onChange={e => set("name", e.target.value)}
                className={errors.name ? "input-error" : ""} />
              {errors.name && <span className="err-msg">{errors.name}</span>}
            </div>

            <div className="input-wrap">
              <label>카테고리 <span className="req">*</span></label>
              {categories.length === 0 ? (
                <p style={{fontSize:"13px", color:"var(--text3)"}}>카테고리 불러오는 중...</p>
              ) : (
                <div className="cat-select-grid">
                  {categories.map(c => (
                    <button key={c.category_id} type="button"
                      className={`cat-select-btn ${form.categoryId === c.category_id ? "active" : ""}`}
                      onClick={() => { set("categoryId", c.category_id); set("categoryName", c.category_name); }}>
                      <span className="csb-icon">{CAT_ICONS[c.category_name] || DEFAULT_ICON}</span>
                      <span className="csb-label">{c.category_name}</span>
                    </button>
                  ))}
                </div>
              )}
              {errors.category && <span className="err-msg">{errors.category}</span>}
            </div>

            <div className="input-wrap">
              <label>거래 위치 <span className="req">*</span></label>
              <input placeholder="예: 서울 마포구 홍대입구역 근처"
                value={form.location} onChange={e => set("location", e.target.value)}
                className={errors.location ? "input-error" : ""} />
              {errors.location && <span className="err-msg">{errors.location}</span>}
            </div>

            <div className="input-wrap">
              <label>태그 (선택)</label>
              <input placeholder="예: 배터리포함, 케이스포함 (쉼표로 구분)"
                value={form.tags} onChange={e => set("tags", e.target.value)} />
              <span className="input-hint">검색 노출에 도움이 됩니다</span>
            </div>
          </div>
        )}

        {/* ── STEP 1: 상세 설명 */}
        {step === 1 && (
          <div className="ir-step-body">
            <div className="ir-step-head">
              <h2 className="ir-step-title">물품을 자세히<br />설명해주세요</h2>
              <p className="ir-step-desc">구성품, 상태, 주의사항 등을 알려주세요</p>
            </div>
            <div className="input-wrap">
              <label>물품 설명 <span className="req">*</span></label>
              <textarea className={`ir-textarea ${errors.desc ? "input-error" : ""}`}
                placeholder={"예:\n• 구성품: 본체, 배터리 2개\n• 상태: 구매 6개월, 스크래치 없음"}
                value={form.desc} onChange={e => set("desc", e.target.value)} rows={6} />
              <div className="textarea-count">{form.desc.length} / 500자</div>
              {errors.desc && <span className="err-msg">{errors.desc}</span>}
            </div>
            <div className="input-wrap">
              <label>주의사항 (선택)</label>
              <textarea className="ir-textarea"
                placeholder={"예:\n• 배터리는 반납 시 완충 부탁드립니다"}
                value={form.precautions} onChange={e => set("precautions", e.target.value)} rows={4} />
            </div>
            <div className="ai-notice-box">
              <div className="ai-notice-icon">🤖</div>
              <div className="ai-notice-text">
                <strong>AI 손상도 비교 안내</strong>
                <p>대여 전·후 사진을 AI가 자동으로 비교분석하여 손상 여부를 확인합니다.</p>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: 가격·조건 */}
        {step === 2 && (
          <div className="ir-step-body">
            <div className="ir-step-head">
              <h2 className="ir-step-title">가격과 조건을<br />설정해주세요</h2>
              <p className="ir-step-desc">하루 대여 가격과 대여 가능 기간을 설정하세요</p>
            </div>
            <div className="input-wrap">
              <label>하루 대여 가격 (원) <span className="req">*</span></label>
              <div className="price-input-wrap">
                <input type="number" placeholder="10000"
                  value={form.price} onChange={e => set("price", e.target.value)}
                  className={errors.price ? "input-error" : ""} />
                <span className="price-unit">원 / 일</span>
              </div>
              {form.price && !isNaN(form.price) && (
                <div className="price-preview">
                  <span>3일 → <strong>{(Number(form.price)*3).toLocaleString()}원</strong></span>
                  <span>7일 → <strong>{(Number(form.price)*7).toLocaleString()}원</strong></span>
                </div>
              )}
              {errors.price && <span className="err-msg">{errors.price}</span>}
            </div>
            <div className="input-wrap">
              <label>최소 대여 기간</label>
              <div className="stepper-row">
                <button type="button" className="stepper-btn" onClick={()=>set("minDays",Math.max(1,form.minDays-1))}>−</button>
                <span className="stepper-val">{form.minDays}일</span>
                <button type="button" className="stepper-btn" onClick={()=>set("minDays",Math.min(form.maxDays,form.minDays+1))}>＋</button>
              </div>
            </div>
            <div className="input-wrap">
              <label>최대 대여 기간</label>
              <div className="stepper-row">
                <button type="button" className="stepper-btn" onClick={()=>set("maxDays",Math.max(form.minDays,form.maxDays-1))}>−</button>
                <span className="stepper-val">{form.maxDays}일</span>
                <button type="button" className="stepper-btn" onClick={()=>set("maxDays",Math.min(30,form.maxDays+1))}>＋</button>
              </div>
            </div>
            <div className="price-summary-box">
              <div className="psb-row"><span>최소 대여</span><span><strong>{form.price?(Number(form.price)*form.minDays).toLocaleString():"—"}원</strong></span></div>
              <div className="psb-row"><span>최대 대여</span><span><strong>{form.price?(Number(form.price)*form.maxDays).toLocaleString():"—"}원</strong></span></div>
              <div className="psb-row highlight"><span>플랫폼 수수료 (5%)</span><span>{form.price?`−${Math.round(Number(form.price)*0.05).toLocaleString()}원/일`:"—"}</span></div>
            </div>
          </div>
        )}

        {/* ── STEP 3: 사진 등록 */}
        {step === 3 && (
          <div className="ir-step-body">
            <div className="ir-step-head">
              <h2 className="ir-step-title">물품 사진을<br />등록해주세요</h2>
              <p className="ir-step-desc">최대 5장까지 등록 가능합니다 (필수 1장)</p>
            </div>
            <div className="photo-grid">
              {form.photos.map((p, i) => (
                <div key={i} className="photo-item">
                  <span className="photo-emoji">{p}</span>
                  {i === 0 && <span className="photo-main-tag">대표</span>}
                  <button className="photo-remove" onClick={() => removePhoto(i)}>✕</button>
                </div>
              ))}
              {form.photos.length < 5 && (
                <button className="photo-add-btn" onClick={addPhoto}>
                  <span className="photo-add-icon">+</span>
                  <span className="photo-add-label">사진 추가</span>
                </button>
              )}
            </div>
            <div className="photo-tip-list">
              <p className="photo-tip-title">📸 사진 촬영 가이드</p>
              {["어두운 배경 위에 물품을 놓아주세요","빛이 반사되지 않도록 방향을 조절해주세요",
                "전면·후면·측면 등 다양한 각도로 촬영해주세요","스크래치·파손 부위가 있다면 반드시 촬영해주세요",
              ].map((t, i) => (
                <div key={i} className="photo-tip-item">
                  <span className="photo-tip-dot" />
                  <span>{t}</span>
                </div>
              ))}
            </div>
            <div className="final-summary">
              <p className="fs-title">등록 요약</p>
              <div className="fs-row"><span>물품명</span><span>{form.name}</span></div>
              <div className="fs-row"><span>카테고리</span><span>{CAT_ICONS[form.categoryName] || DEFAULT_ICON} {form.categoryName}</span></div>
              <div className="fs-row"><span>가격</span><span>{Number(form.price).toLocaleString()}원/일</span></div>
              <div className="fs-row"><span>위치</span><span>{form.location}</span></div>
              <div className="fs-row"><span>대여 기간</span><span>{form.minDays}일 ~ {form.maxDays}일</span></div>
            </div>
            {apiError && <div className="ir-api-error">⚠ {apiError}</div>}
          </div>
        )}
      </div>

      <div className="ir-bottom-bar">
        {step < STEPS.length - 1 ? (
          <button className="btn-primary" onClick={next}>다음 단계 →</button>
        ) : (
          <button className="btn-primary ir-submit-btn" onClick={submit} disabled={loading}>
            {loading ? "등록 중..." : "🚀 물품 등록하기"}
          </button>
        )}
      </div>
    </div>
  );
}


const handleSubmit = async (e) => {
  e.preventDefault();
  if (!form.username || !form.password) {
    setError("아이디와 비밀번호를 입력해주세요.");
    return;
  }
  setLoading(true);
  try {
    const res = await authAPI.login({
      username: form.username,
      password: form.password,
    });

    const token = res.token ?? res.auth_token ?? res.key;
    if (token) localStorage.setItem("billim_token", token);

    // me() 에러를 별도로 확인
    try {
      const me = await authAPI.me();
      console.log("🔍 my-settings:", me);
      onLogin(me);
    } catch (meErr) {
      console.log("🔍 me() 에러:", meErr); // ← 여기서 원인 확인
      // me() 실패해도 일단 로그인은 진행
      onLogin({ id: null, username: form.username });
    }

  } catch (err) {
    const detail = err?.detail;
    if (detail?.non_field_errors) {
      setError(detail.non_field_errors[0]);
    } else if (detail?.username) {
      setError(detail.username[0]);
    } else {
      setError("아이디 또는 비밀번호가 올바르지 않습니다.");
    }
  } finally {
    setLoading(false);
  }
};
