/**?
 * approve course
 * disApprove course
 * get all courses (name, instructorName, enrolled in user number, status) =>filter with status ,number of enrolled , instructor
 * get all users (name, status , uploaded courses number, enrolled in )
 
 */

import { Course } from "../../../DB/models/course-model.js";
import userModel from "../../../DB/models/user-model.js";
import { APIFeatures } from "../../utils/api-features.js";
import { asyncHandler } from "../../utils/async-Handeller.js";

//================1)approve==================================
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

//===================2)disApprove================================

export const disApproveCourse = asyncHandler(async (req, res, next) => {
  const { courseId } = req.params;

  const course = await Course.findById(courseId);
  if (!course) return next(new Error("course not found", { cause: 404 }));
  if (course.isApproved == false)
    return next({ message: "course already disapproved", cause: 409 });

  course.isApproved = false;
  await course.save();

  return res
    .status(200)
    .json({ success: true, message: "course approved", course: course });
});

//==================3)get all users

export const getAllUsers = asyncHandler(async (req, res, next) => {
  const features = new APIFeatures(
    req.query,
    userModel.find({ isDeleted: false })
  );

  features.filter().fields().sort().pagination().search();

  const users = await features.mongooseQuery;
  console.log(users);
  if (users.length == 0) {
    return next(new Error("No users found!", { cause: 404 }));
  }
  const usersNum = users.length;

  //const pageNumber = features.pageNumber;

  return res.status(200).json({ success: true, users, usersNum });
});

//=======================5)============

export const pinUser = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  console.log(userId);
  const userRole = await userModel.findById(userId);

  if (userRole == "superAdmin") {
    return next(new Error("you cannot pin this user"));
  }

  const user = await userModel.findByIdAndUpdate(
    userId,
    { isPinned: true, isActive: false },
    { new: true }
  );

  if (!user) {
    return next(new Error("User you try to pin not found"));
  }

  return res.status(200).json({ success: true, message: "user pinned" });
});

//=======================6)============

export const unPinUser = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  const user = await userModel.findByIdAndUpdate(
    userId,
    { isPinned: false, isActive: true },
    { new: true }
  );

  if (!user) {
    return next(new Error("User you try to unpin not found"));
  }

  return res.status(200).json({ success: true, message: "user unpinned" });
});
