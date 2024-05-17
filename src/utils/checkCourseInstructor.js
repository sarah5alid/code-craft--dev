import { asyncHandler } from "./async-Handeller.js";
import { checkCourseExists } from "./checkCourseExistence.js";

export const checkCourseInstructor = () => {
  return asyncHandler(async (req, res, next) => {
    const { courseId } = req.params;
    const addedBy = req.authUser._id;

    const checkCourse = await checkCourseExists(courseId);
    if (checkCourse.status) {
      return next({ message: checkCourse.message, cause: checkCourse.cause });
    }

    if (addedBy.toString() !== checkCourse.addedBy.toString()) {
      return next(
        new Error("you are not Authorized ", {
          cause: 400,
        })
      );
    }

    req.checkCourse = checkCourse;
    next();
  });
};
