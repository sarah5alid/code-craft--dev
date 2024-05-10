/**  
 
 
 *get enrolled
  *get in progress


 */

import { Course } from "../../../DB/models/course-model.js";
import userModel from "../../../DB/models/user-model.js";
import { APIFeatures } from "../../utils/api-features.js";
import { asyncHandler } from "../../utils/async-Handeller.js";

export const getCoursePreview = asyncHandler(async (req, res, next) => {
  const { courseId } = req.params;
  const course = await Course.findOne({
    _id: courseId,
    isApproved: true,
  }).populate([
    {
      path: "vidoes",
      select: "title",
    },
    { path: "addedBy", select: "firstName lastName" },
  ]);

  if (!course) return next(new Error("course not found", { cause: 404 }));

  return res.status(200).json({ success: true, course: course });
});

export const updateRecentlyViewedCourses = asyncHandler(
  async (req, res, next) => {
    const courseId = req.params.courseId; // Assuming courseId is part of the request parameters
    const userId = req.authUser._id; // Assuming you have the authenticated user stored in req.authUser

    // Update the user's recently viewed courses
    const user = await userModel.findByIdAndUpdate(userId, {
      $addToSet: { recentlyViewedCourses: courseId },
      new: true,
    });

    console.log(user);
  }
);

export const getRecentlyViewedCourses = async (req, res, next) => {
  const  userId  = req.authUser._id;

  // Retrieve the user's recently viewed courses and populate the course details
  const user = await userModel
    .findById(userId)
    .populate("recentlyViewedCourses");

  if (!user || user.recentlyViewedCourses.length == 0) {
    return res
      .status(404)
      .json({ error: "User not found or you have not view courses yet" });
  }

  const recentlyViewedCourses = user.recentlyViewedCourses;

  return res.status(200).json({ success: true, recentlyViewedCourses });
};

export const getInstructorCourses = asyncHandler(async (req, res, next) => {
  const instructor = req.authUser._id;

  const courses = await Course.find({
    addedBy: instructor,
    isApproved: true,
  }).populate({
    path: "vidoes",
    select: "title video.url",
  });

  if (!courses || courses.length === 0) {
    return next(new Error("No uploaded courses found"));
  }

  return res.status(200).json({ success: true, courses: courses });
});

//filters for users

export const getAllCoursesByUsers = asyncHandler(async (req, res, next) => {
  /**?
   * it returns only approved courses
   * sort courses desc by date created
   * search by course name or desc
   * paginate 4 courses in page
   */
  const features = new APIFeatures(
    req.query,
    Course.find({ isApproved: true }).populate([
      { path: "vidoes", select: "title" },
      { path: "addedBy", select: "firstName lastName" },
    ])
  );

  features.pagination().sort().filter().search(); // Chain APIFeatures methods

  const courses = await features.mongooseQuery;

  if (!courses || courses.length === 0) {
    return next(new Error("No courses found!", { cause: 404 }));
  }

  const pageNumber = features.pageNumber;

  return res.status(200).json({ success: true, pageNumber, courses });
});
