import { Enrollment } from "../../../DB/models/course-enrollement-model.js";
import { Course } from "../../../DB/models/course-model.js";
import { APIFeatures } from "../../utils/api-features.js";
import { asyncHandler } from "../../utils/async-Handeller.js";

export const userCourses = asyncHandler(async (req, res, next) => {
  const { userId: _id } = req.authUser;
  const features = new APIFeatures(
    req.query,
    Enrollment.find({ user: userId }).populate([
      {
        path: "course",
        select: "-vidoes",
        populate: [
          { path: "addedBy", select: "firstName lastName" },
          { path: "categoryId", select: "name " },
        ],
      },
    ])
  );

  features.filter().sort().search().pagination().fields();

  const courses = await features.mongooseQuery;

  if (courses.length == 0) {
    return next(
      new Error("You are not enrolled in courses yet!", { cause: 404 })
    );
  }
  const coursesNum = courses.length;
  return res.status(200).json({ success: true, courses, coursesNum });
});

export const markVideoCompleted = asyncHandler(async (req, res, next) => {
  const { courseId, videoId } = req.params;

  const userId = req.authUser._id;

  const courseEnrolled = await Enrollment.findOne({
    user: userId,
    course: courseId,
  });
  if (!courseEnrolled) {
    return next({ message: "course not found", cause: 409 });
  }

  if (!courseEnrolled.lessons.includes(videoId)) {
    courseEnrolled.lessons.push(videoId);

    //calculate progress
    const course = await Course.findById(courseId);
    const numOfVideos = course.numOfVideos;
    courseEnrolled.progress =
      (courseEnrolled.lessons.length / numOfVideos) * 100;

    if (courseEnrolled.lessons.length === numOfVideos) {
      courseEnrolled.status = "Completed";
    } else {
      courseEnrolled.status = "In Progress";
    }

    await courseEnrolled.save();
  }

  return res.json({
    success: true,
    message: "progress Tracked successfully",
    courseEnrolled,
  });
});
