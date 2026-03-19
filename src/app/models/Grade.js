import mongoose from "mongoose";

const GradeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "Staff", required: true },
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Submission" },
  score: { 
    type: Number, 
    required: true, 
    min: 0, 
    max: 100 
  },
  gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Assessor", required: true },
  date: { type: Date, default: Date.now }
});

const Grade = mongoose.models.Grade || mongoose.model("Grade", GradeSchema);
export default Grade;