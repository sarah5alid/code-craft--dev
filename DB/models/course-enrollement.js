import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  enrollmentDate: { type: Date, default: Date.now },

  status: { type: String, enum: ["Enrolled", "In Progress", "Completed"], default: "Enrolled" },
  progress: { type: Number, default: 0 }, // Track overall course progress
  lessons: [{ 
    lessonId: { type: mongoose.Schema.Types.ObjectId, ref: "CourseContent" },
    isCompleted: { type: Boolean, default: false },
  }]
});

export const Enrollment = mongoose.model("Enrollment", enrollmentSchema);

      