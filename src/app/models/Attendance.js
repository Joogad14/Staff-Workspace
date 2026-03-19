import mongoose from "mongoose";

const AttendanceSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  date: {
    type: String, // or Date if you prefer
    required: true,
  },
});

const Attendance = mongoose.models.Attendance || mongoose.model("Attendance", AttendanceSchema);
export default Attendance;