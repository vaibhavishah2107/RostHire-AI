const User = require("../models/user");

async function requireHiringTeam(req, res, next) {
  try {
    // The verifyToken middleware should run before this middleware.
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please log in first.",
      });
    }

    // Read the current role from the database.
    const user = await User.findById(userId).select(
      "role hiringTeamVerified"
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account not found.",
      });
    }

    if (
      user.role !== "hiringTeam" ||
      user.hiringTeamVerified !== true
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Only verified hiring teams can publish jobs.",
      });
    }

    req.hiringTeam = user;

    next();
  } catch (error) {
    console.error("HIRING TEAM AUTH ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to verify hiring-team permissions.",
    });
  }
}

module.exports = requireHiringTeam;
