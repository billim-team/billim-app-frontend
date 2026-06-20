import { useState, useEffect } from "react";
import { itemAPI } from "../api";
import "./ItemRegister.css";

const CAT_ICONS = { "디지털기기":"📱", "공구":"🔧", "취미용품":"🎨" };
const DEFAULT_ICON = "📦";
const STEPS = ["기본 정보", "상세 설명", "가격·조건"];

export default function ItemEdit({ item, onBack, onComplete }) {
  const [step,     setStep]    = useState(0);
  const [loading,  setLoad]    = useState(false);
  const [apiError, setApiError]= useState("");
  const [categories, setCats]  = useState([]);
  const [form, setForm] = useState({
    name:        item?.name        || "",
    categoryId:  item?.category_id || null,
    categoryName:item?.category    || "",
    desc:        item?.desc        || "",
    price:       item?.price       || "",
    minDays:     item?.min_days    || 1,
    maxDays:     item?.max_days    || 14,
    location:    item?.location    || "",
    precautions: item?.precautions || "",
    tags:        item?.tags        || "",
  });
  const [errors, setErrors] = useState({});

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
      if (!form.name.trim())     e.name     = "물품 이름을 입력해주세요";
      if (!form.location.trim()) e.location = "위치를 입력해주세요";
    }
    if (step === 1 && !form.desc.trim()) e.desc = "물품 설명을 입력해주세요";
    if (step === 2 && (!form.price || isNaN(form.price) || Number(form.price) < 1000))
      e.price = "1,000원 이상의 올바른 가격을 입력해주세요";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validate()) setStep(s => s + 1); };
  const prev = () => setStep(s => s - 1);

  const submit = async () => {
    if (!validate()) return;
    setApiError("");
    setLoad(true);
    try {
      await itemAPI.update(item.id, {
        title:       form.name,
        description: form.desc,
        price_day:   Number(form.price),
        min_days:    form.minDays,
        max_days:    form.maxDays,
        location:    form.location,
        precautions: form.precautions,
        tags:        form.tags,
        ...(form.categoryId ? { category: form.categoryId } : {}),
      });
      onComplete();
    } catch (err) {
      const detail = err?.detail || {};
      const first  = Object.values(detail)[0];
      const msg    = Array.isArray(first) ? first[0] : (detail?.detail || "수정에 실패했어요.");
      setApiError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoad(false);
    }
  };

  return (
    <div className="ir-bg">
      <div className="ir-header">
        <button className="nav-back" onClick={step === 0 ? onBack : prev}><span>←</span></button>
        <div className="ir-header-title">물품 수정</div>
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

        {/* STEP 0: 기본 정보 */}
        {step === 0 && (
          <div className="ir-step-body">
            <div className="ir-step-head">
              <h2 className="ir-step-title">기본 정보를<br />수정해주세요</h2>
            </div>

            <div className="input-wrap">
              <label>물품 이름 <span className="req">*</span></label>
              <input placeholder="예: 소니 A7IV 풀프레임 미러리스"
                value={form.name} onChange={e => set("name", e.target.value)}
                className={errors.name ? "input-error" : ""} />
              {errors.name && <span className="err-msg">{errors.name}</span>}
            </div>

            <div className="input-wrap">
              <label>카테고리</label>
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
              <input placeholder="예: 배터리포함, 케이스포함"
                value={form.tags} onChange={e => set("tags", e.target.value)} />
            </div>
          </div>
        )}

        {/* STEP 1: 상세 설명 */}
        {step === 1 && (
          <div className="ir-step-body">
            <div className="ir-step-head">
              <h2 className="ir-step-title">물품 설명을<br />수정해주세요</h2>
            </div>
            <div className="input-wrap">
              <label>물품 설명 <span className="req">*</span></label>
              <textarea className={`ir-textarea ${errors.desc ? "input-error" : ""}`}
                placeholder="구성품, 상태, 주의사항 등을 알려주세요"
                value={form.desc} onChange={e => set("desc", e.target.value)} rows={6} />
              <div className="textarea-count">{form.desc.length} / 500자</div>
              {errors.desc && <span className="err-msg">{errors.desc}</span>}
            </div>
            <div className="input-wrap">
              <label>주의사항 (선택)</label>
              <textarea className="ir-textarea"
                placeholder="대여 시 주의사항을 입력해주세요"
                value={form.precautions} onChange={e => set("precautions", e.target.value)} rows={4} />
            </div>
          </div>
        )}

        {/* STEP 2: 가격·조건 */}
        {step === 2 && (
          <div className="ir-step-body">
            <div className="ir-step-head">
              <h2 className="ir-step-title">가격과 조건을<br />수정해주세요</h2>
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

            {apiError && <div className="ir-api-error">⚠ {apiError}</div>}
          </div>
        )}
      </div>

      <div className="ir-bottom-bar">
        {step < STEPS.length - 1 ? (
          <button className="btn-primary" onClick={next}>다음 단계 →</button>
        ) : (
          <button className="btn-primary ir-submit-btn" onClick={submit} disabled={loading}>
            {loading ? "수정 중..." : "✅ 수정 완료"}
          </button>
        )}
      </div>
    </div>
  );
}
