async function buildSkillProofMapController(req, res) {
  try {
    const query = { userId: req.user.id };

    if (req.body?.resumeId) {
      query._id = req.body.resumeId;
    }

    const savedResume = await Resume.findOne(query).sort({ _id: -1 });

    if (!savedResume) {
      return res.status(404).json({
        success: false,
        message: "Please upload your resume first.",
      });
    }

    const result = await buildSkillProofMap(savedResume.extractedText);

    return res.status(200).json({
      success: true,
      feature: "Skill Proof Map",
      resumeId: savedResume._id,
      result,
    });
  } catch (error) {
    console.error("SKILL PROOF MAP ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to generate Skill Proof Map.",
    });
  }
}

module.exports = uploadResume;
module.exports.buildSkillProofMap = buildSkillProofMapController;