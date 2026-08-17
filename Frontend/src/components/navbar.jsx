function Navbar({ onLogin, onRegister }) {
  return (
    <nav className="navbar">
      <div className="logo">
        <span>◈</span> RoastHire AI
      </div>

      <div className="nav-links">
        <a href="#features">Features</a>
        <a href="#how-it-works">How it works</a>

        <button onClick={onLogin}>
          Login
        </button>

        <button
          className="nav-signup"
          onClick={onRegister}
        >
          Get Started
        </button>
      </div>
    </nav>
  );
}

export default Navbar;