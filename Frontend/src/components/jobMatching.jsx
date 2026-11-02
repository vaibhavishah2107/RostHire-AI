import { useState } from "react";

function JobMatching({ onBack }) {
  const [jobDescription, setJobDescription] = useState("");
  const [matching, setMatching] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleMatch = async () => {
    if (!jobDescription.trim()) {
      setError("Please paste a job description first.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login first.");
      return;
    }

    try {
      setMatching(true);
      setResult(null);
      setError("");

      const response = await fetch(
        "http://localhost:3000/api/job/match",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            jobDescription,
          }),
        }
      );

      const data = await response.json();

      console.log("Job match response:", data);

      if (!response.ok) {
        setError(data.message || "Unable to match the job.");
        return;
      }

      setResult(data.result);
    } catch (error) {
      console.error("JOB MATCH FRONTEND ERROR:", error);
      setError("Unable to connect to server.");
    } finally {
      setMatching(false);
    }
  };

  return (
    <section className="job-matching-page">

      {/* BACK BUTTON */}
      <button
        className="job-back-btn"
        onClick={onBack}
      >
        ← Back to Dashboard
      </button>

      {/* DECORATIVE BACKGROUND */}
      <div className="job-glow job-glow-one"></div>
      <div className="job-glow job-glow-two"></div>

      {/* HERO */}
      <div className="job-matching-hero">

        <span className="job-eyebrow">
          ✦ ROASTHIRE AI · JOB MATCHING
        </span>

        <h1>
          Does this job
          <span> match your resume?</span>
        </h1>

        <p>
          Paste a job description and let RoastHire compare it
          against your latest uploaded resume.
        </p>

      </div>

      {/* MAIN INPUT CARD */}
      <div className="job-input-card">

        <div className="job-card-header">

          <div>
            <span className="job-card-label">
              STEP 01
            </span>

            <h2>
              Paste the job description
            </h2>
          </div>

          <div className="job-card-icon">
            🎯
          </div>

        </div>

        <p className="job-card-description">
          Include the complete job description for a more
          detailed comparison of skills, experience and requirements.
        </p>

        <div className="job-textarea-wrapper">

          <textarea
            className="job-description-input"
            placeholder={`Paste the complete job description here...

Example:
We are looking for a Backend Developer with experience in Node.js,
Express.js, MongoDB, REST APIs, Docker and Redis...`}
            value={jobDescription}
            onChange={(e) => {
              setJobDescription(e.target.value);
              setError("");
            }}
          />

          <div className="job-character-count">
            {jobDescription.length} characters
          </div>

        </div>

        <div className="job-action-row">

          <p className="job-secure-text">
            🔒 Your resume stays private
          </p>

          <button
            className="job-analyze-btn"
            onClick={handleMatch}
            disabled={matching}
          >
            {matching ? (
              <>
                <span className="job-spinner"></span>
                Analyzing Match...
              </>
            ) : (
              <>
                Analyze Job Match
                <span>→</span>
              </>
            )}
          </button>

        </div>

        {error && (
          <div className="job-error">
            <span>⚠</span>
            {error}
          </div>
        )}

      </div>

      {/* HOW IT WORKS */}
      {!result && (
        <div className="job-how-section">

          <div className="job-how-header">
            <span className="job-card-label">
              WHAT YOU'LL GET
            </span>

            <h2>
              Your resume, matched intelligently.
            </h2>
          </div>

          <div className="job-how-grid">

            <div className="job-how-card">
              <div className="job-how-icon">
                ◎
              </div>

              <h3>
                Match Score
              </h3>

              <p>
                See how closely your resume aligns with the job description.
              </p>
            </div>

            <div className="job-how-card">
              <div className="job-how-icon">
                ✓
              </div>

              <h3>
                Matched Skills
              </h3>

              <p>
                Identify the skills and requirements already supported by your resume.
              </p>
            </div>

            <div className="job-how-card">
              <div className="job-how-icon">
                ◇
              </div>

              <h3>
                Skill Gaps
              </h3>

              <p>
                Discover what skills or requirements are missing.
              </p>
            </div>

          </div>

        </div>
      )}

      {/* RESULTS */}
      {result && (
        <div className="job-results">

          {/* RESULT HEADER */}
          <div className="job-results-header">

            <div>
              <span className="job-card-label">
                STEP 02 · AI ANALYSIS
              </span>

              <h2>
                Your job match breakdown
              </h2>

              <p>
                Here's how your resume compares with this role.
              </p>
            </div>

            <button
              className="job-new-analysis-btn"
              onClick={() => {
                setResult(null);
                setJobDescription("");
                setError("");
              }}
            >
              New Analysis
            </button>

          </div>

          {/* SCORE */}
          <div className="job-score-card">

            <div className="job-score-ring-wrapper">

              <div
                className="job-score-ring"
                style={{
                  "--match-score": `${result.matchScore}%`,
                }}
              >
                <div className="job-score-ring-inner">

                  <strong>
                    {result.matchScore}
                  </strong>

                  <span>
                    / 100
                  </span>

                </div>
              </div>

            </div>

            <div className="job-score-info">

              <span className="job-score-label">
                JOB MATCH SCORE
              </span>

              <h3>
                Resume compatibility
              </h3>

              <p>
                This score is calculated by comparing your resume
                against the skills, experience, responsibilities,
                education and other requirements in the job description.
              </p>

              <div className="job-score-meta">
                <span>✓ Resume analyzed</span>
                <span>✓ Job description analyzed</span>
              </div>

            </div>

          </div>

          {/* RESULT GRID */}
          <div className="job-result-grid">

            {/* MATCHED SKILLS */}
            <div className="job-result-card">

              <div className="job-result-card-header">
                <div className="job-result-icon success">
                  ✓
                </div>

                <div>
                  <h3>Matched Skills</h3>
                  <span>
                    Skills found in both
                  </span>
                </div>
              </div>

              <div className="job-tags">

                {result.matchedSkills?.length > 0 ? (
                  result.matchedSkills.map((skill, index) => (
                    <span
                      className="job-tag job-tag-success"
                      key={index}
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="job-empty">
                    No strong skill matches found.
                  </p>
                )}

              </div>

            </div>

            {/* MISSING SKILLS */}
            <div className="job-result-card">

              <div className="job-result-card-header">
                <div className="job-result-icon warning">
                  !
                </div>

                <div>
                  <h3>Missing Skills</h3>
                  <span>
                    Skills to work on
                  </span>
                </div>
              </div>

              <div className="job-tags">

                {result.missingSkills?.length > 0 ? (
                  result.missingSkills.map((skill, index) => (
                    <span
                      className="job-tag job-tag-warning"
                      key={index}
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="job-empty">
                    No major missing skills found.
                  </p>
                )}

              </div>

            </div>

            {/* MATCHED REQUIREMENTS */}
            <div className="job-result-card">

              <div className="job-result-card-header">
                <div className="job-result-icon info">
                  ✓
                </div>

                <div>
                  <h3>Matched Requirements</h3>
                  <span>
                    Requirements you satisfy
                  </span>
                </div>
              </div>

              <ul className="job-result-list">

                {result.matchedRequirements?.length > 0 ? (
                  result.matchedRequirements.map(
                    (requirement, index) => (
                      <li key={index}>
                        <span>✓</span>
                        {requirement}
                      </li>
                    )
                  )
                ) : (
                  <li className="job-empty">
                    No strong requirement matches found.
                  </li>
                )}

              </ul>

            </div>

            {/* UNMET REQUIREMENTS */}
            <div className="job-result-card">

              <div className="job-result-card-header">
                <div className="job-result-icon danger">
                  ×
                </div>

                <div>
                  <h3>Unmet Requirements</h3>
                  <span>
                    Requirements not supported
                  </span>
                </div>
              </div>

              <ul className="job-result-list">

                {result.unmetRequirements?.length > 0 ? (
                  result.unmetRequirements.map(
                    (requirement, index) => (
                      <li key={index}>
                        <span>×</span>
                        {requirement}
                      </li>
                    )
                  )
                ) : (
                  <li className="job-empty">
                    No major unmet requirements found.
                  </li>
                )}

              </ul>

            </div>

          </div>

          {/* RECOMMENDATIONS */}
          <div className="job-recommendations">

            <div className="job-recommendation-header">

              <div className="job-result-icon purple">
                ✦
              </div>

              <div>
                <span className="job-card-label">
                  AI INSIGHTS
                </span>

                <h3>
                  Recommendations
                </h3>
              </div>

            </div>

            <div className="job-recommendation-list">

              {result.recommendations?.length > 0 ? (
                result.recommendations.map(
                  (recommendation, index) => (
                    <div
                      className="job-recommendation-item"
                      key={index}
                    >
                      <span>
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <p>
                        {recommendation}
                      </p>
                    </div>
                  )
                )
              ) : (
                <p className="job-empty">
                  No recommendations at this time.
                </p>
              )}

            </div>

          </div>

        </div>
      )}

    </section>
  );
}

export default JobMatching;