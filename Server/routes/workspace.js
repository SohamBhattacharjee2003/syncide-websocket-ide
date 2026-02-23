const express = require("express");

const router = express.Router();

// Get all workspaces
router.get("/", (req, res) => {
  res.json({ workspaces: [] });
});

// Get single workspace
router.get("/:id", (req, res) => {
  res.json({ workspace: null });
});

// Create workspace
router.post("/", (req, res) => {
  res.status(201).json({ workspace: req.body });
});

// Update workspace
router.put("/:id", (req, res) => {
  res.json({ workspace: req.body });
});

// Delete workspace
router.delete("/:id", (req, res) => {
  res.json({ success: true });
});

// Star/unstar workspace
router.put("/:id/star", (req, res) => {
  res.json({ starred: true });
});

// Add collaborator
router.post("/:id/collaborators", (req, res) => {
  res.json({ collaborator: req.body });
});

module.exports = router;
