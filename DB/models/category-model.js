import mongoose, { Schema, Types } from "mongoose";

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      min: 5,
      max: 30,
    },
    slug: { type: String, required: true, unique: true },

    createdBy: { type: Types.ObjectId, ref: "User", required: true }, //superAdmin
    updatedBy: { type: Types.ObjectId, ref: "User" }, //superAdmin

    courses: [{ type: Types.ObjectId, ref: "Course", required: true }],
  },

  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
export const Category = mongoose.model("Category", categorySchema);
