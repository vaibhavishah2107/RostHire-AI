import { useState } from "react";
import "./ResumeUpload_motion.css";
import RoastMode from "./RoastMode.jsx";
import JobMatching from "./jobMatching.jsx";
import CandidateJobs from "./CandidateJobs.jsx";
import SkillProofMap from "./SkillProofMap.jsx";
function ResumeUpload({ onLogout }) {
  const [resume, setResume] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [resumeId, setResumeId] = useState(null);
  
  const [showRoastMode, setShowRoastMode] = useState(false);
  const [showJobMatching, setShowJobMatching] = useState(false);
  const [showCandidateJobs, setShowCandidateJobs] = useState(false);
  const [showSkillProofMap, setShowSkillProofMap] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [activeInsight, setActiveInsight] = useState("");

  const handleFileSelection = (file) => {
    if (!file) return;

    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setResume(null);
      setAnalysis(null);
      setResumeId(null);
      setActiveInsight("");
      setMessage("Please choose a PDF file only.");
      return;
    }

    setResume(file);
    setResumeId(null);
    setAnalysis(null);
    setActiveInsight("");
    setMessage(`${file.name} is ready to analyze.`);
  };

  const handleFeatureClick = (feature) => {
    if (!analysis) {
      setMessage("Upload and analyze your resume first to view this report.");
      document.getElementById("resume-upload-card")?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }

    setActiveInsight(feature);

    window.setTimeout(() => {
      document.getElementById("feature-insight-panel")?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 80);
  };

  const openRoastMode = () => {
    if (!resume) {
      setMessage("Please choose a PDF resume before opening Roast Mode.");
      document.getElementById("resume-upload-card")?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }

    setShowRoastMode(true);
  };

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
      setActiveInsight("");

      const formData = new FormData();
      formData.append("resume", resume);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/resume/upload`,
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
      setResumeId(data.resumeId || null);
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

  if (showCandidateJobs) {
  return (
    <CandidateJobs
      onBack={() => setShowCandidateJobs(false)}
    />
  );
}

  if (showSkillProofMap) {
    return (
      <SkillProofMap
        resumeId={resumeId}
        onBack={() => setShowSkillProofMap(false)}
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

      <div
        id="resume-upload-card"
        className={`upload-card ${isDragging ? "is-dragging" : ""} ${
          uploading ? "is-uploading" : ""
        }`}
        onDragOver={(event) => {
          event.preventDefault();
          if (!uploading) setIsDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setIsDragging(false);
          }
        }}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          if (!uploading) handleFileSelection(event.dataTransfer.files?.[0]);
        }}
      >
        <div className="upload-orbit upload-orbit-one" aria-hidden="true" />
        <div className="upload-orbit upload-orbit-two" aria-hidden="true" />
        {uploading && <div className="upload-scan-line" aria-hidden="true" />}


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
              handleFileSelection(e.target.files?.[0]);
              e.target.value = "";
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

        {uploading && (
          <div className="upload-progress" role="status" aria-live="polite">
            <div className="upload-progress-track">
              <span className="upload-progress-fill" />
            </div>
            <span className="upload-progress-label">
              Reading your resume and generating insights...
            </span>
          </div>
        )}

        {message && (
          <p className="upload-message">
            {message}
          </p>
        )}

      </div>


      {/* ================= FEATURE CARDS ================= */}

      <div className="feature-grid">

        {/* ATS SCORE */}
        <button
          type="button"
          className="feature-card feature-card-clickable"
          onClick={() => handleFeatureClick("ats")}
          aria-label="Open ATS score report"
        >
          <span>◈</span>
          <h3>ATS Score</h3>
          <p>
            See your ATS score and review the resume issues that may affect
            readability and keyword coverage.
          </p>
          <small className="feature-card-action">
            {analysis ? "View ATS report →" : "Analyze resume first →"}
          </small>
        </button>

        {/* SKILL GAP */}
        <button
          type="button"
          className="feature-card feature-card-clickable"
          onClick={() => handleFeatureClick("skills")}
          aria-label="Open skill gap report"
        >
          <span>✦</span>
          <h3>Skill Gap</h3>
          <p>
            Review the skills identified as missing or underrepresented in
            your resume.
          </p>
          <small className="feature-card-action">
            {analysis ? "View skill gaps →" : "Analyze resume first →"}
          </small>
        </button>

        {/* SKILL PROOF MAP */}
        <button
          type="button"
          className="feature-card feature-card-clickable"
          onClick={() => {
            if (!resumeId) {
              setMessage("Upload and analyze your resume first to build your Skill Proof Map.");
              document.getElementById("resume-upload-card")?.scrollIntoView({ behavior: "smooth", block: "center" });
              return;
            }
            setShowSkillProofMap(true);
          }}
          aria-label="Build your Skill Proof Map"
        >
          <span>🧩</span>
          <h3>Skill Proof Map</h3>
          <p>Connect every claimed skill to evidence in your projects, experience and education.</p>
          <small className="feature-card-action">{resumeId ? "Map skills to proof →" : "Analyze resume first →"}</small>
        </button>

        {/* RESUME ROAST */}
        <button
          type="button"
          className="feature-card feature-card-clickable"
          onClick={openRoastMode}
          aria-label="Open Resume Roast mode"
        >
          <span>🔥</span>
          <h3>Resume Roast</h3>
          <p>
            Get direct, constructive AI feedback on the weak parts of your
            resume.
          </p>
          <small className="feature-card-action">
            {resume ? "Enter Roast Mode →" : "Choose a resume first →"}
          </small>
        </button>

        <div
  className="feature-card feature-card-clickable"
  onClick={() => setShowCandidateJobs(true)}
>
  <span>💼</span>

  <h3>Find Jobs</h3>

  <p>
    Discover vacancies posted by hiring teams and check
    how well your resume matches each opportunity.
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

      {activeInsight && analysis && (
        <section
          className="feature-insight-panel"
          id="feature-insight-panel"
          aria-live="polite"
        >
          <div className="feature-insight-header">
            <div>
              <span className="eyebrow">RESUME INSIGHTS</span>
              <h2>
                {activeInsight === "ats" ? "ATS Score Report" : "Skill Gap Report"}
              </h2>
            </div>
            <button
              type="button"
              className="insight-close-btn"
              onClick={() => setActiveInsight("")}
            >
              Close
            </button>
          </div>

          {activeInsight === "ats" && (
            <div className="insight-content">
              <div className="insight-score">
                <strong>{analysis.atsScore ?? "—"}</strong>
                <span>/ 100 ATS score</span>
              </div>
              <p>
                This is the AI-generated ATS estimate returned by your current
                resume analysis. It is a guidance score, not a guarantee that
                every applicant tracking system will accept the resume.
              </p>
              <h3>Areas to review</h3>
              {Array.isArray(analysis.weaknesses) && analysis.weaknesses.length > 0 ? (
                <ul>
                  {(Array.isArray(analysis.weaknesses) ? analysis.weaknesses : []).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p>No specific weaknesses were returned in this analysis.</p>
              )}
              <p className="insight-footnote">
                For a role-specific keyword comparison, use Job Matching and
                provide the target job description.
              </p>
            </div>
          )}

          {activeInsight === "skills" && (
            <div className="insight-content">
              <h3>Skills detected in your resume</h3>
              <div className="tag-container">
                {(Array.isArray(analysis.skills) ? analysis.skills : []).length > 0 ? (
                  (Array.isArray(analysis.skills) ? analysis.skills : []).map((skill, index) => (
                    <span className="skill-tag" key={index}>{skill}</span>
                  ))
                ) : (
                  <p>No skills were returned in this analysis.</p>
                )}
              </div>

              <h3 className="insight-subheading">Skills to improve or add</h3>
              <div className="tag-container">
                {(Array.isArray(analysis.skillGaps) ? analysis.skillGaps : []).length > 0 ? (
                  (Array.isArray(analysis.skillGaps) ? analysis.skillGaps : []).map((gap, index) => (
                    <span className="gap-tag" key={index}>{gap}</span>
                  ))
                ) : (
                  <p>No skill gaps were identified in this analysis.</p>
                )}
              </div>
              <p className="insight-footnote">
                These gaps come from the current resume analysis. To identify
                skills missing for a particular job, compare your resume with
                that job description in Job Matching.
              </p>
            </div>
          )}
        </section>
      )}

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
            onClick={openRoastMode}
          >
            {resume
              ? "Enter Roast Mode 🔥"
              : "Choose Resume First"}
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

            <button
              type="button"
              className="score-card score-card-clickable"
              onClick={() => handleFeatureClick("ats")}
              aria-label="Open ATS score details"
            >
              <span>
                ATS SCORE
              </span>

              <strong>
                {analysis.atsScore}
              </strong>

              <small>
                / 100
              </small>
              <small className="score-card-hint">Click for details</small>
            </button>


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
              {(Array.isArray(analysis.strengths) ? analysis.strengths : []).map(
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
              {(Array.isArray(analysis.weaknesses) ? analysis.weaknesses : []).map(
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

              {(Array.isArray(analysis.skills) ? analysis.skills : []).map(
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

          <div className="analysis-section" id="skill-gap-analysis">

            <h3>
              📈 Skill Gaps
            </h3>

            <div className="tag-container">

              {(Array.isArray(analysis.skillGaps) ? analysis.skillGaps : []).map(
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