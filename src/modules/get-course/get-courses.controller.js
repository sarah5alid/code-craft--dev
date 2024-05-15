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
  })
    .select(
      "courseName desc level prerequisites courseDuration rate numOfVideos appliedPrice image"
    )
    .populate([
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
  const userId = req.authUser._id;

  // Retrieve the user's recently viewed courses and populate the course details
  const user = await userModel
    .findById(userId)
    .populate({
      path: "recentlyViewedCourses",
      select:
        "courseName desc level prerequisites courseDuration rate numOfVideos appliedPrice image",
    });

  if (!user || user.recentlyViewedCourses.length == 0) {
    return res
      .status(404)
      .json({ error: "User not found or you have not view courses yet" });
  }

  const recentlyViewedCourses = user.recentlyViewedCourses;

  return res.status(200).json({ success: true, recentlyViewedCourses });
};



export const getAllCourses = asyncHandler(async (req, res, next) => {
  const features = new APIFeatures(req.query, Course.find());

  features.filter().fields().sort().search();

  const courses = await features.mongooseQuery;

  if (courses.length == 0) {
    return next(new Error("No courses found!", { cause: 404 }));
  }

  //const pageNumber = features.pageNumber;
  const coursesNum = courses.length;
  return res.status(200).json({ success: true, courses, coursesNum });
});