import { asyncHandler } from "./async-Handeller.js";
import { checkCourseExists } from "./checkCourseExistence.js";
import { checkEnrollemnt } from "./checkUserEnrollement.js";

export const accessVideo = () => {
  return asyncHandler(async (req, res, next) => {
    const { courseId } = req.params;

    if (!req.authUser) {
      return res.status(401).json({ message: "Not authorized" });
    }
    const course = await checkCourseExists(courseId);
    if (course.status) {
      return next({ message: course.message, cause: course.cause });
    }

    // Allow super admins and course instructors
    if (
      req.authUser.role === "superAdmin" ||
      req.authUser._id.toString() === course.addedBy.toString()
    ) {
      return next();
    }

    const enrollment = await checkEnrollemnt(req.authUser._id, course._id);
    if (enrollment) {
      return next();
    } else {
      return next({ message: "Access denied", cause: 403 });
    }
  });
};
