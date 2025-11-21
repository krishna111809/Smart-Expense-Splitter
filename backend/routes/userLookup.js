// backend/routes/userLookup.js
const express = require("express");
const router = express.Router();
const { User } = require("../models");

// Lookup user by email
router.get("/by-email", async (req, res) => {
  try {
    const email = (req.query.email || "").trim().toLowerCase();
    if (!email) return res.status(400).json({ msg: "Email required" });

    const user = await User.findOne({ email }).select("_id name email").lean();
    if (!user) return res.status(404).json({ msg: "User not found" });

    return res.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("by-email lookup error:", err);
    return res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;