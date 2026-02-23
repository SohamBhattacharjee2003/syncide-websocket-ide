const express = require("express");

const router = express.Router();

// Get dashboard stats
router.get("/stats", (req, res) => {
  res.json({ stats: { users: 1, workspaces: 0, activities: 0 } });
});

// Get weekly activity
router.get("/activity", (req, res) => {
  res.json({ activity: [] });
});

// Get languages
router.get("/languages", (req, res) => {
  res.json({ languages: [] });
});

// Get activities
router.get("/activities", (req, res) => {
  res.json({ activities: [] });
});

// Create activity
router.post("/activities", (req, res) => {
  res.status(201).json({ activity: req.body });
});

module.exports = router;
