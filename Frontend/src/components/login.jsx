import { useState } from "react";

function Login({ onLogin, onSwitchToRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "http://localhost:3000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);

      onLogin(data);
    } catch (error) {
      console.error("LOGIN ERROR:", error);
      alert("Unable to connect to server.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-badge">ROASTHIRE AI</div>

        <h2>Welcome back</h2>
        <p className="auth-subtitle">
          Log in and let your resume do the talking.
        </p>

        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="primary-btn" type="submit">
            Login →
          </button>
        </form>

        <p className="switch-text">
          Don't have an account?
          <button
            className="link-btn"
            onClick={onSwitchToRegister}
          >
            Create one
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;