import mongoose from "mongoose";
import { Schema, Types } from "mongoose";

const courseContentSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true },

    video: {
      id: { type: String, unique: true },
      url: { type: String },
    },

    duration: { type: Number },
   
    order:{type:Number,required:true},

    course: { type: Types.ObjectId, ref: "Course", required: true },
  },
  { timestamps: true }
);

export const CourseContent = mongoose.model(
  "CourseContent",
  courseContentSchema
);
//slug ASK
