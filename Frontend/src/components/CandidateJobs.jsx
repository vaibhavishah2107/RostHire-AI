
import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

const JOBS_API = `${API_URL}/api/jobs`;
const MATCH_API = `${API_URL}/api/job/match`;

function CandidateJobs({ onBack }) {
  const [searchDescription, setSearchDescription] = useState("");
  const [jobs, setJobs] = useState([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [matchResults, setMatchResults] = useState({});
  const [matchingJobId, setMatchingJobId] = useState(null);
  const [matchErrors, setMatchErrors] = useState({});

  const [error, setError] = useState("");

  // Search jobs posted by hiring teams.
  const searchJobs = async (e) => {
    e?.preventDefault();

    const searchText = searchDescription.trim();

    if (!searchText) {
      setError("Describe the kind of job you are looking for.");
      return;
    }

    try {
      setSearching(true);
      setError("");
      setHasSearched(true);
      setJobs([]);
      setMatchResults({});
      setMatchErrors({});

      const response = await fetch(
        `${JOBS_API}?q=${encodeURIComponent(searchText)}&limit=30`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to search jobs.");
      }

      setJobs(data.jobs || []);
    } catch (error) {
      console.error("JOB SEARCH ERROR:", error);
      setError(error.message || "Unable to connect to server.");
    } finally {
      setSearching(false);
    }
  };

  // Browse every open job without a search phrase.
  const browseAllJobs = async () => {
    try {
      setSearching(true);
      setError("");
      setHasSearched(true);
      setMatchResults({});
      setMatchErrors({});

      const response = await fetch(JOBS_API);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load jobs.");
      }

      setJobs(data.jobs || []);
    } catch (error) {
      console.error("BROWSE JOBS ERROR:", error);
      setError(error.message || "Unable to load jobs.");
    } finally {
      setSearching(false);
    }
  };

  // Compare the candidate's saved resume with one real job.
  const checkResumeMatch = async (job) => {
    const token = localStorage.getItem("token");

    if (!token) {
      setMatchErrors((previous) => ({
        ...previous,
        [job._id]: "Please log in again.",
      }));
      return;
    }

    try {
      setMatchingJobId(job._id);

      setMatchErrors((previous) => ({
        ...previous,
        [job._id]: "",
      }));

      const jobDescription = `
Job Title: ${job.title}
Company: ${job.companyName}
Location: ${job.location}
Work Mode: ${job.workMode}
Employment Type: ${job.employmentType}
Experience Level: ${job.experienceLevel}
Required Skills: ${(job.requiredSkills || []).join(", ")}

Job Description:
${job.description}
`;

      const response = await fetch(MATCH_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          jobDescription,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to calculate resume match."
        );
      }

      setMatchResults((previous) => ({
        ...previous,
        [job._id]: data.result,
      }));
    } catch (error) {
      console.error("RESUME MATCH ERROR:", error);

      setMatchErrors((previous) => ({
        ...previous,
        [job._id]: error.message,
      }));
    } finally {
      setMatchingJobId(null);
    }
  };

  return (
    <section className="candidate-jobs-page">

      {/* BACK BUTTON */}

      <button
        className="candidate-back-btn"
        onClick={onBack}
      >
        ← Back to Dashboard
      </button>

      {/* HERO */}

      <div className="candidate-jobs-hero">

        <span className="candidate-jobs-eyebrow">
          ✦ ROASTHIRE AI · CAREER DISCOVERY
        </span>

        <h1>
          Find opportunities.
          <span> Build your future.</span>
        </h1>

        <p>
          Tell us what kind of role you want. Discover job openings
          published by hiring teams and check how well your resume fits.
        </p>

      </div>

      {/* SEARCH CARD */}

      <form
        className="candidate-search-card"
        onSubmit={searchJobs}
      >

        <div className="candidate-search-heading">
          <div>
            <span>YOUR NEXT OPPORTUNITY</span>
            <h2>What job are you looking for?</h2>
          </div>

          <div className="candidate-search-icon">
            <span>⌕</span>
          </div>
        </div>

        <textarea
          value={searchDescription}
          onChange={(e) => {
            setSearchDescription(e.target.value);
            setError("");
          }}
          placeholder={`Describe your ideal role...

Example:
I am looking for a Backend Developer internship.
I know Node.js, Express, MongoDB and REST APIs.
I prefer remote or hybrid opportunities.`}
          rows={5}
          maxLength={3000}
        />

        <div className="candidate-search-footer">
          <span>
            {searchDescription.length}/3000 characters
          </span>

          <button
            className="candidate-search-btn"
            type="submit"
            disabled={searching}
          >
            {searching
              ? "Finding jobs..."
              : "Find Matching Jobs →"}
          </button>
        </div>

        <button
          type="button"
          className="candidate-browse-btn"
          onClick={browseAllJobs}
          disabled={searching}
        >
          Or browse all open opportunities
        </button>

        {error && (
          <p className="candidate-search-error">
            ⚠ {error}
          </p>
        )}

      </form>

      {/* SEARCH RESULTS */}

      {hasSearched && (
        <div className="candidate-results">

          <div className="candidate-results-heading">
            <div>
              <span>JOB DISCOVERY</span>
              <h2>
                {jobs.length > 0
                  ? `${jobs.length} opportunities found`
                  : "No matching opportunities"}
              </h2>
              <p>
                Vacancies published by hiring teams on RoastHire.
              </p>
            </div>
          </div>

          {jobs.length === 0 && !searching ? (
            <div className="candidate-no-jobs">
              <span>⌕</span>
              <h3>No jobs found yet</h3>
              <p>
                Try different skills or search terms, or check again
                after hiring teams publish more openings.
              </p>
              <button
                onClick={browseAllJobs}
                className="candidate-search-btn"
              >
                Browse all jobs
              </button>
            </div>
          ) : (
            <div className="candidate-job-grid">

              {jobs.map((job) => {
                const result = matchResults[job._id];
                const isMatching = matchingJobId === job._id;

                return (
                  <article
                    className="candidate-job-card"
                    key={job._id}
                  >

                    <div className="candidate-job-card-top">

                      <div className="candidate-company-icon">
                        {job.companyName?.charAt(0)?.toUpperCase() || "J"}
                      </div>

                      <span className="candidate-open-badge">
                        ● Open
                      </span>

                    </div>

                    <h3>{job.title}</h3>

                    <p className="candidate-company-name">
                      {job.companyName}
                    </p>

                    <div className="candidate-job-meta">
                      <span>📍 {job.location}</span>
                      <span>◈ {job.workMode}</span>
                      <span>▣ {job.employmentType}</span>
                      <span>♧ {job.experienceLevel}</span>
                    </div>

                    <p className="candidate-job-description">
                      {job.description}
                    </p>

                    <div className="candidate-job-skills">
                      {(job.requiredSkills || []).map(
                        (skill, index) => (
                          <span key={index}>{skill}</span>
                        )
                      )}
                    </div>

                    <div className="candidate-job-actions">

                      <button
                        className="candidate-match-btn"
                        onClick={() => checkResumeMatch(job)}
                        disabled={isMatching}
                      >
                        {isMatching
                          ? "Checking match..."
                          : result
                            ? "Refresh Resume Match"
                            : "Check Resume Match"}
                      </button>

                      <a
                        className="candidate-apply-btn"
                        href={job.applicationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Apply Now ↗
                      </a>

                    </div>

                    {matchErrors[job._id] && (
                      <p className="candidate-match-error">
                        {matchErrors[job._id]}
                      </p>
                    )}

                    {result && (
                      <div className="candidate-match-result">

                        <div className="candidate-match-score">
                          <span>AI RESUME MATCH</span>
                          <strong>{result.matchScore}/100</strong>
                        </div>

                        <p>
                          {result.matchedSkills?.length || 0} matched
                          skills · {result.missingSkills?.length || 0} missing skills
                        </p>

                        {result.missingSkills?.length > 0 && (
                          <div className="candidate-match-gaps">
                            <span>Skills to improve:</span>
                            {result.missingSkills.join(", ")}
                          </div>
                        )}

                      </div>
                    )}

                    <div className="candidate-job-posted">
                      Posted{" "}
                      {job.createdAt
                        ? new Date(job.createdAt).toLocaleDateString()
                        : "recently"}
                    </div>

                  </article>
                );
              })}

            </div>
          )}

        </div>
      )}

    </section>
  );
}

export default CandidateJobs;
