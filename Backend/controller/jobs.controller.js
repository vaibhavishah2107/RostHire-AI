
const Job = require("../models/job");

// Escape special regex characters in user input.
function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}


// ==========================================
// POST /api/jobs
// Create a job as a verified hiring team
// ==========================================

async function createJob(req, res) {
  try {
    const {
      title,
      companyName,
      description,
      requiredSkills,
      location,
      workMode,
      employmentType,
      experienceLevel,
      applicationUrl,
    } = req.body;

    // Validate required fields.
    if (
      !title?.trim() ||
      !companyName?.trim() ||
      !description?.trim() ||
      !location?.trim() ||
      !employmentType ||
      !applicationUrl?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required job details.",
      });
    }

    // Validate skills.
    if (
      requiredSkills !== undefined &&
      !Array.isArray(requiredSkills)
    ) {
      return res.status(400).json({
        success: false,
        message: "requiredSkills must be an array.",
      });
    }

    if (
      requiredSkills?.some(
        (skill) => typeof skill !== "string"
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Every required skill must be a string.",
      });
    }

    const skills = (requiredSkills || [])
      .map((skill) => skill.trim())
      .filter(Boolean);

    // Ensure the hiring-team middleware supplied an owner.
    if (!req.hiringTeam?._id) {
      return res.status(403).json({
        success: false,
        message: "Verified hiring-team access is required.",
      });
    }

    // Create job in MongoDB.
    const job = await Job.create({
      title: title.trim(),
      companyName: companyName.trim(),
      description: description.trim(),
      requiredSkills: skills,
      location: location.trim(),
      workMode,
      employmentType,
      experienceLevel,
      applicationUrl: applicationUrl.trim(),
      postedBy: req.hiringTeam._id,
      status: "Open",
    });

    return res.status(201).json({
      success: true,
      message: "Job published successfully.",
      job,
    });

  } catch (error) {
    console.error("CREATE JOB ERROR:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to publish the job.",
    });
  }
}


// ==========================================
// GET /api/jobs
// Browse and search open jobs
// ==========================================

async function getOpenJobs(req, res) {
  try {
    const {
      q,
      location,
      workMode,
      employmentType,
      experienceLevel,
    } = req.query;

    const filter = {
      status: "Open",
    };

    // SEARCH BY KEYWORDS
    if (typeof q === "string" && q.trim()) {

      const stopWords = new Set([
        "i", "we", "am", "is", "are", "a", "an", "the",
        "and", "or", "with", "for", "to", "of", "in",
        "on", "at", "by", "from", "looking", "want",
        "need", "my", "me", "this", "that", "should",
        "will", "can", "you", "your", "candidate",
        "responsibilities", "requirements", "knowledge",
        "familiarity", "strong", "basic", "good",
      ]);

      // Extract useful keywords from the description.
      const terms = [
        ...new Set(
          q
            .toLowerCase()
            .split(/[^a-z0-9+#.]+/)
            .filter(
              (word) =>
                word.length > 1 &&
                !stopWords.has(word)
            )
        ),
      ].slice(0, 15);

      if (terms.length > 0) {
        filter.$or = terms.flatMap((term) => {
          const regex = new RegExp(
            escapeRegex(term),
            "i"
          );

          return [
            { title: regex },
            { companyName: regex },
            { description: regex },
            { requiredSkills: regex },
          ];
        });
      }
    }

    // FILTER BY LOCATION
    if (
      typeof location === "string" &&
      location.trim()
    ) {
      filter.location = {
        $regex: escapeRegex(location.trim()),
        $options: "i",
      };
    }

    // FILTER BY WORK MODE
    if (workMode) {
      if (
        !["Remote", "Hybrid", "On-site"].includes(workMode)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid work mode.",
        });
      }

      filter.workMode = workMode;
    }

    // FILTER BY EMPLOYMENT TYPE
    if (employmentType) {
      const validTypes = [
        "Internship",
        "Full-time",
        "Part-time",
        "Contract",
      ];

      if (!validTypes.includes(employmentType)) {
        return res.status(400).json({
          success: false,
          message: "Invalid employment type.",
        });
      }

      filter.employmentType = employmentType;
    }

    // FILTER BY EXPERIENCE
    if (experienceLevel) {
      const validLevels = [
        "Internship",
        "Entry-level",
        "Junior",
        "Mid-level",
        "Senior",
        "Any",
      ];

      if (!validLevels.includes(experienceLevel)) {
        return res.status(400).json({
          success: false,
          message: "Invalid experience level.",
        });
      }

      filter.experienceLevel = experienceLevel;
    }

    // PAGINATION
    const requestedPage = Number.parseInt(
      req.query.page,
      10
    );

    const requestedLimit = Number.parseInt(
      req.query.limit,
      10
    );

    const page =
      Number.isInteger(requestedPage) &&
      requestedPage > 0
        ? requestedPage
        : 1;

    const limit =
      Number.isInteger(requestedLimit) &&
      requestedLimit > 0
        ? Math.min(requestedLimit, 50)
        : 10;

    const skip = (page - 1) * limit;

    // FETCH JOBS AND TOTAL COUNT
    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .select(
          "title companyName description requiredSkills location workMode employmentType experienceLevel applicationUrl createdAt"
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Job.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      jobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error("GET JOBS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve jobs.",
    });
  }
}


// ==========================================
// GET /api/jobs/mine
// Get jobs posted by the logged-in team
// ==========================================

async function getMyJobs(req, res) {
  try {
    if (!req.hiringTeam?._id) {
      return res.status(403).json({
        success: false,
        message: "Verified hiring-team access is required.",
      });
    }

    const jobs = await Job.find({
      postedBy: req.hiringTeam._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: jobs.length,
      jobs,
    });

  } catch (error) {
    console.error("GET MY JOBS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve your job listings.",
    });
  }
}


// ==========================================
// EXPORT CONTROLLERS
// ==========================================

module.exports = {
  createJob,
  getOpenJobs,
  getMyJobs,
};
