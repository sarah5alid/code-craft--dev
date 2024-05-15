import mongoose, { Schema, Types } from "mongoose";

const courseSchema = new Schema(
  {
    //strings
    courseName: { type: String, required: true, unique: true, trim: true },

    desc: { type: String, required: true, default: null },
    slug: { type: String, required: true, unique: true },

    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      required: true,
    },

    prerequisites: { type: String, required: true },

    //=================numbers====//

    courseDuration: { type: Number, required: true, default: 0 },
    basePrice: { type: Number, required: true },
    discount: { type: Number, default: 0 },

    appliedPrice: { type: Number, required: true },
    rate: { type: Number, default: 0, min: 0, max: 5 },

    progress: {
      type: Number,
      default: 0, // Initialize progress to 0%
    },

    numOfVideos: {
      type: Number,
      default: 0,
    },

    //image
    image: {
      id: { type: String, required: true, unique: true },
      url: { type: String, required: true },
    },
    //booleans

    isApproved: { type: Boolean, default: false },
    //IDs
    addedBy: { type: Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Types.ObjectId, ref: "User" },
    categoryId: { type: Types.ObjectId, ref: "Category", required: true },
    //array
    vidoes: [{ type: Schema.Types.ObjectId, ref: "CourseContent" }],
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// userSchema.virtual('coursesUploadedCount').get(function() {
//   return this.coursesUploaded.length;
// });

export const Course = mongoose.model("Course", courseSchema);
