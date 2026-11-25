const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Main model first, then an optional fallback (set both on Render)
const MODELS = [
  ...new Set(
    [
      process.env.GEMINI_MODEL || "gemini-3.1-flash-lite",
      process.env.GEMINI_FALLBACK_MODEL,
    ].filter(Boolean)
  ),
];

const stringArray = {
  type: "array",
  items: { type: "string" },
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// True for temporary problems: busy model, rate limit, network hiccup
function isBusyError(err) {
  const msg = String(err?.message || err).toLowerCase();
  return (
    [429, 500, 503, 504].includes(err?.status) ||
    /overloaded|high demand|unavailable|resource_exhausted|rate limit|quota|timed out|fetch failed/.test(
      msg
    )
  );
}

// Tries each model up to 3 times, with a short wait between attempts
async function generateWithFallback(request) {
  let lastError;

  for (const model of MODELS) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        return await ai.models.generateContent({ ...request, model });
      } catch (err) {
        lastError = err;

        if (!isBusyError(err)) throw err; // real error: don't retry

        console.warn(
          `Gemini busy (model ${model}, attempt ${attempt + 1}): ${err.message}`
        );

        if (attempt < 2) {
          await sleep(1000 * 2 ** attempt + Math.random() * 500);
        }
      }
    }
  }

  throw lastError;
}

// =====================================================
// COMMON GEMINI FUNCTION
// =====================================================

async function generateStructuredAnalysis(prompt, responseSchema) {
  const response = await generateWithFallback({
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema,
    },
  });

  if (!response.text) {
    throw new Error("Gemini returned an empty response.");
  }

  try {
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini JSON parsing error:", error.message);
    throw new Error("AI returned an invalid response.");
  }
}

// =====================================================
// 1. GENERAL RESUME ANALYSIS
// =====================================================

async function analyzeResume(resumeText) {
  const responseSchema = {
    type: "object",
    properties: {
      atsScore: { type: "integer" },
      resumeQualityScore: { type: "integer" },
      placementReadinessScore: { type: "integer" },
      summary: { type: "string" },
      strengths: stringArray,
      weaknesses: stringArray,
      skills: stringArray,
      skillGaps: stringArray,
    },
    required: [
      "atsScore",
      "resumeQualityScore",
      "placementReadinessScore",
      "summary",
      "strengths",
      "weaknesses",
      "skills",
      "skillGaps",
    ],
  };

  return generateStructuredAnalysis(
    `You are RoastHire AI, an expert resume evaluator.

Analyze the resume using ONLY information present in it.
Never invent skills, experience, achievements or qualifications.

ATS SCORE:
- Structure and section clarity: 20
- Keyword and skill coverage: 25
- Readability and formatting: 20
- Project and experience relevance: 20
- Action-oriented content: 15

RESUME QUALITY SCORE:
- Clarity and communication: 20
- Specificity and evidence: 25
- Organization: 20
- Project and experience quality: 20
- Professional presentation: 15

PLACEMENT READINESS SCORE:
- Technical skills: 30
- Project strength: 25
- Practical evidence: 20
- Resume quality: 15
- Profile completeness: 10

All scores must be integers between 0 and 100.

RESUME:
${resumeText}`,
    responseSchema
  );
}

// =====================================================
// 2. ROAST MODE
// =====================================================

async function roastResume(resumeText, roastLevel) {
  let roastStyle = "";

  if (roastLevel === "mild") {
    roastStyle = `
Be honest but gentle.
Use light humor and constructive criticism.
`;
  } else if (roastLevel === "brutal") {
    roastStyle = `
Be brutally honest and witty.
Use sharp humor.
Point out weak skills, vague projects,
unsupported claims and poor descriptions.
`;
  } else if (roastLevel === "nuclear") {
    roastStyle = `
Be extremely direct, savage and witty.
Identify every weakness supported by the resume.
Never attack the person's identity or personal traits.
`;
  } else {
    throw new Error("Invalid roast level.");
  }

  const response = await generateWithFallback({

    contents: `
You are RoastHire AI Resume Roast Mode.

Your job is to roast the resume, not the candidate.

${roastStyle}

RULES:
- Use only information in the resume.
- Never invent achievements.
- Explain why something is weak.
- Give practical improvements.
- Keep the feedback entertaining and useful.

FORMAT:

1. OVERALL ROAST

2. BIGGEST PROBLEMS
Give 5 to 8 specific problems.
Explain:
- What is wrong
- Why it is weak
- How to improve it

3. FINAL VERDICT
Give the top 3 improvements.

ROAST LEVEL:
${roastLevel}

RESUME:
${resumeText}
`,
  });

  if (!response.text) {
    throw new Error("Gemini returned an empty roast.");
  }

  return response.text;
}

// =====================================================
// 3. JOB MATCHING
// =====================================================

async function matchJob(resumeText, jobDescription) {
  const responseSchema = {
    type: "object",
    properties: {
      matchScore: { type: "integer" },
      matchedSkills: stringArray,
      missingSkills: stringArray,
      matchedRequirements: stringArray,
      unmetRequirements: stringArray,
      recommendations: stringArray,
    },
    required: [
      "matchScore",
      "matchedSkills",
      "missingSkills",
      "matchedRequirements",
      "unmetRequirements",
      "recommendations",
    ],
  };

  return generateStructuredAnalysis(
    `
You are RoastHire AI's job matching engine.

Compare the resume with the job description.

RULES:
- Use only provided information.
- Do not invent qualifications.
- Consider semantic similarity.
- Distinguish listed skills from demonstrated skills.

SCORING:
- Skills alignment: 40%
- Experience alignment: 20%
- Responsibilities: 20%
- Education: 10%
- Other requirements: 10%

Match score must be between 0 and 100.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}
`,
    responseSchema
  );
}

// =====================================================
// 4. PROJECT STRENGTH ANALYZER
// =====================================================

async function analyzeProjectStrength(resumeText) {
  const projectSchema = {
    type: "object",
    properties: {
      projectName: { type: "string" },
      strengthScore: { type: "integer" },
      problemClarity: { type: "string" },
      technicalDepth: { type: "string" },
      implementationEvidence: { type: "string" },
      ownershipEvidence: { type: "string" },
      impactEvidence: { type: "string" },
      strengths: stringArray,
      weaknesses: stringArray,
      improvementSuggestions: stringArray,
    },
    required: [
      "projectName",
      "strengthScore",
      "problemClarity",
      "technicalDepth",
      "implementationEvidence",
      "ownershipEvidence",
      "impactEvidence",
      "strengths",
      "weaknesses",
      "improvementSuggestions",
    ],
  };

  const responseSchema = {
    type: "object",
    properties: {
      overallScore: { type: "integer" },
      assessmentStatus: { type: "string" },
      overallAssessment: { type: "string" },
      projects: {
        type: "array",
        items: projectSchema,
      },
      priorityImprovements: stringArray,
      missingEvidence: stringArray,
    },
    required: [
      "overallScore",
      "assessmentStatus",
      "overallAssessment",
      "projects",
      "priorityImprovements",
      "missingEvidence",
    ],
  };

  return generateStructuredAnalysis(
    `
You are RoastHire AI Project Strength Analyzer.

Analyze every project explicitly described in the resume.

Evaluate projects based on:

1. Problem clarity and relevance: 20 points
2. Technical depth: 25 points
3. Implementation evidence: 25 points
4. Candidate contribution: 15 points
5. Impact and outcomes: 15 points

IMPORTANT:
- Do not invent project features.
- Do not invent technologies or metrics.
- Separate individual contribution from team achievement.
- Give honest feedback.
- Suggest improvements without encouraging fabricated achievements.

If there are no projects, return:
- overallScore: 0
- assessmentStatus: insufficient_evidence
- projects: []

Scores must be between 0 and 100.

RESUME:
${resumeText}
`,
    responseSchema
  );
}

// =====================================================
// 5. FAKE SKILL DETECTION / SKILL EVIDENCE REVIEW
// =====================================================

async function detectUnsupportedSkills(resumeText) {
  const skillSchema = {
    type: "object",
    properties: {
      skill: { type: "string" },
      evidenceLevel: { type: "string" },
      confidence: { type: "integer" },
      resumeEvidence: stringArray,
      assessment: { type: "string" },
      verificationQuestion: { type: "string" },
    },
    required: [
      "skill",
      "evidenceLevel",
      "confidence",
      "resumeEvidence",
      "assessment",
      "verificationQuestion",
    ],
  };

  const responseSchema = {
    type: "object",
    properties: {
      overallSummary: { type: "string" },
      assessedSkills: {
        type: "array",
        items: skillSchema,
      },
      skillsNeedingVerification: stringArray,
      recommendations: stringArray,
      limitation: { type: "string" },
    },
    required: [
      "overallSummary",
      "assessedSkills",
      "skillsNeedingVerification",
      "recommendations",
      "limitation",
    ],
  };

  return generateStructuredAnalysis(
    `
You are RoastHire AI Skill Evidence Reviewer.

Check whether the skills claimed in the resume
are supported by projects, experience, education
or certifications.

EVIDENCE LEVELS:

- strong: Clear practical evidence.
- moderate: Some relevant evidence.
- limited: Skill is listed but has little explanation.
- not_found: No supporting evidence in the resume.

RULES:
- Never accuse a candidate of lying.
- Missing resume evidence does not prove lack of ability.
- Use only actual resume evidence.
- Do not invent examples.
- Confidence measures the evidence assessment,
  not whether the candidate is truthful.
- Provide one verification question per skill.
- Put limited and not_found skills into
  skillsNeedingVerification.

RESUME:
${resumeText}
`,
    responseSchema
  );
}

// =====================================================
// 6. RECRUITER EYE-TRACKING SIMULATOR
// =====================================================

async function simulateRecruiterScan(resumeText) {
  const scanItemSchema = {
    type: "object",
    properties: {
      position: { type: "integer" },
      section: { type: "string" },
      attentionLevel: { type: "string" },
      reason: { type: "string" },
    },
    required: [
      "position",
      "section",
      "attentionLevel",
      "reason",
    ],
  };

  const responseSchema = {
    type: "object",
    properties: {
      firstImpression: { type: "string" },
      scanOrder: {
        type: "array",
        items: scanItemSchema,
      },
      likelyHighlights: stringArray,
      potentiallyOverlooked: stringArray,
      readabilityIssues: stringArray,
      quickImprovements: stringArray,
      simulationDisclaimer: { type: "string" },
    },
    required: [
      "firstImpression",
      "scanOrder",
      "likelyHighlights",
      "potentiallyOverlooked",
      "readabilityIssues",
      "quickImprovements",
      "simulationDisclaimer",
    ],
  };

  return generateStructuredAnalysis(
    `
You are RoastHire AI Recruiter First-Pass Simulator.

Simulate a plausible recruiter review of the resume.

Analyze:
- Likely reading order
- Important sections
- Strong information
- Information that could be overlooked
- Unclear descriptions
- Quick improvements

Attention levels:
high, medium, low.

IMPORTANT:
- This is a text-based heuristic simulation.
- Do not claim to measure actual eye movements.
- Do not invent gaze coordinates or fixation time.
- Do not guess visual layout, font sizes or colors.
- Use only information available in extracted resume text.

RESUME:
${resumeText}
`,
    responseSchema
  );
}

// =====================================================
// 7. SKILL PROOF MAP
// =====================================================

async function buildSkillProofMap(resumeText) {
  const skillSchema = {
    type: "object",
    properties: {
      skill: { type: "string" },

      category: { type: "string" },

      evidenceLevel: {
        type: "string",
        description: "strong, moderate, limited, or not_found",
      },

      confidence: {
        type: "integer",
        description: "Confidence in evidence classification from 0 to 100",
      },

      evidenceSections: stringArray,

      evidenceSnippets: stringArray,

      explanation: { type: "string" },

      proofSuggestion: { type: "string" },

      interviewQuestion: { type: "string" },
    },

    required: [
      "skill",
      "category",
      "evidenceLevel",
      "confidence",
      "evidenceSections",
      "evidenceSnippets",
      "explanation",
      "proofSuggestion",
      "interviewQuestion",
    ],
  };

  const responseSchema = {
    type: "object",

    properties: {
      overallEvidenceScore: {
        type: "integer",
        description: "Evidence coverage score from 0 to 100",
      },

      overallSummary: { type: "string" },

      skills: {
        type: "array",
        items: skillSchema,
      },

      keyObservations: stringArray,

      recommendedActions: stringArray,

      limitation: { type: "string" },
    },

    required: [
      "overallEvidenceScore",
      "overallSummary",
      "skills",
      "keyObservations",
      "recommendedActions",
      "limitation",
    ],
  };

  return generateStructuredAnalysis(
    `
You are RoastHire AI Skill Proof Mapper.

Your task is to connect every claimed skill
to actual evidence in the candidate's resume.

CORE PURPOSE:

Create a skill evidence map that connects
technical skills and other claimed abilities to:

- Projects
- Work experience
- Internships
- Education
- Certifications
- Other resume sections

EVIDENCE LEVELS:

1. strong
A concrete project or experience demonstrates
the candidate applying the skill.

2. moderate
There is relevant evidence, but the depth
or individual contribution is not completely clear.

3. limited
The skill is listed, but supporting details
are weak or missing.

4. not_found
The skill is claimed, but no supporting example
appears elsewhere in the resume.

STRICT RULES:

- Use ONLY information present in the resume.
- Never invent projects, tools, responsibilities,
  achievements or metrics.
- Include only skills claimed by the candidate.
- Do not add unrelated skills.
- Never call a skill fake.
- not_found does not mean the candidate
  lacks that skill.
- Confidence represents confidence in the
  evidence classification, not real-world ability.
- Evidence snippets must be actual short excerpts
  or faithful references to resume content.
- Never create fake quotations.
- Return an empty evidenceSnippets array
  when no evidence is found.
- Include only sections actually represented
  in the resume.

CATEGORY EXAMPLES:

Programming Language
Framework
Database
Development Tool
Cloud
AI/ML
Soft Skill
Other

PROOF SUGGESTIONS:

Suggest practical ways to improve the evidence.

Examples:
- Explain how the skill was used in a project.
- Describe the candidate's actual contribution.
- Add a real GitHub repository link.
- Include a relevant course project.
- Add a measurable result only if verified.

INTERVIEW QUESTION:

Provide one useful technical question
for each skill to help the candidate
demonstrate their understanding.

OVERALL EVIDENCE SCORE:

Return a score between 0 and 100.

This score measures resume evidence coverage,
NOT the candidate's actual technical ability.

If no claimed skills can be identified,
return an empty skills array and explain why.

RESUME:
${resumeText}
`,
    responseSchema
  );
}

// =====================================================
// EXPORT ALL FUNCTIONS
// =====================================================

module.exports = {
  analyzeResume,
  roastResume,
  matchJob,
  analyzeProjectStrength,
  detectUnsupportedSkills,
  simulateRecruiterScan,
  buildSkillProofMap,
  isBusyError,
};