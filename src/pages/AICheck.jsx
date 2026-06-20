import { useState } from "react";
import "./AICheck.css";

const PHOTO_STEPS = [
  { label:"정면", hint:"물품의 앞면을 네모 안에 맞춰 촬영해주세요" },
  { label:"후면", hint:"물품의 뒷면을 촬영해주세요" },
  { label:"측면", hint:"물품의 측면 및 세부 부위를 촬영해주세요" },
];

const TIPS = [
  "어두운 배경 위에 물품을 놓아주세요",
  "빛이 반사되지 않도록 방향을 조절해주세요",
  "네모 영역에 물품 전체가 들어오도록 맞춰주세요",
  "스크래치·파손 부위가 있다면 가까이서 촬영해주세요",
];

const AI_RESULT = {
  score: 97,
  status: "normal",
  details: [
    { part:"외관", result:"정상", note:"스크래치 없음" },
    { part:"렌즈/기능부", result:"정상", note:"이상 없음" },
    { part:"액세서리", result:"정상", note:"구성품 일치" },
  ],
};

export default function AICheck({ item, mode = "after", onBack, onDone }) {
  const [phase, setPhase]   = useState("guide");  // guide | capture | analyzing | result
  const [step, setStep]     = useState(0);
  const [photos, setPhotos] = useState([]);
  const [helpOpen, setHelp] = useState(false);
  const [progress, setProg] = useState(0);

  const isAfter = mode === "after";
  const title   = isAfter ? "반납 검수" : "대여 전 검수";

  const takePhoto = () => {
    const taken = [...photos, PHOTO_STEPS[step].label];
    setPhotos(taken);
    if (step < PHOTO_STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      setPhase("analyzing");
      let p = 0;
      const iv = setInterval(() => {
        p += 3;
        setProg(p);
        if (p >= 100) { clearInterval(iv); setPhase("result"); }
      }, 60);
    }
  };

  return (
    <div className="aic-bg">
      <div className="aic-header">
        <button className="nav-back" onClick={onBack}><span>←</span></button>
        <div className="aic-header-title">{title}</div>
        <button className="aic-help-btn" onClick={() => setHelp(h => !h)}>도움말</button>
      </div>

      {helpOpen && (
        <div className="aic-help-panel">
          <div className="aic-help-title">📸 촬영 가이드</div>
          {TIPS.map((t,i) => (
            <div key={i} className="aic-tip-row">
              <span className="aic-tip-dot" />
              <span>{t}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── 가이드 화면 ── */}
      {phase === "guide" && (
        <div className="aic-body">
          <div className="aic-item-banner">
            <span className="aic-item-img">{item?.image}</span>
            <div>
              <div className="aic-item-name">{item?.name}</div>
              <div className="aic-item-sub">{isAfter ? "반납 후 손상 여부를 AI로 확인합니다" : "대여 전 상태를 기록합니다"}</div>
            </div>
          </div>

          <div className="aic-steps-preview">
            {PHOTO_STEPS.map((s,i) => (
              <div key={i} className="aic-step-row">
                <div className="aic-step-num">{i+1}</div>
                <div className="aic-step-text">
                  <div className="aic-step-label">{s.label} 사진</div>
                  <div className="aic-step-hint">{s.hint}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="aic-info-box">
            <span>🤖</span>
            <span>총 3장의 사진을 촬영하면 AI가 자동으로 분석합니다.<br/>분석 결과는 거래 기록에 저장됩니다.</span>
          </div>

          <div className="aic-bottom">
            <button className="btn-primary" onClick={() => setPhase("capture")}>
              사진 촬영 시작
            </button>
          </div>
        </div>
      )}

      {/* ── 촬영 화면 ── */}
      {phase === "capture" && (
        <div className="aic-capture-wrap">
          <div className="aic-progress-row">
            {PHOTO_STEPS.map((s,i) => (
              <div key={i} className={`aic-prog-dot ${i < photos.length?"done":i===step?"active":""}`}>
                {i < photos.length ? "✓" : i+1}
              </div>
            ))}
          </div>

          <div className="aic-step-info">
            <div className="aic-step-current">{PHOTO_STEPS[step].label} 촬영</div>
            <div className="aic-step-hint-txt">{PHOTO_STEPS[step].hint}</div>
          </div>

          <div className="aic-viewfinder">
            <div className="aic-vf-inner">
              <span className="aic-vf-emoji">{item?.image}</span>
              <div className="aic-vf-corner tl"/><div className="aic-vf-corner tr"/>
              <div className="aic-vf-corner bl"/><div className="aic-vf-corner br"/>
            </div>
            <div className="aic-vf-label">{PHOTO_STEPS[step].label}</div>
          </div>

          <div className="aic-shutter-area">
            <button className="aic-shutter-btn" onClick={takePhoto}>
              <div className="aic-shutter-inner" />
            </button>
            <p className="aic-shutter-label">버튼을 눌러 촬영하세요</p>
          </div>
        </div>
      )}

      {/* ── 분석 중 ── */}
      {phase === "analyzing" && (
        <div className="aic-analyzing-wrap">
          <div className="aic-analyzing-icon">🤖</div>
          <h2 className="aic-analyzing-title">AI 분석 중...</h2>
          <p className="aic-analyzing-sub">촬영된 사진 {photos.length}장을 분석하고 있어요</p>
          <div className="aic-prog-bar-wrap">
            <div className="aic-prog-bar-fill" style={{width:`${progress}%`}} />
          </div>
          <p className="aic-prog-pct">{progress}%</p>
          <div className="aic-analyzing-steps">
            {["이미지 전처리","손상 패턴 탐지","이전 기록과 비교","결과 생성"].map((t,i)=>(
              <div key={i} className={`aic-a-step ${progress>i*25?"done":""}`}>
                <span className="aic-a-check">{progress>i*25?"✓":"○"}</span>
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 결과 화면 ── */}
      {phase === "result" && (
        <div className="aic-body">
          <div className={`aic-result-banner ${AI_RESULT.status}`}>
            <div className="aic-result-icon">{AI_RESULT.status==="normal"?"✅":"⚠️"}</div>
            <div>
              <div className="aic-result-title">{AI_RESULT.status==="normal"?"손상 없음 · 정상":"손상 의심 · 주의"}</div>
              <div className="aic-result-score">일치율 {AI_RESULT.score}%</div>
            </div>
          </div>

          {isAfter && (
            <div className="aic-compare-row">
              <div className="aic-compare-col">
                <div className="aic-compare-label">대여 전</div>
                <div className="aic-compare-img before">{item?.image}</div>
              </div>
              <div className="aic-compare-arrow">⇄</div>
              <div className="aic-compare-col">
                <div className="aic-compare-label">반납 후</div>
                <div className="aic-compare-img after">{item?.image}</div>
              </div>
            </div>
          )}

          <div className="aic-detail-list">
            <div className="aic-detail-title">세부 분석 결과</div>
            {AI_RESULT.details.map((d,i) => (
              <div key={i} className="aic-detail-row">
                <span className="aic-detail-part">{d.part}</span>
                <span className="aic-detail-note">{d.note}</span>
                <span className={`aic-detail-badge ${d.result==="정상"?"ok":"warn"}`}>{d.result}</span>
              </div>
            ))}
          </div>

          <div className="aic-result-notice">
            📋 분석 결과가 거래 기록에 저장됐습니다. 손상 분쟁 발생 시 증거 자료로 활용됩니다.
          </div>

          <div className="aic-bottom">
            <button className="btn-primary" onClick={onDone}>완료</button>
          </div>
        </div>
      )}
    </div>
  );
}
