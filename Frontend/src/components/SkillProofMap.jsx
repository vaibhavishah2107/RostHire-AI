import { useEffect, useMemo, useState } from "react";
import "./SkillProofMap.css";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/$/, "");

const LEVELS = [
  { key: "strong", label: "Strong proof", icon: "✓" },
  { key: "moderate", label: "Some proof", icon: "◐" },
  { key: "limited", label: "Needs detail", icon: "!" },
  { key: "not_found", label: "No proof found", icon: "?" },
];

function SkillProofMap({ resumeId, onBack }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [retryKey, setRetryKey] = useState(0);
  const [selectedSkillIndex, setSelectedSkillIndex] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadSkillProofMap() {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Your session has expired. Please log in again.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      setResult(null);

      try {
        const response = await fetch(`${API_URL}/api/resume/skill-proof-map`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(resumeId ? { resumeId } : {}),
          signal: controller.signal,
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.message || `Skill Proof Map failed (${response.status}).`);
        }

        setResult(data.result || null);
        setSelectedSkillIndex(0);
        if (!data.result) throw new Error("The server returned an empty Skill Proof Map.");
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Unable to generate your Skill Proof Map.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadSkillProofMap();
    return () => controller.abort();
  }, [resumeId, retryKey]);

  const skills = Array.isArray(result?.skills) ? result.skills : [];
  const counts = useMemo(() => {
    return skills.reduce(
      (acc, item) => {
        const level = LEVELS.some((entry) => entry.key === item.evidenceLevel)
          ? item.evidenceLevel
          : "not_found";
        acc[level] += 1;
        return acc;
      },
      { strong: 0, moderate: 0, limited: 0, not_found: 0 }
    );
  }, [skills]);

  const visibleSkills = filter === "all"
    ? skills
    : skills.filter((skill) => skill.evidenceLevel === filter);

  // The animated solar system shows the first eight claimed skills. The full
  // set remains available in the detailed list below.
  const orbitalSkills = useMemo(
    () => skills.slice(0, 8).map((skill, index) => ({ ...skill, _mapIndex: index })),
    [skills]
  );
  const selectedSkill = skills[selectedSkillIndex] || skills[0] || null;
  const orbitSizes = ["31%", "48%", "65%", "82%"];
  const orbitDurations = ["15s", "19s", "24s", "29s"];

  const score = Number.isFinite(Number(result?.overallEvidenceScore))
    ? Math.max(0, Math.min(100, Number(result.overallEvidenceScore)))
    : 0;

  return (
    <section className="proof-map-page">
      <div className="proof-map-topbar">
        <button type="button" className="proof-map-back" onClick={onBack}>
          ← Back to dashboard
        </button>
        <span className="proof-map-brand">ROASTHIRE AI / SKILL INTELLIGENCE</span>
      </div>

      <header className="proof-map-hero">
        <span className="proof-map-eyebrow">YOUR SKILLS, CONNECTED TO PROOF</span>
        <h1>Skill Proof <span>Map</span></h1>
        <p>
          See which skills your resume actually demonstrates, where the evidence appears,
          and what you can add to make your experience easier to trust.
        </p>
      </header>

      {loading && (
        <div className="proof-map-loading" role="status" aria-live="polite">
          <div className="proof-map-loader-orbit"><span>✦</span></div>
          <h2>Mapping your skills to evidence</h2>
          <p>RoastHire is tracing skills across your projects, experience and education.</p>
          <div className="proof-map-loading-track"><span /></div>
        </div>
      )}

      {!loading && error && (
        <div className="proof-map-error" role="alert">
          <span className="proof-map-error-icon">!</span>
          <h2>We couldn't build your map</h2>
          <p>{error}</p>
          <div className="proof-map-error-actions">
            <button type="button" onClick={() => setRetryKey((value) => value + 1)}>
              Try again
            </button>
            <button type="button" className="proof-map-quiet-btn" onClick={onBack}>
              Back to dashboard
            </button>
          </div>
        </div>
      )}

      {!loading && !error && result && (
        <>
          <section className="proof-map-overview">
            <div className="proof-map-score-card">
              <div className="proof-map-score-ring" style={{ "--proof-score": `${score}%` }}>
                <div>
                  <strong>{score}</strong>
                  <span>/ 100</span>
                </div>
              </div>
              <div className="proof-map-score-copy">
                <span className="proof-map-card-kicker">EVIDENCE COVERAGE</span>
                <h2>Your skills-to-proof snapshot</h2>
                <p>{result.overallSummary || "Your resume evidence map is ready."}</p>
                <small>This score measures how clearly the resume supports its skill claims. It is not a measure of your actual ability.</small>
              </div>
            </div>

            <div className="proof-map-count-grid">
              {LEVELS.map((level) => (
                <button
                  type="button"
                  key={level.key}
                  className={`proof-map-count-card proof-${level.key} ${filter === level.key ? "is-selected" : ""}`}
                  onClick={() => setFilter(filter === level.key ? "all" : level.key)}
                >
                  <span>{level.icon}</span>
                  <strong>{counts[level.key]}</strong>
                  <small>{level.label}</small>
                </button>
              ))}
            </div>
          </section>

          {/* ================= SOLAR SYSTEM SKILL MAP ================= */}
          <section className="proof-solar-panel" aria-labelledby="proof-solar-title">
            <div className="proof-solar-heading">
              <div>
                <span className="proof-map-eyebrow">THE SKILL UNIVERSE</span>
                <h2 id="proof-solar-title">Your skills have an orbit.</h2>
                <p>Each planet represents a skill from your resume. Select one to inspect the evidence behind it.</p>
              </div>
              <span className="proof-solar-live"><i /> LIVE EVIDENCE MAP</span>
            </div>

            <div className="proof-solar-layout">
              <div className="proof-solar-universe">
                <div className="proof-solar-stage" role="group" aria-label="Interactive solar system of resume skills">
                  <div className="proof-solar-nebula proof-nebula-one" />
                  <div className="proof-solar-nebula proof-nebula-two" />
                  {orbitSizes.map((size, index) => (
                    <div
                      className={`proof-solar-ring proof-solar-ring-${index + 1}`}
                      key={`ring-${index}`}
                      aria-hidden="true"
                    />
                  ))}

                  <div className="proof-solar-core" aria-label={`Evidence score ${score} out of 100`}>
                    <div className="proof-solar-core-glow" />
                    <div className="proof-solar-core-star">RH</div>
                    <span>YOUR PROFILE</span>
                    <strong>{score}<small>/100</small></strong>
                    <em>EVIDENCE COVERAGE</em>
                  </div>

                  {orbitalSkills.map((skill, index) => {
                    const ringIndex = index % 4;
                    const planetsOnRing = Math.ceil((orbitalSkills.length - ringIndex) / 4);
                    const positionOnRing = Math.floor(index / 4);
                    const startAngle = (positionOnRing * (360 / Math.max(1, planetsOnRing))) + ringIndex * 13;
                    const level = LEVELS.some((item) => item.key === skill.evidenceLevel)
                      ? skill.evidenceLevel
                      : "not_found";
                    const isSelected = selectedSkillIndex === skill._mapIndex;

                    return (
                      <div
                        className="proof-solar-planet-orbit"
                        key={`${skill.skill}-${index}`}
                        style={{
                          "--orbit-size": orbitSizes[ringIndex],
                          "--orbit-duration": orbitDurations[ringIndex],
                          "--start-angle": `${startAngle}deg`,
                        }}
                      >
                        <button
                          type="button"
                          className={`proof-solar-planet proof-planet-${level} ${isSelected ? "is-selected" : ""}`}
                          onClick={() => setSelectedSkillIndex(skill._mapIndex)}
                          aria-pressed={isSelected}
                          title={`${skill.skill} — ${LEVELS.find((item) => item.key === level)?.label || "Evidence"}`}
                        >
                          <span className="proof-solar-planet-counterspin">
                            <i className="proof-solar-planet-dot" />
                            <span>{skill.skill}</span>
                          </span>
                        </button>
                      </div>
                    );
                  })}

                  {orbitalSkills.length === 0 && (
                    <div className="proof-solar-no-planets">No claimed skills found yet</div>
                  )}
                  <div className="proof-solar-starfield" aria-hidden="true">✦　·　✧　·　✦　·　✧　·　✦</div>
                </div>

                <div className="proof-solar-legend" aria-label="Evidence level legend">
                  {LEVELS.map((level) => (
                    <span key={level.key}>
                      <i className={`proof-legend-dot proof-legend-${level.key}`} />
                      {level.label}
                    </span>
                  ))}
                </div>
                {skills.length > orbitalSkills.length && (
                  <p className="proof-solar-more-note">Showing 8 orbiting skills. Explore all {skills.length} skills in the evidence list below.</p>
                )}
              </div>

              <aside className="proof-solar-selected" aria-live="polite">
                {selectedSkill ? (
                  <>
                    <div className="proof-solar-selected-top">
                      <div>
                        <span className="proof-solar-kicker">SELECTED PLANET</span>
                        <h3>{selectedSkill.skill}</h3>
                        <p>{selectedSkill.category || "Resume skill"}</p>
                      </div>
                      <span className={`proof-map-status proof-status-${LEVELS.some((item) => item.key === selectedSkill.evidenceLevel) ? selectedSkill.evidenceLevel : "not_found"}`}>
                        {LEVELS.find((item) => item.key === selectedSkill.evidenceLevel)?.label || "No proof found"}
                      </span>
                    </div>
                    <p className="proof-solar-selected-explanation">{selectedSkill.explanation || "No additional explanation was returned for this skill."}</p>
                    <div className="proof-solar-selected-metrics">
                      <div>
                        <span>CLASSIFICATION CONFIDENCE</span>
                        <strong>{Math.max(0, Math.min(100, Number(selectedSkill.confidence) || 0))}%</strong>
                      </div>
                      <div>
                        <span>EVIDENCE LOCATIONS</span>
                        <strong>{Array.isArray(selectedSkill.evidenceSections) ? selectedSkill.evidenceSections.length : 0}</strong>
                      </div>
                    </div>
                    <div className="proof-solar-snippets">
                      <span className="proof-map-detail-label">PROOF SIGNALS</span>
                      {Array.isArray(selectedSkill.evidenceSnippets) && selectedSkill.evidenceSnippets.length > 0 ? (
                        <ul>
                          {selectedSkill.evidenceSnippets.slice(0, 3).map((snippet, index) => <li key={index}>“{snippet}”</li>)}
                        </ul>
                      ) : (
                        <p>No supporting example was found in the extracted resume text.</p>
                      )}
                    </div>
                    <div className="proof-solar-selected-footer">
                      <span>BEST NEXT MOVE</span>
                      <p>{selectedSkill.proofSuggestion || "Add a specific, truthful example showing how you used this skill."}</p>
                    </div>
                  </>
                ) : (
                  <div className="proof-solar-empty-detail">
                    <span>✧</span>
                    <h3>Your skill universe is waiting</h3>
                    <p>Add a skills section with project or experience examples, then rebuild your map.</p>
                  </div>
                )}
              </aside>
            </div>
          </section>

          <section className="proof-map-main">
            <div className="proof-map-section-heading">
              <div>
                <span className="proof-map-eyebrow">THE EVIDENCE NETWORK</span>
                <h2>Skill-by-skill breakdown</h2>
                <p>Open each skill to see what in your resume supports it.</p>
              </div>
              <button type="button" className="proof-map-refresh" onClick={() => setRetryKey((value) => value + 1)}>
                ↻ Rebuild map
              </button>
            </div>

            <div className="proof-map-filter-row">
              <button type="button" className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>
                All skills ({skills.length})
              </button>
              {LEVELS.map((level) => (
                <button type="button" key={level.key} className={filter === level.key ? "active" : ""} onClick={() => setFilter(level.key)}>
                  {level.label} ({counts[level.key]})
                </button>
              ))}
            </div>

            {visibleSkills.length > 0 ? (
              <div className="proof-map-skill-list">
                {visibleSkills.map((skill, index) => {
                  const level = LEVELS.find((item) => item.key === skill.evidenceLevel) || LEVELS[3];
                  return (
                    <details className={`proof-map-skill proof-${level.key}`} key={`${skill.skill}-${index}`} open={index === 0 && filter === "all"}>
                      <summary>
                        <span className="proof-map-skill-symbol">{level.icon}</span>
                        <span className="proof-map-skill-title">
                          <strong>{skill.skill}</strong>
                          <small>{skill.category || "Skill"}</small>
                        </span>
                        <span className={`proof-map-status proof-status-${level.key}`}>{level.label}</span>
                        <span className="proof-map-confidence">{Number(skill.confidence) || 0}% confidence</span>
                        <span className="proof-map-chevron">⌄</span>
                      </summary>

                      <div className="proof-map-skill-details">
                        <p className="proof-map-explanation">{skill.explanation}</p>

                        <div className="proof-map-evidence-grid">
                          <div className="proof-map-evidence-block">
                            <span className="proof-map-detail-label">WHERE WE FOUND IT</span>
                            {Array.isArray(skill.evidenceSections) && skill.evidenceSections.length > 0 ? (
                              <div className="proof-map-tags">
                                {skill.evidenceSections.map((section, tagIndex) => <span key={tagIndex}>{section}</span>)}
                              </div>
                            ) : <p className="proof-map-muted">No supporting section identified.</p>}
                          </div>

                          <div className="proof-map-evidence-block">
                            <span className="proof-map-detail-label">RESUME EVIDENCE</span>
                            {Array.isArray(skill.evidenceSnippets) && skill.evidenceSnippets.length > 0 ? (
                              <ul className="proof-map-evidence-quotes">
                                {skill.evidenceSnippets.map((snippet, quoteIndex) => <li key={quoteIndex}>“{snippet}”</li>)}
                              </ul>
                            ) : <p className="proof-map-muted">No specific evidence was found in the extracted resume text.</p>}
                          </div>
                        </div>

                        <div className="proof-map-next-step">
                          <span className="proof-map-detail-label">HOW TO STRENGTHEN THIS PROOF</span>
                          <p>{skill.proofSuggestion}</p>
                        </div>
                        <div className="proof-map-interview-question">
                          <span className="proof-map-detail-label">PRACTICE QUESTION</span>
                          <p>{skill.interviewQuestion}</p>
                        </div>
                      </div>
                    </details>
                  );
                })}
              </div>
            ) : (
              <div className="proof-map-empty">
                <span>⌕</span>
                <h3>{skills.length ? "No skills in this category" : "No claimed skills found"}</h3>
                <p>{skills.length ? "Choose another evidence filter to view your skills." : "Add a clear skills section to your resume, then generate the map again."}</p>
              </div>
            )}
          </section>

          <section className="proof-map-actions-grid">
            <div className="proof-map-action-panel">
              <span className="proof-map-eyebrow">WHAT STANDS OUT</span>
              <h3>Key observations</h3>
              {Array.isArray(result.keyObservations) && result.keyObservations.length > 0 ? (
                <ul>{result.keyObservations.map((item, index) => <li key={index}>{item}</li>)}</ul>
              ) : <p>No additional observations were returned.</p>}
            </div>
            <div className="proof-map-action-panel">
              <span className="proof-map-eyebrow">YOUR NEXT MOVES</span>
              <h3>Recommended actions</h3>
              {Array.isArray(result.recommendedActions) && result.recommendedActions.length > 0 ? (
                <ul>{result.recommendedActions.map((item, index) => <li key={index}>{item}</li>)}</ul>
              ) : <p>No additional actions were returned.</p>}
            </div>
          </section>

          <p className="proof-map-disclaimer">{result.limitation || "This map reviews only the text extracted from your current resume. It cannot verify your real-world skill level."}</p>
        </>
      )}
    </section>
  );
}

export default SkillProofMap;
