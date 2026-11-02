import { useState } from "react";
import "./App.css";

import Navbar from "./components/navbar.jsx";
import Login from "./components/login.jsx";
import Register from "./components/register.jsx";
import ResumeUpload from "./components/resumeUpload.jsx";

function App() {
  const [page, setPage] = useState("home");

  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  const handleLogin = () => {
    setIsLoggedIn(true);
    setPage("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setPage("home");
  };

  return (
    <>
      <Navbar
        onLogin={() => setPage("login")}
        onRegister={() => setPage("register")}
      />

      {/* NOT LOGGED IN */}
      {!isLoggedIn && page === "home" && (
        <main className="hero">
          <div className="hero-badge">
            AI-POWERED RESUME ANALYSIS
          </div>

          <h1>
            Your Resume.
            <br />
            <span>An Honest Roast.</span>
          </h1>

          <p>
            RoastHire AI analyzes your resume, finds the weak spots,
            and tells you what recruiters actually see.
          </p>

          <div className="hero-actions">
            <button
              className="primary-btn"
              onClick={() => setPage("register")}
            >
              Get Started →
            </button>

            <button
              className="secondary-btn"
              onClick={() => setPage("login")}
            >
              I already have an account
            </button>
          </div>
        </main>
      )}

      {/* REGISTER */}
      {!isLoggedIn && page === "register" && (
        <Register
          onSwitchToLogin={() => setPage("login")}
        />
      )}

      {/* LOGIN */}
      {!isLoggedIn && page === "login" && (
        <Login
          onLogin={handleLogin}
          onSwitchToRegister={() => setPage("register")}
        />
      )}

      {/* LOGGED IN */}
      {isLoggedIn && (
        <ResumeUpload onLogout={handleLogout} />
      )}
    </>
  );
}

export default App;