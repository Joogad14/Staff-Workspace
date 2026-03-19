import mongoose from "mongoose";

const staffSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["assessor", "staff"], required: true },
  department: { type: String, required: true } 
});

const Staff = mongoose.models.Staff || mongoose.model("Staff", staffSchema);

export default Staff;