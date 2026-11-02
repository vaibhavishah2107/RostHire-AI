import { useState } from "react";
import RoastMode from "./RoastMode";
import JobMatching from "./jobMatching.jsx";

function ResumeUpload({ onLogout }) {
  const [resume, setResume] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [analysis, setAnalysis] = useState(null);

  const [showRoastMode, setShowRoastMode] = useState(false);
  const [showJobMatching, setShowJobMatching] = useState(false);

  const handleUpload = async () => {
    if (!resume) {
      setMessage("Please select a PDF first.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Please login first.");
      return;
    }

    try {
      setUploading(true);
      setMessage("");
      setAnalysis(null);

      const formData = new FormData();
      formData.append("resume", resume);

      const response = await fetch(
        "http://localhost:3000/api/resume/upload",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      console.log("Backend response:", data);

      if (!response.ok) {
        setMessage(data.message || "Analysis failed.");
        return;
      }

      setAnalysis(data.analysis);
      setMessage("Resume analyzed successfully! 🎉");

    } catch (error) {
      console.error("UPLOAD ERROR:", error);
      setMessage("Unable to connect to server.");
    } finally {
      setUploading(false);
    }
  };

  // ================= ROAST MODE =================

  if (showRoastMode) {
    return (
      <RoastMode
        resume={resume}
        onBack={() => setShowRoastMode(false)}
      />
    );
  }

  // ================= JOB MATCHING =================

  if (showJobMatching) {
    return (
      <JobMatching
        onBack={() => setShowJobMatching(false)}
      />
    );
  }

  return (
    <section className="dashboard">

      {/* ================= TOP SECTION ================= */}

      <div className="dashboard-top">
        <div>
          <span className="eyebrow">
            ROASTHIRE AI
          </span>

          <h2>
            Let's analyze your resume. 🚀
          </h2>

          <p>
            Upload your PDF and discover what recruiters actually see.
          </p>
        </div>

        <button
          className="logout-btn"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>


      {/* ================= UPLOAD CARD ================= */}

      <div className="upload-card">

        <div className="upload-icon">
          ↑
        </div>

        <h3>
          {resume
            ? resume.name
            : "Drop your resume here"}
        </h3>

        <p>
          PDF only · One resume at a time
        </p>

        <label className="file-btn">
          Choose PDF

          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={(e) => {
              setResume(e.target.files[0]);
              setAnalysis(null);
              setMessage("");
            }}
            hidden
          />
        </label>

        <button
          className="primary-btn upload-btn"
          onClick={handleUpload}
          disabled={uploading}
        >
          {uploading
            ? "Analyzing..."
            : "Analyze Resume →"}
        </button>

        {message && (
          <p className="upload-message">
            {message}
          </p>
        )}

      </div>


      {/* ================= FEATURE CARDS ================= */}

      <div className="feature-grid">

        {/* ATS SCORE */}

        <div className="feature-card">
          <span>◈</span>

          <h3>
            ATS Score
          </h3>

          <p>
            See how compatible your resume is with
            applicant tracking systems.
          </p>
        </div>


        {/* SKILL GAP */}

        <div className="feature-card">
          <span>✦</span>

          <h3>
            Skill Gap
          </h3>

          <p>
            Discover the skills missing from your
            target role.
          </p>
        </div>


        {/* RESUME ROAST */}

        <div className="feature-card">
          <span>🔥</span>

          <h3>
            Resume Roast
          </h3>

          <p>
            Get brutally honest AI feedback
            on your resume.
          </p>
        </div>


        {/* JOB MATCHING */}

        <div
          className="feature-card feature-card-clickable"
          onClick={() => setShowJobMatching(true)}
        >
          <span>🎯</span>

          <h3>
            Job Matching
          </h3>

          <p>
            Compare your resume with a job description
            and discover your compatibility.
          </p>
        </div>

      </div>


      {/* ================= ROAST MODE ENTRY ================= */}

      <div className="roast-entry">

        <div className="roast-entry-content">

          <span className="eyebrow">
            ROAST MODE
          </span>

          <h2>
            Ready to get brutally honest? 🔥
          </h2>

          <p>
            Switch to Roast Mode and let RoastHire
            tear apart the weak parts of your resume
            — with receipts.
          </p>

          <button
            className="roast-btn"
            onClick={() => setShowRoastMode(true)}
            disabled={!resume}
          >
            {resume
              ? "Enter Roast Mode 🔥"
              : "Upload Resume First"}
          </button>

        </div>

        <div className="roast-entry-icon">
          🔥
        </div>

      </div>


      {/* ================= AI ANALYSIS ================= */}

      {analysis && (

        <div className="analysis-result">

          <div className="analysis-header">

            <span className="eyebrow">
              AI ANALYSIS
            </span>

            <h2>
              Your Resume Breakdown
            </h2>

          </div>


          {/* ================= SCORE CARDS ================= */}

          <div className="score-grid">

            {/* ATS SCORE */}

            <div className="score-card">

              <span>
                ATS SCORE
              </span>

              <strong>
                {analysis.atsScore}
              </strong>

              <small>
                / 100
              </small>

            </div>


            {/* RESUME QUALITY */}

            <div className="score-card">

              <span>
                RESUME QUALITY
              </span>

              <strong>
                {analysis.resumeQualityScore}
              </strong>

              <small>
                / 100
              </small>

            </div>


            {/* PLACEMENT READINESS */}

            <div className="score-card">

              <span>
                PLACEMENT READINESS
              </span>

              <strong>
                {analysis.placementReadinessScore}
              </strong>

              <small>
                / 100
              </small>

            </div>

          </div>


          {/* ================= SUMMARY ================= */}

          <div className="analysis-section">

            <h3>
              Professional Summary
            </h3>

            <p>
              {analysis.summary}
            </p>

          </div>


          {/* ================= STRENGTHS ================= */}

          <div className="analysis-section">

            <h3>
              💪 Strengths
            </h3>

            <ul>
              {analysis.strengths.map(
                (strength, index) => (
                  <li key={index}>
                    {strength}
                  </li>
                )
              )}
            </ul>

          </div>


          {/* ================= WEAKNESSES ================= */}

          <div className="analysis-section">

            <h3>
              ⚠️ Weaknesses
            </h3>

            <ul>
              {analysis.weaknesses.map(
                (weakness, index) => (
                  <li key={index}>
                    {weakness}
                  </li>
                )
              )}
            </ul>

          </div>


          {/* ================= SKILLS ================= */}

          <div className="analysis-section">

            <h3>
              🛠 Skills Detected
            </h3>

            <div className="tag-container">

              {analysis.skills.map(
                (skill, index) => (

                  <span
                    className="skill-tag"
                    key={index}
                  >
                    {skill}
                  </span>

                )
              )}

            </div>

          </div>


          {/* ================= SKILL GAPS ================= */}

          <div className="analysis-section">

            <h3>
              📈 Skill Gaps
            </h3>

            <div className="tag-container">

              {analysis.skillGaps.map(
                (gap, index) => (

                  <span
                    className="gap-tag"
                    key={index}
                  >
                    {gap}
                  </span>

                )
              )}

            </div>

          </div>

        </div>

      )}

    </section>
  );
}

export default ResumeUpload;