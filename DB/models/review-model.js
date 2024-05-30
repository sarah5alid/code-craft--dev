import mongoose from "mongoose";
import { Schema, Types } from "mongoose";

const reviewSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    reviewRate: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      enum: [1, 2, 3, 4, 5],
    },
    reviewComment: {
      type: String,
    },
  },

  { timestamps: true }
);

// Middleware to update course rating after a review is saved
reviewSchema.post("save", async function (doc) {
  await updateCourseRating(doc.courseId);
});
reviewSchema.post('findOneAndDelete', async function (doc) {
    const courseId = doc.courseId;
    await updateCourseRating(courseId);
  });
  

// Function to update course rating
async function updateCourseRating(courseId) {
  const reviews = await mongoose.model("Review").find({ courseId });
  let sum = 0;
  for (const review of reviews) {
    sum += review.reviewRate;
  }
  const rate =
    reviews.length > 0 ? Number((sum / reviews.length).toFixed(2)) : 0;
  await mongoose.model("Course").findByIdAndUpdate(courseId, { rate });
}
export default mongoose.models.Review || mongoose.model("Review", reviewSchema);
