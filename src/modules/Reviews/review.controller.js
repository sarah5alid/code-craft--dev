import { asyncHandler } from "../../utils/async-Handeller.js";

import { checkEnrollemnt } from "../../utils/checkUserEnrollement.js";
import reviewModel from "../../../DB/models/review-model.js";
import { checkCourseExists } from "../../utils/checkCourseExistence.js";

export const addReview = asyncHandler(async (req, res, next) => {
  const { _id: userId } = req.authUser;
  const { courseId } = req.params;
  const { reviewRate, reviewComment } = req.body;

  const isEnrolled = await checkEnrollemnt(userId, courseId);

  if (isEnrolled.cause) {
    return next({ message: isEnrolled.message, cause: isEnrolled.cause });
  }

  // Check if the user has already reviewed this course
  const existingReview = await reviewModel.findOne({
    userId,
    courseId,
  });

  if (existingReview) {
    // Update existing review
    existingReview.reviewRate = reviewRate;
    existingReview.reviewComment = reviewComment
      ? reviewComment
      : (existingReview.reviewComment = undefined);
    await existingReview.save();

    return res.status(200).json({
      success: true,
      message: "Review updated successfully",
      review: existingReview,
    });
  }

  const reviewDoc = await reviewModel.create({
    userId,
    courseId,
    reviewRate,
    reviewComment,
  });
  req.savedDocuments = { model: reviewModel, _id: reviewDoc._id };
  if (!reviewDoc) {
    return next({ message: "Fail to review", cause: 500 });
  }

  res.status(201).json({
    success: true,
    message: "Review added successfully",
    reviewDoc,
  });
});

// Remove comment
export const removeComment = asyncHandler(async (req, res, next) => {
  const { reviewId } = req.params;

  const review = await reviewModel.findById(reviewId);

  if (!review) {
    return next({ message: "review not found", cause: 404 });
  }

  review.reviewComment = undefined;

  await review.save();

  return res.status(200).json({
    success: true,
    message: "Comment removed successfully",
    review,
  });
});

export const courseReviews = asyncHandler(async (req, res, next) => {
  const { courseId } = req.params;
  const userId = req.authUser._id;
  console.log(courseId);
  const course = await checkCourseExists(courseId);

  if (course.status) {
    return next({ message: course.message, cause: course.status });
  }

  const reviews = await reviewModel
    .find({ courseId })
    .populate({ path: "userId", select: "firstName lastName profile_pic" });

  if (!reviews) {
    return next({ message: "no reviews found fot this course", cause: 404 });
  }

  let userReview = undefined;
  for (const review of reviews) {
    if (review.userId._id.toString() == userId.toString()) {
      userReview = review;
      break;
    }
  }
  return res.status(200).json({
    success: true,
    reviews,
    userReview,
  });
});
