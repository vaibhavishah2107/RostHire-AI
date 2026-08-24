import { useState } from "react";

function RoastMode({ onBack, resume }) {
  const [roastLevel, setRoastLevel] = useState("brutal");
  const [roast, setRoast] = useState("");
  const [roasting, setRoasting] = useState(false);
  const [error, setError] = useState("");

  const handleRoast = async () => {
    if (!resume) {
      setError("Please upload a resume first.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login first.");
      return;
    }

    try {
      setRoasting(true);
      setRoast("");
      setError("");

      console.log("Starting roast...");
      console.log("Roast level:", roastLevel);

      const formData = new FormData();

      formData.append("resume", resume);
      formData.append("roastLevel", roastLevel);

      const response = await fetch(
        "http://localhost:3000/api/resume/roast",
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
          },

          body: formData,
        }
      );

      console.log("Roast response status:", response.status);

      const data = await response.json();

      console.log("Roast response:", data);

      if (!response.ok) {
        setError(data.message || "Roast failed.");
        return;
      }

      setRoast(data.roast);

    } catch (error) {
      console.error("ROAST FRONTEND ERROR:", error);
      setError("Unable to connect to server.");
    } finally {
      setRoasting(false);
    }
  };

  return (
    <section className="roast-page">

      <button
        className="back-btn"
        onClick={onBack}
      >
        ← Back to Analysis
      </button>

      <div className="roast-hero">

        <span className="roast-badge">
          🔥 ROAST MODE
        </span>

        <h1>
          You asked for honesty.
          <br />
          <span>We're not holding back.</span>
        </h1>

        <p>
          RoastHire will find the vague claims, weak bullets,
          questionable skills and missed opportunities hiding
          inside your resume.
        </p>

      </div>

      <div className="roast-settings">

        <h2>
          Choose your roast level
        </h2>

        <p className="roast-description">
          Choose how much emotional damage you want.
        </p>

        <div className="roast-levels">

          <button
            className={`roast-level ${
              roastLevel === "mild" ? "active" : ""
            }`}
            onClick={() => setRoastLevel("mild")}
            disabled={roasting}
          >
            <span>😌</span>

            <strong>Mild</strong>

            <small>
              Constructive criticism
            </small>
          </button>

          <button
            className={`roast-level ${
              roastLevel === "brutal" ? "active" : ""
            }`}
            onClick={() => setRoastLevel("brutal")}
            disabled={roasting}
          >
            <span>🔥</span>

            <strong>Brutal</strong>

            <small>
              No sugarcoating
            </small>
          </button>

          <button
            className={`roast-level ${
              roastLevel === "nuclear" ? "active" : ""
            }`}
            onClick={() => setRoastLevel("nuclear")}
            disabled={roasting}
          >
            <span>💀</span>

            <strong>Nuclear</strong>

            <small>
              Absolutely ruthless
            </small>
          </button>

        </div>

        <button
          className="start-roast-btn"
          onClick={handleRoast}
          disabled={roasting}
        >
          {roasting
            ? "Roasting... 🔥"
            : "Roast My Resume 🔥"}
        </button>

        {error && (
          <p className="roast-error">
            {error}
          </p>
        )}

      </div>

      {resume && (
        <div className="roast-file">

          <span>📄</span>

          <div>
            <small>
              RESUME SELECTED
            </small>

            <p>
              {resume.name}
            </p>
          </div>

        </div>
      )}

      {roast && (
        <div className="roast-result">

          <div className="roast-result-header">
            <span className="roast-badge">
              🔥 ROAST COMPLETE
            </span>

            <h2>
              Here's what we found.
            </h2>
          </div>

          <div className="roast-content">
            {roast}
          </div>

        </div>
      )}

    </section>
  );
}

export default RoastMode;