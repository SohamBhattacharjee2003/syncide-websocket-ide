const mongoose = require("mongoose");

const ActivitySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["create", "edit", "run", "collab", "deploy", "commit", "review"], default: "edit" },
    message: { type: String, required: true },
    workspaceName: { type: String, default: "" },
    language: { type: String, default: "" },
    icon: { type: String, default: "💻" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Activity", ActivitySchema);
