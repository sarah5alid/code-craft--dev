import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  enrollmentDate: { type: Date, default: Date.now },

  status: {
    type: String,
    enum: [ "In Progress", "Completed"],
    default: "In Progress",
  },
  progress: { type: Number, default: 0 }, // Track overall course progress
  lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: "CourseContent" }],
});

export const Enrollment = mongoose.model("Enrollment", enrollmentSchema);
