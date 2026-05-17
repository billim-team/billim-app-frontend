import { useState } from "react";
import "./Auth.css";

export default function Login({ onLogin, onGoRegister }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("이메일과 비밀번호를 입력해주세요.");
      return;
    }
    setLoading(true);
    // 임시 로그인 (나중에 백엔드 API 연결)
    setTimeout(() => {
      setLoading(false);
      onLogin({ email: form.email, name: "사용자" });
    }, 1000);
  };

  const handleOAuth = (provider) => {
    alert(`${provider} 로그인은 백엔드 연결 후 사용 가능합니다.`);
  };

  return (
    <div className="auth-bg">
      <div className="auth-deco">
        <span className="deco-text">BILLIM</span>
        <span className="deco-text">BILLIM</span>
        <span className="deco-text">BILLIM</span>
      </div>

      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">⚡</div>
          <h1 className="auth-title">다시 만나서<br />반가워요</h1>
          <p className="auth-sub">장비 대여 서비스에 로그인하세요</p>
        </div>

        <div className="oauth-row">
          <button className="oauth-btn" onClick={() => handleOAuth("카카오")}>
            <span className="oauth-icon">💬</span> 카카오
          </button>
          <button className="oauth-btn" onClick={() => handleOAuth("구글")}>
            <span className="oauth-icon">🔵</span> 구글
          </button>
          <button className="oauth-btn" onClick={() => handleOAuth("네이버")}>
            <span className="oauth-icon">🟢</span> 네이버
          </button>
        </div>

        <div className="divider"><span>또는 이메일로</span></div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-wrap">
            <label>이메일</label>
            <input
              type="email"
              name="email"
              placeholder="example@email.com"
              value={form.email}
              onChange={handleChange}
            />
          </div>
          <div className="input-wrap">
            <label>비밀번호</label>
            <input
              type="password"
              name="password"
              placeholder="비밀번호 입력"
              value={form.password}
              onChange={handleChange}
            />
          </div>

          {error && <p className="auth-error">⚠ {error}</p>}

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <p className="auth-footer">
          계정이 없으신가요?{" "}
          <button className="link-btn" onClick={onGoRegister}>회원가입</button>
        </p>
      </div>
    </div>
  );
}