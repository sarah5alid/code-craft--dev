import { Enrollment } from "../../../DB/models/course-enrollement-model.js";
import { Course } from "../../../DB/models/course-model.js";
import userModel from "../../../DB/models/user-model.js";
import { APIFeatures } from "../../utils/api-features.js";
import { asyncHandler } from "../../utils/async-Handeller.js";

export const getCoursePreview = asyncHandler(async (req, res, next) => {
  const { courseId } = req.params;
  const userId = req.authUser._id;
  const course = await Course.findOne({
    _id: courseId,
    isApproved: true,
  }).populate([
    { path: "vidoes", select: "title video.url order " },
    { path: "addedBy", select: "firstName lastName" },
    { path: "categoryId", select: "name" },
  ]);
  let courseObject = course.toObject();

  // Create a new array to store processed vidoes
  if (courseObject.vidoes) {
    courseObject.vidoes = courseObject.vidoes.map((video) => {
      if (video.order === 1) {
        return { title: video.title, url: video.video.url };
      }
      return { title: video.title };
    });
  }

  console.log(courseObject);
  if (!course) return next(new Error("course not found", { cause: 404 }));

  let isEnrolled = false;
  const enrolled = await Enrollment.findOne({ user: userId, course: courseId });

  if (enrolled) isEnrolled = true;

  return res
    .status(200)
    .json({ success: true, course: courseObject, isEnrolled });
});

export const updateRecentlyViewedCourses = asyncHandler(
  async (req, res, next) => {
    const courseId = req.params.courseId;
    const userId = req.authUser._id;

    // Update the user's recently viewed courses
    const user = await userModel.findByIdAndUpdate(userId, {
      $addToSet: { recentlyViewedCourses: courseId },
      new: true,
    });

    return res.status(200).json({ success: true });
  }
);

export const getRecentlyViewedCourses = async (req, res, next) => {
  const userId = req.authUser._id;

  // Retrieve the user's recently viewed courses and populate the course details
  const user = await userModel.findById(userId).populate([
    {
      path: "recentlyViewedCourses",
      select: "-vidoes",
      populate: [
        { path: "addedBy", select: "firstName lastName" },
        { path: "categoryId", select: "name " },
      ],
    },
  ]);

  if (!user || user.recentlyViewedCourses.length == 0) {
    return res
      .status(404)
      .json({ error: "User not found or you have not view courses yet" });
  }

  const recentlyViewedCourses = user.recentlyViewedCourses;

  return res.status(200).json({ success: true, recentlyViewedCourses });
};

export const getAllCourses = asyncHandler(async (req, res, next) => {
  const { categories, rating, level, price, isApproved, keyword } = req.query;

  const filter = {};

  const splitCategories =
    categories && decodeURIComponent(categories).split(",");
  if (Array.isArray(splitCategories) && splitCategories.length) {
    filter.categoryId = {
      $in: splitCategories,
    };
  }

  const splitLevel = level && decodeURIComponent(level).split(",");
  if (Array.isArray(splitLevel) && splitLevel.length) {
    filter.level = {
      $in: splitLevel,
    };
  }

  if (typeof isApproved === "boolean") {
    filter.isApproved = isApproved;
  }

  if (typeof price === "string" && price.length) {
    const [start, end] = price.split(":").map((v) => Number(v));
    if (start >= 0 && end) filter.basePrice = { $gte: start, $lte: end };
    else if (start >= 0) filter.basePrice = { $gte: start, $lte: start + 1 };
  }

  const nRating = Number(rating);
  if (Number.isNaN(nRating) === false && nRating > 0) {
    filter.rating = nRating;
  }

  if (typeof keyword === "string" && keyword.length) {
    filter.courseName = { $regex: decodeURIComponent(keyword), $options: "i" };
  }

  const features = new APIFeatures(req.query, Course.find(filter));

  features.fields().sort().pagination();
  const courses = await features.mongooseQuery;

  if (courses.length == 0) {
    return res.status(200).json({
      success: true,
      coursesWithEnrollment: [],
      coursesNum: 0,
      top10Courses: [],
    });
  }

  const iDs = courses.map((course) => course._id);

  const enrollments = await Enrollment.find({ course: { $in: iDs } });

  const enrollmentMap = iDs.reduce((map, id) => {
    map[id] = { enrolled: 0, completed: 0 };
    return map;
  }, {});

  enrollments.forEach((enrollment) => {
    if (enrollmentMap[enrollment.course]) {
      enrollmentMap[enrollment.course].enrolled += 1;
      if (enrollment.status === "Completed") {
        enrollmentMap[enrollment.course].completed += 1;
      }
    }
  });

  const coursesWithEnrollment = courses.map((course) => ({
    ...course.toObject(),
    enrolledUsers: enrollmentMap[course._id].enrolled,
    completedUsers: enrollmentMap[course._id].completed,
  }));

  const filteredCourses = coursesWithEnrollment.filter(
    (course) => course.enrolledUsers > 0
  );

  const sortedCoursesByEnrolled = filteredCourses.sort(
    (a, b) => b.enrolledUsers - a.enrolledUsers
  );

  // Get the top 10 courses
  const top10Courses = sortedCoursesByEnrolled.slice(0, 10);

  const coursesNum = courses.length;
  return res.status(200).json({
    success: true,
    coursesWithEnrollment,
    coursesNum,
    top10Courses,
  });
});
