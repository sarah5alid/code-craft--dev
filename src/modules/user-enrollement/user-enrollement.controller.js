import { Enrollment } from "../../../DB/models/course-enrollement-model.js";
import { Course } from "../../../DB/models/course-model.js";
import { APIFeatures } from "../../utils/api-features.js";
import { asyncHandler } from "../../utils/async-Handeller.js";

export const userCourses = asyncHandler(async (req, res, next) => {
  const { _id: userId } = req.authUser;
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

  // Extract course IDs, category IDs, and instructor IDs from the user's enrolled courses
  const enrolledCourseIds = courses.map((enrollment) => enrollment.course._id);
  const categoryIds = courses.map(
    (enrollment) => enrollment.course.categoryId._id
  );
  const instructorIds = courses.map(
    (enrollment) => enrollment.course.addedBy._id
  );

  // Fetch recommended courses based on user interests (categories) excluding already enrolled courses
  const recommendedByCategory = await Course.find({
    _id: { $nin: enrolledCourseIds },
    categoryId: { $in: categoryIds },
  })
    .select("-vidoes")
    .populate([
      { path: "addedBy", select: "firstName lastName" },
      { path: "categoryId", select: "name" },
    ]);

  // Fetch recommended courses based on instructors excluding already enrolled courses
  const recommendedByInstructor = await Course.find({
    _id: { $nin: enrolledCourseIds },
    addedBy: { $in: instructorIds },
  })
    .select("-vidoes")
    .populate([
      { path: "addedBy", select: "firstName lastName" },
      { path: "categoryId", select: "name" },
    ]);

  // Combine the recommended courses and remove duplicates
  const recommendedCourses = [
    ...recommendedByCategory,
    ...recommendedByInstructor,
  ];
  const uniqueRecommendedCourses = recommendedCourses.filter(
    (course, index, self) =>
      index ===
      self.findIndex((c) => c._id.toString() === course._id.toString())
  );
  const top10UniqueRecommendedCourses = uniqueRecommendedCourses.slice(0, 10);
  const recommendedNum = top10UniqueRecommendedCourses.length;

  const coursesNum = courses.length;
  return res.status(200).json({
    success: true,
    courses,
    top10UniqueRecommendedCourses,
    recommendedNum,
    coursesNum,
  });
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

export const getCourseProgress = asyncHandler(async (req, res, next) => {
  const { courseId } = req.params;
  const userId = req.authUser._id;

  const courseEnrolled = await Enrollment.findOne({
    user: userId,
    course: courseId,
  }).po;

  if (!courseEnrolled) {
    return next({ message: "course not found", cause: 409 });
  }

  return res.json({
    success: true,
    courseEnrolled,
  });
});
