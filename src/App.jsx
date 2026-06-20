import { useState } from "react";
import Login    from "./pages/Login";
import Register from "./pages/Register";
import Main     from "./pages/Main";
import "./App.css";

// ⚠️ 개발용 임시 플래그 — 백엔드 연결 후 false로 바꿀 것
const DEV_SKIP_LOGIN = false;
const DEV_USER = { id: 1, username: "개발자" };

export default function App() {
  const [page, setPage] = useState(DEV_SKIP_LOGIN ? "main" : "login");
  const [user, setUser] = useState(DEV_SKIP_LOGIN ? DEV_USER : null);

  const handleLogin = (userData) => {
    setUser(userData);
    setPage("main");
  };

  const handleLogout = () => {
    localStorage.removeItem("billim_token");
    setUser(null);
    setPage("login");
  };

  return (
    <div className="app-root">
      {page === "login" && (
        <Login onLogin={handleLogin} onGoRegister={() => setPage("register")} />
      )}
      {page === "register" && (
        <Register onGoLogin={() => setPage("login")} />
      )}
      {page === "main" && (
        <Main user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}
