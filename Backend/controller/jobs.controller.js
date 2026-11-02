
const Job = require("../models/job");

// Escape user input before using it in a search regex.
function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// POST /api/jobs
// Publish a job as a verified hiring team.
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

    // Never trust a postedBy value sent by the client.
    // The verified middleware supplies the authenticated team.
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

// GET /api/jobs
// Candidates can browse open jobs.
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

    if (q && q.trim()) {
      const searchRegex = new RegExp(
        escapeRegex(q.trim()),
        "i"
      );

      filter.$or = [
        { title: searchRegex },
        { companyName: searchRegex },
        { description: searchRegex },
        { requiredSkills: searchRegex },
      ];
    }

    if (location && location.trim()) {
      filter.location = {
        $regex: escapeRegex(location.trim()),
        $options: "i",
      };
    }

    if (workMode) {
      if (!["Remote", "Hybrid", "On-site"].includes(workMode)) {
        return res.status(400).json({
          success: false,
          message: "Invalid work mode.",
        });
      }

      filter.workMode = workMode;
    }

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

    const requestedPage = Number.parseInt(req.query.page, 10);
    const requestedLimit = Number.parseInt(req.query.limit, 10);

    const page =
      Number.isInteger(requestedPage) && requestedPage > 0
        ? requestedPage
        : 1;

    const limit =
      Number.isInteger(requestedLimit) && requestedLimit > 0
        ? Math.min(requestedLimit, 50)
        : 10;

    const skip = (page - 1) * limit;

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

// GET /api/jobs/mine
// Verified hiring teams can view their own listings.
async function getMyJobs(req, res) {
  try {
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

module.exports = {
  createJob,
  getOpenJobs,
  getMyJobs,
};
