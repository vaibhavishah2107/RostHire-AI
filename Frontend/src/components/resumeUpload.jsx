import { useState } from "react";

function ResumeUpload({ onLogout }) {
  const [resume, setResume] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

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

      if (!response.ok) {
        setMessage(data.message || "Upload failed.");
        return;
      }

      setMessage("Resume uploaded successfully! 🎉");
      console.log("Upload response:", data);
    } catch (error) {
      console.error("UPLOAD ERROR:", error);
      setMessage("Unable to connect to server.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="dashboard">
      <div className="dashboard-top">
        <div>
          <span className="eyebrow">ROASTHIRE AI</span>
          <h2>Let's roast your resume. 🔥</h2>
          <p>
            Upload your PDF and we'll start analyzing what recruiters see.
          </p>
        </div>

        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>

      <div className="upload-card">
        <div className="upload-icon">↑</div>

        <h3>
          {resume ? resume.name : "Drop your resume here"}
        </h3>

        <p>
          PDF only · One resume at a time
        </p>

        <label className="file-btn">
          Choose PDF
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={(e) => setResume(e.target.files[0])}
            hidden
          />
        </label>

        <button
          className="primary-btn upload-btn"
          onClick={handleUpload}
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Analyze Resume →"}
        </button>

        {message && (
          <p className="upload-message">
            {message}
          </p>
        )}
      </div>

      <div className="feature-grid">
        <div className="feature-card">
          <span>◈</span>
          <h3>ATS Score</h3>
          <p>
            See how compatible your resume is with applicant tracking systems.
          </p>
        </div>

        <div className="feature-card">
          <span>✦</span>
          <h3>Skill Gap</h3>
          <p>
            Discover the skills missing from your target role.
          </p>
        </div>

        <div className="feature-card">
          <span>🔥</span>
          <h3>Resume Roast</h3>
          <p>
            Get brutally honest AI feedback on your resume.
          </p>
        </div>
      </div>
    </section>
  );
}

export default ResumeUpload;