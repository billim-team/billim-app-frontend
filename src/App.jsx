import { useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Main from "./pages/Main";
import "./App.css";

export default function App() {
  const [page, setPage] = useState("login"); // login | register | main
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
    setPage("main");
  };

  const handleLogout = () => {
    setUser(null);
    setPage("login");
  };

  return (
    <div className="app-root">
      {page === "login" && (
        <Login
          onLogin={handleLogin}
          onGoRegister={() => setPage("register")}
        />
      )}
      {page === "register" && (
        <Register
          onGoLogin={() => setPage("login")}
        />
      )}
      {page === "main" && (
        <Main user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}