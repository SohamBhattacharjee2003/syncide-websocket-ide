const express = require("express");
const Workspace = require("../models/Workspace");
const Activity = require("../models/Activity");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.use(authMiddleware);

// ── GET /stats — workspace & activity counts ─────────────────────────────────
router.get("/stats", async (req, res) => {
  try {
    const userId = req.user.userId;
    const [totalWorkspaces, totalActivities] = await Promise.all([
      Workspace.countDocuments({ owner: userId }),
      Activity.countDocuments({ userId }),
    ]);

    // Count starred workspaces
    const starredWorkspaces = await Workspace.countDocuments({ owner: userId, starred: true });

    // Count unique collaborators across all workspaces
    const workspaces = await Workspace.find({ owner: userId }).select("collaborators").lean();
    const allCollabs = new Set();
    workspaces.forEach((w) => (w.collaborators || []).forEach((c) => allCollabs.add(c)));

    res.json({
      stats: {
        totalWorkspaces,
        starredWorkspaces,
        totalActivities,
        collaborators: allCollabs.size,
        linesOfCode: totalActivities * 42, // Estimated
        hoursThisWeek: Math.round(totalActivities * 0.5),
      },
    });
  } catch (err) {
    console.error("Stats error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// ── GET /activity — weekly coding activity ────────────────────────────────────
router.get("/activity", async (req, res) => {
  try {
    const userId = req.user.userId;
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const now = new Date();
    // Get activities for last 7 days
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const activities = await Activity.find({
      userId,
      createdAt: { $gte: weekAgo },
    }).lean();

    // Group by day of week
    const byDay = {};
    activities.forEach((a) => {
      const d = new Date(a.createdAt);
      const dayIndex = (d.getDay() + 6) % 7; // Make Monday = 0
      const day = days[dayIndex];
      if (!byDay[day]) byDay[day] = { commits: 0, lines: 0, hours: 0 };
      byDay[day].commits += 1;
      byDay[day].lines += Math.floor(Math.random() * 200) + 50;
      byDay[day].hours += 0.5;
    });

    const activity = days.map((day) => ({
      name: day,
      commits: byDay[day]?.commits || 0,
      lines: byDay[day]?.lines || 0,
      hours: byDay[day]?.hours || 0,
    }));

    res.json({ activity });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ── GET /languages — language distribution ────────────────────────────────────
router.get("/languages", async (req, res) => {
  try {
    const userId = req.user.userId;
    const workspaces = await Workspace.find({ owner: userId }).select("language").lean();

    const langMap = {};
    workspaces.forEach((w) => {
      const lang = w.language || "javascript";
      langMap[lang] = (langMap[lang] || 0) + 1;
    });

    const LANG_COLORS = {
      javascript: "#f7df1e",
      typescript: "#3178c6",
      python: "#3776ab",
      java: "#ed8b00",
      cpp: "#00599c",
      c: "#a8b9cc",
      go: "#00acd7",
      rust: "#ce422b",
      ruby: "#cc342d",
      php: "#4f5d95",
      bash: "#4eaa25",
      html: "#e34c26",
      css: "#264de4",
    };

    const total = Object.values(langMap).reduce((a, b) => a + b, 0) || 1;
    const languages = Object.entries(langMap).map(([name, count]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: Math.round((count / total) * 100),
      color: LANG_COLORS[name] || "#10b981",
    }));

    res.json({ languages });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ── GET /activities — recent activity log ─────────────────────────────────────
router.get("/activities", async (req, res) => {
  try {
    const userId = req.user.userId;
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const activities = await Activity.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Activity.countDocuments({ userId });

    res.json({ activities, total, page, limit });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ── POST /activities — create activity log entry ──────────────────────────────
router.post("/activities", async (req, res) => {
  try {
    const { type, message, workspaceName, language, icon } = req.body;
    const activity = await Activity.create({
      userId: req.user.userId,
      type: type || "edit",
      message: message || "Activity logged",
      workspaceName: workspaceName || "",
      language: language || "",
      icon: icon || "💻",
    });
    res.status(201).json({ activity });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
