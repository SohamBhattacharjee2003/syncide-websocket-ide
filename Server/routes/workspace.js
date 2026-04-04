const express = require("express");
const Workspace = require("../models/Workspace");
const Activity = require("../models/Activity");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Apply auth middleware to all workspace routes
router.use(authMiddleware);

// ── GET all workspaces for the current user ──────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const workspaces = await Workspace.find({ owner: req.user.userId })
      .sort({ lastOpened: -1 })
      .lean();
    res.json({ workspaces });
  } catch (err) {
    console.error("Get workspaces error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// ── GET single workspace ─────────────────────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const workspace = await Workspace.findOne({
      _id: req.params.id,
      owner: req.user.userId,
    }).lean();
    if (!workspace) return res.status(404).json({ error: "Workspace not found" });
    res.json({ workspace });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ── POST create workspace ─────────────────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const { name, type, language, description, color } = req.body;
    if (!name) return res.status(400).json({ error: "Workspace name is required" });

    const ext = getExtension(language || "javascript");
    const workspace = new Workspace({
      name,
      type: type || "plain",
      language: language || "javascript",
      description: description || "",
      color: color || "#10b981",
      owner: req.user.userId,
      files: [
        {
          id: "1",
          name: `main.${ext}`,
          language: language || "javascript",
          content: getBoilerplate(language || "javascript"),
          type: "file",
        },
      ],
    });
    await workspace.save();

    // Log activity
    await Activity.create({
      userId: req.user.userId,
      type: "create",
      message: `Created workspace "${name}"`,
      workspaceName: name,
      language: language || "javascript",
      icon: "✨",
    }).catch(() => {});

    res.status(201).json({ workspace });
  } catch (err) {
    console.error("Create workspace error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// ── PUT update workspace ──────────────────────────────────────────────────────
router.put("/:id", async (req, res) => {
  try {
    const { name, description, color, files, language, notes, kanbanTasks, figmaUrl } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (color !== undefined) updates.color = color;
    if (files !== undefined) updates.files = files;
    if (language !== undefined) updates.language = language;
    if (notes !== undefined) updates.notes = notes;
    if (kanbanTasks !== undefined) updates.kanbanTasks = kanbanTasks;
    if (figmaUrl !== undefined) updates.figmaUrl = figmaUrl;
    updates.lastOpened = new Date();

    const workspace = await Workspace.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.userId },
      { $set: updates },
      { new: true }
    );
    if (!workspace) return res.status(404).json({ error: "Workspace not found" });
    res.json({ workspace });
  } catch (err) {
    console.error("Update workspace error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// ── DELETE workspace ─────────────────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const workspace = await Workspace.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.userId,
    });
    if (!workspace) return res.status(404).json({ error: "Workspace not found" });
    res.json({ success: true, message: "Workspace deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ── PUT toggle star ───────────────────────────────────────────────────────────
router.put("/:id/star", async (req, res) => {
  try {
    const workspace = await Workspace.findOne({ _id: req.params.id, owner: req.user.userId });
    if (!workspace) return res.status(404).json({ error: "Workspace not found" });
    workspace.starred = !workspace.starred;
    await workspace.save();
    res.json({ workspace, starred: workspace.starred });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ── POST add collaborator ─────────────────────────────────────────────────────
router.post("/:id/collaborators", async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: "Username required" });
    const workspace = await Workspace.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.userId },
      { $addToSet: { collaborators: username } },
      { new: true }
    );
    if (!workspace) return res.status(404).json({ error: "Workspace not found" });
    res.json({ workspace });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ── Helpers ───────────────────────────────────────────────────────────────────
function getExtension(lang) {
  const map = {
    javascript: "js", typescript: "ts", python: "py", java: "java",
    cpp: "cpp", c: "c", go: "go", rust: "rs", ruby: "rb",
    php: "php", bash: "sh", html: "html", css: "css", json: "json",
  };
  return map[lang] || "txt";
}

function getBoilerplate(lang) {
  const boilerplates = {
    javascript: `// JavaScript – SyncIDE\nconsole.log("Hello, World!");\n`,
    typescript: `// TypeScript – SyncIDE\nconst greet = (name: string): string => \`Hello, \${name}!\`;\nconsole.log(greet("World"));\n`,
    python: `# Python – SyncIDE\ndef main():\n    print("Hello, World!")\n\nif __name__ == "__main__":\n    main()\n`,
    java: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}\n`,
    cpp: `#include <iostream>\nusing namespace std;\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}\n`,
    c: `#include <stdio.h>\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}\n`,
    go: `package main\nimport "fmt"\nfunc main() {\n    fmt.Println("Hello, World!")\n}\n`,
    rust: `fn main() {\n    println!("Hello, World!");\n}\n`,
    ruby: `# Ruby – SyncIDE\nputs "Hello, World!"\n`,
    php: `<?php\necho "Hello, World!";\n?>`,
    bash: `#!/bin/bash\necho "Hello, World!"\n`,
    html: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>Document</title>\n</head>\n<body>\n  <h1>Hello, World!</h1>\n</body>\n</html>\n`,
  };
  return boilerplates[lang] || `// ${lang}\n// Start coding here\n`;
}

module.exports = router;
