
import { useEffect, useState } from "react";

const API_URL = "http://localhost:3000/api/jobs";

const initialForm = {
  title: "",
  companyName: "",
  description: "",
  requiredSkills: "",
  location: "",
  workMode: "Remote",
  employmentType: "Internship",
  experienceLevel: "Internship",
  applicationUrl: "",
};

function HiringDashboard({ onLogout }) {
  const [form, setForm] = useState(initialForm);
  const [jobs, setJobs] = useState([]);

  const [publishing, setPublishing] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(true);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Retrieve the current hiring team's jobs.
  const loadMyJobs = async () => {
    try {
      setLoadingJobs(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/mine`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load your jobs."
        );
      }

      setJobs(data.jobs || []);
    } catch (error) {
      console.error("LOAD JOBS ERROR:", error);
      setError(error.message);
    } finally {
      setLoadingJobs(false);
    }
  };

  useEffect(() => {
    loadMyJobs();
  }, []);

  // Update form fields.
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  };

  // Publish a new vacancy.
  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please log in again.");
      return;
    }

    try {
      setPublishing(true);
      setError("");
      setMessage("");

      const jobData = {
        ...form,

        requiredSkills: form.requiredSkills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
      };

      const response = await fetch(API_URL, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify(jobData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to publish job."
        );
      }

      setMessage("Job published successfully! 🎉");
      setForm(initialForm);

      // Refresh the employer's listings.
      await loadMyJobs();

    } catch (error) {
      console.error("PUBLISH JOB ERROR:", error);
      setError(error.message);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <section className="hiring-dashboard">

      {/* HEADER */}

      <div className="hiring-header">

        <div>
          <span className="hiring-eyebrow">
            ROASTHIRE AI · EMPLOYER PORTAL
          </span>

          <h1>
            Find your next
            <span> great hire.</span>
          </h1>

          <p>
            Publish opportunities and connect with talented candidates.
          </p>
        </div>

        {onLogout && (
          <button
            className="hiring-logout-btn"
            onClick={onLogout}
          >
            Logout
          </button>
        )}

      </div>

      {/* DASHBOARD STATS */}

      <div className="hiring-stats">

        <div className="hiring-stat-card">
          <span className="hiring-stat-icon">▣</span>

          <div>
            <strong>{jobs.length}</strong>
            <p>Total Jobs Posted</p>
          </div>
        </div>

        <div className="hiring-stat-card">
          <span className="hiring-stat-icon">◉</span>

          <div>
            <strong>
              {jobs.filter((job) => job.status === "Open").length}
            </strong>
            <p>Open Listings</p>
          </div>
        </div>

      </div>

      {/* JOB POSTING FORM */}

      <div className="hiring-form-card">

        <div className="hiring-section-heading">

          <div>
            <span className="hiring-step">
              STEP 01 · CREATE OPPORTUNITY
            </span>

            <h2>Post a new job</h2>

            <p>
              Enter the details candidates need to know.
            </p>
          </div>

          <div className="hiring-form-icon">
            ✦
          </div>

        </div>

        <form onSubmit={handleSubmit}>

          <div className="hiring-form-grid">

            {/* JOB TITLE */}

            <div className="hiring-field">
              <label>Job Title *</label>

              <input
                type="text"
                name="title"
                placeholder="e.g. Backend Developer Intern"
                value={form.title}
                onChange={handleChange}
                maxLength={120}
                required
              />
            </div>

            {/* COMPANY */}

            <div className="hiring-field">
              <label>Company Name *</label>

              <input
                type="text"
                name="companyName"
                placeholder="Your company name"
                value={form.companyName}
                onChange={handleChange}
                maxLength={150}
                required
              />
            </div>

            {/* LOCATION */}

            <div className="hiring-field">
              <label>Location *</label>

              <input
                type="text"
                name="location"
                placeholder="e.g. Bengaluru, India"
                value={form.location}
                onChange={handleChange}
                required
              />
            </div>

            {/* WORK MODE */}

            <div className="hiring-field">
              <label>Work Mode *</label>

              <select
                name="workMode"
                value={form.workMode}
                onChange={handleChange}
                required
              >
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
            </div>

            {/* EMPLOYMENT TYPE */}

            <div className="hiring-field">
              <label>Employment Type *</label>

              <select
                name="employmentType"
                value={form.employmentType}
                onChange={handleChange}
                required
              >
                <option value="Internship">Internship</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
              </select>
            </div>

            {/* EXPERIENCE */}

            <div className="hiring-field">
              <label>Experience Level *</label>

              <select
                name="experienceLevel"
                value={form.experienceLevel}
                onChange={handleChange}
                required
              >
                <option value="Internship">Internship</option>
                <option value="Entry-level">Entry-level</option>
                <option value="Junior">Junior</option>
                <option value="Mid-level">Mid-level</option>
                <option value="Senior">Senior</option>
                <option value="Any">Any</option>
              </select>
            </div>

          </div>

          {/* REQUIRED SKILLS */}

          <div className="hiring-field hiring-full-field">
            <label>Required Skills *</label>

            <input
              type="text"
              name="requiredSkills"
              placeholder="Node.js, Express.js, MongoDB, REST APIs"
              value={form.requiredSkills}
              onChange={handleChange}
              required
            />

            <small>
              Separate each skill with a comma.
            </small>
          </div>

          {/* DESCRIPTION */}

          <div className="hiring-field hiring-full-field">
            <label>Job Description *</label>

            <textarea
              name="description"
              placeholder="Describe the responsibilities, qualifications and expectations..."
              value={form.description}
              onChange={handleChange}
              rows={7}
              maxLength={15000}
              required
            />
          </div>

          {/* APPLICATION URL */}

          <div className="hiring-field hiring-full-field">
            <label>Application URL *</label>

            <input
              type="url"
              name="applicationUrl"
              placeholder="https://company.com/careers/apply"
              value={form.applicationUrl}
              onChange={handleChange}
              required
            />

            <small>
              Candidates will be redirected to this link to apply.
            </small>
          </div>

          {/* MESSAGES */}

          {message && (
            <div className="hiring-success">
              ✓ {message}
            </div>
          )}

          {error && (
            <div className="hiring-error">
              ⚠ {error}
            </div>
          )}

          {/* SUBMIT */}

          <button
            type="submit"
            className="hiring-submit-btn"
            disabled={publishing}
          >
            {publishing
              ? "Publishing..."
              : "Publish Job Opportunity →"}
          </button>

        </form>

      </div>

      {/* MY JOBS */}

      <div className="hiring-my-jobs">

        <div className="hiring-section-heading">
          <div>
            <span className="hiring-step">
              STEP 02 · MANAGE OPPORTUNITIES
            </span>

            <h2>Your job listings</h2>

            <p>
              Jobs published by your hiring team.
            </p>
          </div>

          <button
            className="hiring-refresh-btn"
            onClick={loadMyJobs}
            disabled={loadingJobs}
          >
            ↻ Refresh
          </button>
        </div>

        {loadingJobs ? (
          <p className="hiring-empty">
            Loading your listings...
          </p>
        ) : jobs.length === 0 ? (
          <div className="hiring-empty-card">

            <span>▣</span>

            <h3>No jobs published yet</h3>

            <p>
              Your first opportunity will appear here after publishing.
            </p>

          </div>
        ) : (
          <div className="hiring-job-list">

            {jobs.map((job) => (
              <div
                className="hiring-job-card"
                key={job._id}
              >

                <div className="hiring-job-top">

                  <div>
                    <h3>{job.title}</h3>
                    <p>{job.companyName}</p>
                  </div>

                  <span
                    className={`hiring-status ${
                      job.status === "Open"
                        ? "status-open"
                        : "status-closed"
                    }`}
                  >
                    {job.status}
                  </span>

                </div>

                <div className="hiring-job-details">

                  <span>📍 {job.location}</span>
                  <span>◈ {job.workMode}</span>
                  <span>▣ {job.employmentType}</span>

                </div>

                <div className="hiring-job-skills">
                  {(job.requiredSkills || []).map(
                    (skill, index) => (
                      <span key={index}>{skill}</span>
                    )
                  )}
                </div>

                <small className="hiring-posted-date">
                  Posted on{" "}
                  {new Date(job.createdAt).toLocaleDateString()}
                </small>

              </div>
            ))}

          </div>
        )}

      </div>

    </section>
  );
}

export default HiringDashboard;
