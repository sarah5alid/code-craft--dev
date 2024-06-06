import { Enrollment } from "../../../DB/models/course-enrollement-model.js";
import { Course } from "../../../DB/models/course-model.js";
import { APIFeatures } from "../../utils/api-features.js";
import { asyncHandler } from "../../utils/async-Handeller.js";
import { checkCourseExists } from "../../utils/checkCourseExistence.js";
import { checkEnrollemnt } from "../../utils/checkUserEnrollement.js";

export const userCourses = asyncHandler(async (req, res, next) => {
  const { _id: userId } = req.authUser;
  const features = new APIFeatures(
    req.query,
    courseEnrolled.find({ user: userId }).populate([
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
  const enrolledCourseIds = courses.map(
    (courseEnrolled) => courseEnrolled.course._id
  );
  const categoryIds = courses.map(
    (courseEnrolled) => courseEnrolled.course.categoryId._id
  );
  const instructorIds = courses.map(
    (courseEnrolled) => courseEnrolled.course.addedBy._id
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

  const course = await checkCourseExists(courseId);
  if (course.status) {
    return next({
      message: course.message,
      cause: course.cause,
    });
  }

  const courseEnrolled = await checkEnrollemnt(userId, course._id);

  if (courseEnrolled.cause) {
    return next({
      message: courseEnrolled.message,
      cause: courseEnrolled.cause,
    });
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

  const course = await checkCourseExists(courseId);
  if (course.status) {
    return next({
      message: course.message,
      cause: course.cause,
    });
  }

  const courseEnrolled = await checkEnrollemnt(userId, course._id);

  if (courseEnrolled.cause) {
    return next({
      message: courseEnrolled.message,
      cause: courseEnrolled.cause,
    });
  }

  return res.json({
    success: true,
    courseEnrolled,
  });
});

//==========================Enroll for free===================

export const freeCourseEnroll = asyncHandler(async (req, res, next) => {
  const userId = req.authUser._id;

  const { courseId } = req.params;

  const course = await checkCourseExists(courseId);
  if (course.status) {
    return next({
      message: course.message,
      cause: course.cause,
    });
  }

  const courseEnrolled = await checkEnrollemnt(userId, course._id);
  console.log(courseEnrolled);

  if (!courseEnrolled.cause) {
    return next({
      message: "You already enrolled",
      cause: 400,
    });
  }
  if (course.appliedPrice !== 0) {
    return next({
      message: "You cannot being enrolled",
      cause: 409,
    });
  }

  const newEnroll = await Enrollment.create({ user: userId, course: courseId });

  req.savedDocuments = { model: Enrollment, _id: newEnroll._id };

  if (!newEnroll) {
    return next({ message: "Error while enrollment", cause: 409 });
  }
  return res.json({
    success: true,
    message: "You enrolled in this course",
    newEnroll,
  });
});
