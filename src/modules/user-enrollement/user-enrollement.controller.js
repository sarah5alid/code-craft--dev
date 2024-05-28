import { Enrollment } from "../../../DB/models/course-enrollement.js";
import { APIFeatures } from "../../utils/api-features.js";
import { asyncHandler } from "../../utils/async-Handeller.js";

export const userCourses = asyncHandler(async (req, res, next) => {
  const { userId: _id } = req.authUser;
  const features = new APIFeatures(
    req.query,
    Enrollment.find().populate([
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
