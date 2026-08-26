const express = require("express");
const Competition = require("../models/Competition");

const router = express.Router();

// @route GET /api/competitions/active
// @desc Get the active competition banner config
router.get("/active", async (req, res) => {
  try {
    let competition = await Competition.findOne();
    if (!competition) {
      // If none exists, return a default inactive one or create it
      competition = new Competition({ isActive: false });
      await competition.save();
    }

    // Auto-expire if end date has passed
    if (
      competition.isActive &&
      competition.endDate &&
      new Date() > new Date(competition.endDate)
    ) {
      competition.isActive = false;
      await competition.save();
    }

    // Populate winner details if present
    competition = await Competition.findById(competition._id).populate({
      path: "winnerBookId",
      populate: { path: "author", select: "username" },
    });

    res.json(competition);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

module.exports = router;
