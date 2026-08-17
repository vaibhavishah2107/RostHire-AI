import { useState } from "react";

function Register({ onSwitchToLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "http://localhost:3000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Registration failed");
        return;
      }

      alert("Registration successful! Please login.");
      onSwitchToLogin();
    } catch (error) {
      console.error("REGISTER ERROR:", error);
      alert("Unable to connect to server.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-badge">ROASTHIRE AI</div>

        <h2>Create your account</h2>
        <p className="auth-subtitle">
          Your resume's new best friend is waiting.
        </p>

        <form onSubmit={handleSubmit}>
          <label>Full Name</label>
          <input
            type="text"
            placeholder="Vaibhavi Shah"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

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
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="primary-btn" type="submit">
            Create Account →
          </button>
        </form>

        <p className="switch-text">
          Already have an account?
          <button
            className="link-btn"
            onClick={onSwitchToLogin}
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}

export default Register;