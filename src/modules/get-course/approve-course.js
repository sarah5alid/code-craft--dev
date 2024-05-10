import { Course } from "../../../DB/models/course-model.js";
import { APIFeatures } from "../../utils/api-features.js";
import { asyncHandler } from "../../utils/async-Handeller.js";

export const getNon_ApprovedCoursesby_Admins = asyncHandler(
  async (req, res, next) => {
    const query = req.query;
    const features = new APIFeatures(
      query,
      Course.find({ isApproved: false }).populate([
        {
          path: "vidoes",
          select: "title video.url duration",
        },
        { path: "addedBy", select: "firstName lastName" },
      ])
    );

    features.pagination().sort().filter().search().fields(); // Chain APIFeatures methods

    const courses = await features.mongooseQuery;

    if (!courses || courses.length === 0) {
      return next(new Error("No courses found!", { cause: 404 }));
    }

    const pageNumber = features.pageNumber;

    return res.status(200).json({ success: true, pageNumber, courses });
  }
);

export const approveCourse = asyncHandler(async (req, res, next) => {
  const { courseId } = req.params;

  const course = await Course.findById(courseId);
  if (!course) return next(new Error("course not found", { cause: 404 }));
  if (course.isApproved == true)
    return next({ message: "course already approved", cause: 400 });

  course.isApproved = true;
  await course.save();

  return res
    .status(200)
    .json({ success: true, message: "course approved", course: course });
});
