import mongoose from "mongoose";

const VerificationSchema = new mongoose.Schema({
  userId: String,
  fileName: String,
  fileData: Buffer,
  contentType: String,
  status: { type: String, default: "Pending" },
}, { timestamps: true });

const Verification = mongoose.models.Verification || mongoose.model("Verification", VerificationSchema);

export default Verification;