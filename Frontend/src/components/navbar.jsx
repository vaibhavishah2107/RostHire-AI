
import { useState } from "react";
import "./Navbar.css";

function Navbar({
  onLogin,
  onRegister,
  isLoggedIn = false,
  currentUser = null,
  showMarketingLinks = true,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const accountName =
    currentUser?.name ||
    currentUser?.email ||
    "Your workspace";

  const roleLabel =
    currentUser?.role === "hiringTeam"
      ? "HIRING TEAM"
      : currentUser?.role === "admin"
        ? "ADMIN"
        : "CANDIDATE";

  const initials = accountName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const closeMenu = () => setMenuOpen(false);

  const handleLogin = () => {
    closeMenu();
    onLogin?.();
  };

  const handleRegister = () => {
    closeMenu();
    onRegister?.();
  };

  return (
    <header className="navbar premium-navbar">

      {/* BRAND */}

      <a
        href="#top"
        className="premium-brand"
        onClick={closeMenu}
        aria-label="RoastHire AI home"
      >
        <span className="premium-brand-mark">
          ◈
        </span>

        <span className="premium-brand-name">
          RoastHire
          <span>AI</span>
        </span>
      </a>

      {/* MOBILE MENU BUTTON */}

      <button
        type="button"
        className={`premium-menu-toggle ${
          menuOpen ? "is-open" : ""
        }`}
        onClick={() => setMenuOpen((previous) => !previous)}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
        aria-controls="premium-navigation"
      >
        <span />
        <span />
        <span />
      </button>

      {/* NAVIGATION */}

      <nav
        id="premium-navigation"
        className={`premium-nav-links ${
          menuOpen ? "is-open" : ""
        }`}
      >
{!isLoggedIn ? (
  <>
    <button onClick={handleLogin}>
      Log in
    </button>

    <button onClick={handleRegister}>
      Get Started
    </button>
  </>
) : (
  <div className="premium-account">
    <div className="premium-account-avatar">
      {initials || "R"}
    </div>

    <div className="premium-account-details">
      <strong>{accountName}</strong>
      <span>{roleLabel}</span>
    </div>

    <span className="premium-account-status" />
  </div>
)}

      </nav>

    </header>
  );
}

export default Navbar;
