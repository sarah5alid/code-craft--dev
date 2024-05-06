import mongoose from "mongoose";
import { Schema, Types } from "mongoose";

const courseContentSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true },

    video: {
      id: { type: String, unique: true, required: true },
      url: { type: String, required: true },
    },

    duration: { type: Number, required: true },
    isCompleted: { type: Boolean, default: false },

    course: { type: Types.ObjectId, ref: "Course", required: true },
  },
  { timestamps: true }
);

export const CourseContent = mongoose.model(
  "CourseContent",
  courseContentSchema
);
//slug ASK