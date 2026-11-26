import { useState } from "react";
import "./App.css";
import "./design-system.css";
import Navbar from "./components/navbar";
import Login from "./components/login";
import Register from "./components/register";
import ResumeUpload from "./components/resumeUpload";
import HiringDashboard from "./components/HiringDashboard";
import FireCursor from "./components/fireCursor";
function getStoredUser() {
  try {
    const savedUser = localStorage.getItem("user");

    if (!savedUser) {
      return null;
    }

    const parsed = JSON.parse(savedUser);

    // Also supports an older nested login response.
    return parsed?.user ?? parsed;

  } catch (error) {
    console.error("USER STORAGE ERROR:", error);
    return null;
  }
}


function App() {
  const [page, setPage] = useState("home");

  const [isLoggedIn, setIsLoggedIn] = useState(
    Boolean(localStorage.getItem("token"))
  );

  const [currentUser, setCurrentUser] = useState(
    getStoredUser
  );


  /* ==========================================
     LOGIN
  ========================================== */

  const handleLogin = (user) => {
    const normalizedUser = user?.user ?? user;

    setCurrentUser(normalizedUser || null);

    if (normalizedUser) {
      localStorage.setItem(
        "user",
        JSON.stringify(normalizedUser)
      );
    } else {
      localStorage.removeItem("user");
    }

    setIsLoggedIn(true);
    setPage("dashboard");
  };


  /* ==========================================
     LOGOUT
  ========================================== */

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setCurrentUser(null);
    setIsLoggedIn(false);
    setPage("home");
  };


  /* ==========================================
     ROLE CHECKS
  ========================================== */

  const isVerifiedHiringTeam =
    currentUser?.role === "hiringTeam" &&
    currentUser?.hiringTeamVerified === true;

  const isPendingHiringTeam =
    currentUser?.role === "hiringTeam" &&
    currentUser?.hiringTeamVerified !== true;


  return (
  <div className="app-shell" id="top">

    {/* GLOBAL FIRE CURSOR */}
    <FireCursor />

    {/* GLOBAL NAVIGATION */}

      <Navbar
  onLogin={() => setPage("login")}
  onRegister={() => setPage("register")}
  isLoggedIn={isLoggedIn}
  currentUser={currentUser}
  showMarketingLinks={!isLoggedIn && page === "home"}
/>


      {/* ======================================
          PUBLIC HOME PAGE
      ====================================== */}

      {!isLoggedIn && page === "home" && (
        <>
          <main className="hero">

            <div className="hero-badge">
              ✦ AI-POWERED CAREER INTELLIGENCE
            </div>

            <h1>
              Your Career.
              <br />
              <span>Without the Guesswork.</span>
            </h1>

            <p>
              Analyze your resume, discover real job opportunities,
              and get brutally honest AI feedback.
              Make every application count with RoastHire AI.
            </p>

            <div className="hero-actions">

              <button
                className="primary-btn"
                onClick={() => setPage("register")}
              >
                Start Your Journey →
              </button>

              <button
                className="secondary-btn"
                onClick={() => setPage("login")}
              >
                Explore Your Workspace
              </button>

            </div>

            <div className="hero-stats">
              <span>✦ AI Resume Insights</span>
              <span>◈ Smart Job Matching</span>
              <span>🔥 Honest Feedback</span>
            </div>

          </main>


          {/* FEATURES */}

          <section
            className="home-section"
            id="features"
          >

            <div className="home-section-heading">

              <span className="eyebrow">
                YOUR CAREER TOOLKIT
              </span>

              <h2>
                Everything you need to
                <br />
                move forward.
              </h2>

              <p>
                From understanding your resume to discovering
                your next opportunity, build your career with
                intelligent tools.
              </p>

            </div>

            <div className="home-feature-grid">

              <div className="home-feature-card">
                <div className="home-feature-icon">◈</div>
                <h3>Resume Analysis</h3>
                <p>
                  Understand your resume through AI-powered
                  insights, scores and improvement suggestions.
                </p>
              </div>

              <div className="home-feature-card">
                <div className="home-feature-icon">🔥</div>
                <h3>Roast Mode</h3>
                <p>
                  Get direct, honest and constructive feedback
                  about the weak areas of your resume.
                </p>
              </div>

              <div className="home-feature-card">
                <div className="home-feature-icon">◎</div>
                <h3>Job Discovery</h3>
                <p>
                  Explore vacancies published by hiring teams
                  and discover relevant opportunities.
                </p>
              </div>

              <div className="home-feature-card">
                <div className="home-feature-icon">✦</div>
                <h3>AI Job Matching</h3>
                <p>
                  Compare your saved resume with job
                  requirements and uncover skill gaps.
                </p>
              </div>

            </div>

          </section>


          {/* HOW IT WORKS */}

          <section
            className="home-section"
            id="how-it-works"
          >

            <div className="home-section-heading">

              <span className="eyebrow">
                A BETTER WAY TO PREPARE
              </span>

              <h2>
                Your next opportunity,
                <br />
                one step at a time.
              </h2>

            </div>

            <div className="home-steps">

              <div className="home-step-card">
                <span className="home-step-number">
                  STEP 01
                </span>

                <h3>Understand your profile</h3>

                <p>
                  Upload your resume and get an AI-generated
                  breakdown of your strengths and weaknesses.
                </p>
              </div>

              <div className="home-step-card">
                <span className="home-step-number">
                  STEP 02
                </span>

                <h3>Discover opportunities</h3>

                <p>
                  Explore jobs published by hiring teams and
                  compare them with your career goals.
                </p>
              </div>

              <div className="home-step-card">
                <span className="home-step-number">
                  STEP 03
                </span>

                <h3>Improve and apply</h3>

                <p>
                  Understand your skill gaps, improve your
                  profile and apply to relevant opportunities.
                </p>
              </div>

            </div>

          </section>

        </>
      )}


      {/* ======================================
          REGISTRATION
      ====================================== */}

      {!isLoggedIn && page === "register" && (
        <Register
          onSwitchToLogin={() => setPage("login")}
        />
      )}


      {/* ======================================
          LOGIN
      ====================================== */}

      {!isLoggedIn && page === "login" && (
        <Login
          onLogin={handleLogin}
          onSwitchToRegister={() => setPage("register")}
        />
      )}


      {/* ======================================
          VERIFIED HIRING TEAM
      ====================================== */}

      {isLoggedIn && isVerifiedHiringTeam && (
        <HiringDashboard
          onLogout={handleLogout}
        />
      )}


      {/* ======================================
          PENDING HIRING TEAM
      ====================================== */}

      {isLoggedIn && isPendingHiringTeam && (
        <main className="hero">

          <div className="hero-badge">
            EMPLOYER ACCOUNT
          </div>

          <h1>
            Your verification
            <br />
            <span>is in progress.</span>
          </h1>

          <p>
            Your hiring-team account is awaiting approval.
            Publishing opportunities will become available
            after verification.
          </p>

          <button
            className="primary-btn"
            onClick={handleLogout}
          >
            Sign Out
          </button>

        </main>
      )}


      {/* ======================================
          CANDIDATE DASHBOARD
      ====================================== */}

      {isLoggedIn &&
        !isVerifiedHiringTeam &&
        !isPendingHiringTeam && (
          <ResumeUpload
            onLogout={handleLogout}
          />
        )}

    </div>
  );
}

export default App;
