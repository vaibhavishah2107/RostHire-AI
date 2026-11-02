const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    // Basic job information
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    companyName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 15000,
    },

    // Skills the hiring team requires
    requiredSkills: {
      type: [String],
      default: [],
    },

    // Job details
    location: {
      type: String,
      required: true,
      trim: true,
    },

    workMode: {
      type: String,
      enum: ["Remote", "Hybrid", "On-site"],
      default: "On-site",
    },

    employmentType: {
      type: String,
      enum: [
        "Internship",
        "Full-time",
        "Part-time",
        "Contract",
      ],
      required: true,
    },

    experienceLevel: {
      type: String,
      enum: [
        "Internship",
        "Entry-level",
        "Junior",
        "Mid-level",
        "Senior",
        "Any",
      ],
      default: "Entry-level",
    },

    // Where candidates apply
    applicationUrl: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function (value) {
          try {
            const url = new URL(value);
            return (
              url.protocol === "http:" ||
              url.protocol === "https:"
            );
          } catch {
            return false;
          }
        },
        message: "Please provide a valid application URL.",
      },
    },

    // The hiring-team user who created this listing
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Control whether the vacancy appears in search
    status: {
      type: String,
      enum: ["Open", "Closed", "Draft"],
      default: "Open",
    },
  },
  {
    timestamps: true,
  }
);

// Helps retrieve open jobs, newest first
jobSchema.index({ status: 1, createdAt: -1 });

const Job = mongoose.model("Job", jobSchema);

module.exports = Job;
