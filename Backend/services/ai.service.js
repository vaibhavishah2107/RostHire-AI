const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

async function analyzeResume(resumeText) {
    const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",

        contents: `
You are RoastHire AI, an expert resume evaluator for
college students and early-career professionals.

Analyze the resume using the following framework.

IMPORTANT:
- Use ONLY information present in the resume.
- Do not invent skills, experience, projects, achievements,
  certifications, internships, or education.
- Scores must be integers from 0 to 100.
- Be critical but fair.
- Distinguish between listed skills and demonstrated skills.

ATS SCORE:
- Structure and section clarity: 20 points
- Keyword and skill coverage: 25 points
- Readability and formatting: 20 points
- Experience/project relevance: 20 points
- Action-oriented content: 15 points

RESUME QUALITY SCORE:
- Clarity and communication: 20 points
- Specificity and evidence: 25 points
- Consistency and organization: 20 points
- Project/experience quality: 20 points
- Professional presentation: 15 points

PLACEMENT READINESS SCORE:
- Technical skill foundation: 30 points
- Project strength: 25 points
- Practical evidence: 20 points
- Resume quality: 15 points
- Profile completeness: 10 points

Resume:

${resumeText}
        `,

        config: {
            responseMimeType: "application/json",

            responseSchema: {
                type: "object",

                properties: {
                    atsScore: {
                        type: "integer",
                        description: "ATS score from 0 to 100",
                    },

                    resumeQualityScore: {
                        type: "integer",
                        description: "Resume quality score from 0 to 100",
                    },

                    placementReadinessScore: {
                        type: "integer",
                        description: "Placement readiness score from 0 to 100",
                    },

                    summary: {
                        type: "string",
                    },

                    strengths: {
                        type: "array",
                        items: {
                            type: "string",
                        },
                    },

                    weaknesses: {
                        type: "array",
                        items: {
                            type: "string",
                        },
                    },

                    skills: {
                        type: "array",
                        items: {
                            type: "string",
                        },
                    },

                    skillGaps: {
                        type: "array",
                        items: {
                            type: "string",
                        },
                    },
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
            },
        },
    });

    console.log("Raw Gemini response:");
    console.log(response.text);

    return JSON.parse(response.text);
}
async function roastResume(resumeText, roastLevel) {
    let roastStyle = "";

    if (roastLevel === "mild") {
        roastStyle = `
Be honest but gentle.
Focus mainly on constructive criticism.
Use light humor.
Avoid harsh language.
        `;
    }

    if (roastLevel === "brutal") {
        roastStyle = `
Be brutally honest and witty.
roast the resume as a real comadian.
be brutal, use harsh language.
Point out weak claims, vague descriptions,
unsupported skills, weak project descriptions,
poor formatting, and missing evidence.
Use sharp humor, but keep the feedback useful.
        `;
    }

    if (roastLevel === "nuclear") {
        roastStyle = `
Be extremely direct, savage, and witty.
the person should feel sad.
be verry brutal, use harsh language.
Call out every obvious weakness you can support
from the resume.
The tone can be ruthless and funny,
but never attack the person's identity,
appearance, intelligence, background, or other
personal characteristics.
Every criticism must be supported by the resume.
        `;
    }

    const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",

        contents: `
You are RoastHire AI's Resume Roast Mode.

Your job is to roast the candidate's resume,
not the candidate as a person.

${roastStyle}

IMPORTANT:
- Use ONLY information present in the resume.
- Do not invent experience, skills, projects, or achievements.
- Do not make personal attacks.
- Identify specific problems.
- For every major criticism, explain what should be improved.
- Make the response entertaining but genuinely useful.

Structure your response like this:

🔥 OVERALL ROAST

Give a short overall roast of the resume.

🔥 BIGGEST PROBLEMS

Give 5 to 8 specific problems.
For each one:
1. What is wrong
2. Why it is weak
3. How to improve it

🔥 FINAL VERDICT

Give a short final verdict and the top 3 things
the candidate should fix first.

ROAST LEVEL:
${roastLevel}

RESUME:
${resumeText}
        `,
    });

    return response.text;
}
module.exports = {
    analyzeResume,
    roastResume
};
