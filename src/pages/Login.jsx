import { useState } from "react";
import { authAPI } from "../api";
import "./Auth.css";

export default function Login({ onLogin, onGoRegister }) {
  const [form,    setForm]    = useState({ username: "", password: "" });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

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

      const me = await authAPI.me();
      console.log("🔍 my-settings 응답:", me);
      onLogin(me);

    } catch (err) {
      console.log("🔍 에러:", err);
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

        <div className="divider"><span>또는 아이디로</span></div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-wrap">
            <label>아이디</label>
            <input
              type="text" name="username"
              placeholder="아이디 입력"
              value={form.username} onChange={handleChange}
            />
          </div>
          <div className="input-wrap">
            <label>비밀번호</label>
            <input
              type="password" name="password"
              placeholder="비밀번호 입력"
              value={form.password} onChange={handleChange}
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
