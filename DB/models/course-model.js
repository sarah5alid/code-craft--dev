import mongoose, { Schema, Types } from "mongoose";

const courseSchema = new Schema(
  {
    courseName: { type: String, required: true, unique: true, trim: true },

    desc: { type: String, required: true, default: null },
    slug: { type: String, required: true, unique: true },

    level: {
      type: String,
      enum: ["All", "Beginner", "Intermediate", "Advanced"],
      required: true,
    },
    prerequisites: { type: String, required: true },

    courseDuration: { type: Number, required: true, default: 0 },
    basePrice: { type: Number, required: true },
    discount: { type: Number, default: 0 },

    appliedPrice: { type: Number, required: true },
    rate: { type: Number, default: 0, min: 0, max: 5 },

    numOfVideos: {
      type: Number,
      default: 0,
    },

    image: {
      id: { type: String, unique: true },
      url: { type: String },
    },

    isApproved: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },

    addedBy: { type: Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Types.ObjectId, ref: "User" },
    categoryId: { type: Types.ObjectId, ref: "Category", required: true },

    vidoes: [{ type: Schema.Types.ObjectId, ref: "CourseContent" }],

    edits: {
      type: {
        courseName: { type: String, trim: true, default: null },
        desc: { type: String, default: null },
        slug: { type: String, default: null },
        level: {
          type: String,
          enum: ["All", "Beginner", "Intermediate", "Advanced"],
          default: null,
        },
        prerequisites: { type: String, default: null },
        courseDuration: { type: Number, default: null },
        basePrice: { type: Number, default: null },
        discount: { type: Number, default: null },
        appliedPrice: { type: Number, default: null },
        rate: { type: Number, default: null, min: 0, max: 5 },
        numOfVideos: { type: Number, default: null },
        image: {
          id: { type: String, default: null },
          url: { type: String, default: null },
        },
        isApproved: { type: Boolean, default: null },
        isDeleted: { type: Boolean, default: null },
        addedBy: { type: Types.ObjectId, ref: "User", default: null },
        updatedBy: { type: Types.ObjectId, ref: "User", default: null },
        categoryId: { type: Types.ObjectId, ref: "Category", default: null },
        vidoes: {
          type: [{ type: Schema.Types.ObjectId, ref: "CourseContent" }],
          default: null,
        },
      },
      default: {},
    },
  },

  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

courseSchema.pre("save", function (next) {
  this.numOfVideos = this.vidoes.length;
  next();
});

export const Course = mongoose.model("Course", courseSchema);
