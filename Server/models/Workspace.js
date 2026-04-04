const mongoose = require("mongoose");

const FileSchema = new mongoose.Schema({
  id: String,
  name: String,
  language: String,
  content: String,
  type: { type: String, default: "file" },
});

const WorkspaceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ["realtime", "plain"], default: "plain" },
    language: { type: String, default: "javascript" },
    description: { type: String, default: "" },
    color: { type: String, default: "#10b981" },
    starred: { type: Boolean, default: false },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    collaborators: [{ type: String }],
    files: [FileSchema],
    notes: { type: String, default: "" },
    kanbanTasks: { type: mongoose.Schema.Types.Mixed, default: [] },
    figmaUrl: { type: String, default: "" },
    lastOpened: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Workspace", WorkspaceSchema);
