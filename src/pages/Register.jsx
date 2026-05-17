import { useState } from "react";
import "./Auth.css";

export default function Register({ onGoLogin }) {
  const [form, setForm] = useState({
    name: "", email: "", password: "", password2: "", role: "borrower"
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setError("모든 항목을 입력해주세요."); return;
    }
    if (form.password !== form.password2) {
      setError("비밀번호가 일치하지 않습니다."); return;
    }
    if (form.password.length < 6) {
      setError("비밀번호는 6자 이상이어야 합니다."); return;
    }
    setLoading(true);
    setTimeout(() => { setLoading(false); setDone(true); }, 1000);
  };

  if (done) return (
    <div className="auth-bg">
      <div className="auth-card" style={{textAlign:'center'}}>
        <div style={{fontSize:'56px', marginBottom:'16px'}}>🎉</div>
        <h2 className="auth-title" style={{fontSize:'28px'}}>가입 완료!</h2>
        <p className="auth-sub" style={{marginTop:'8px', marginBottom:'32px'}}>
          장비 대여 서비스에 오신 것을 환영합니다
        </p>
        <button className="btn-primary" onClick={onGoLogin}>로그인하러 가기</button>
      </div>
    </div>
  );

  return (
    <div className="auth-bg">
      <div className="auth-deco">
        <span className="deco-text">BILLIM</span>
        <span className="deco-text">BILLIM</span>
        <span className="deco-text">BILLIM</span>
      </div>

      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">✦</div>
          <h1 className="auth-title">새 계정<br />만들기</h1>
          <p className="auth-sub">장비 대여 서비스를 시작해보세요</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-wrap">
            <label>이름</label>
            <input name="name" placeholder="홍길동" value={form.name} onChange={handleChange} />
          </div>
          <div className="input-wrap">
            <label>이메일</label>
            <input type="email" name="email" placeholder="example@email.com" value={form.email} onChange={handleChange} />
          </div>
          <div className="input-wrap">
            <label>비밀번호</label>
            <input type="password" name="password" placeholder="6자 이상" value={form.password} onChange={handleChange} />
          </div>
          <div className="input-wrap">
            <label>비밀번호 확인</label>
            <input type="password" name="password2" placeholder="비밀번호 재입력" value={form.password2} onChange={handleChange} />
          </div>

          

          {error && <p className="auth-error">⚠ {error}</p>}

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? "가입 중..." : "회원가입"}
          </button>
        </form>

        <p className="auth-footer">
          이미 계정이 있으신가요?{" "}
          <button className="link-btn" onClick={onGoLogin}>로그인</button>
        </p>
      </div>
    </div>
  );
}