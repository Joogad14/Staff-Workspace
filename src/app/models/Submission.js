// src/models/Submission.js
import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({
  title: String,
  description: String,
  link: String,
  fileUrl: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },
  staffName: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Submission || mongoose.model("Submission", submissionSchema);