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
  if (!course) {
    return next(new Error("Course not found", { cause: 404 }));
  }

  if (
    course.edits &&
    Object.keys(course.edits).some((key) => course.edits[key] !== null)
  ) {
    console.log(course.edits);
    const { _id, id, ...edits } = course.edits;

    const newCourse = await Course.findByIdAndUpdate(
      { _id: courseId },
      { edits, edits: null },
      { new: true }
    );

    // Clear the edits field properly
    course.edits = {};

    console.log(course.edits);
    console.log({ course: newCourse });

    return res
      .status(200)
      .json({ success: true, message: "Course approved", course: newCourse });
  } else {
    if (course.isApproved) {
      return next({ cause: 400, message: "Course is already approved" });
    }
  }

  course.isApproved = true;

  await course.save();

  return res
    .status(200)
    .json({ success: true, message: "Course approved", course: course });
});

//===================2)disApprove================================

export const disApproveCourse = asyncHandler(async (req, res, next) => {
  const { courseId } = req.params;

  const course = await Course.findById(courseId);
  if (!course) return next({ message: "course not found", cause: 404 });
  if (course.isApproved == false)
    return next({ message: "Course already disapproved", cause: 409 });
  if (
    course.edits &&
    Object.keys(course.edits).some((key) => course.edits[key] !== null)
  ) {
    course.edits.isApproved = false;
  }
  course.isApproved = false;
  await course.save();

  return res
    .status(200)
    .json({ success: true, message: "course disapproved", course: course });
});

//==================3)get all users

export const getUsersStats = asyncHandler(async (req, res, next) => {
  return res
    .status(200)
    .json({
      success: true,
      stats: {
        total: await userModel.find().count(),
        active: await userModel.find({ isActive: true }).count(),
        deactivated: await userModel.find({ isDeleted: true }).count(),
        banned: await userModel.find({ isBanned: true }).count(),
      }
    });
});


export const getAllUsers = asyncHandler(async (req, res, next) => {
  const features = new APIFeatures(
    req.query,
    userModel.find()
  );

  features.filter().fields().sort().pagination().search();

  const users = await features.mongooseQuery;

  if (users.length == 0) {
    return next({ success: true, users});
  }
  const usersNum = users.length;

  return res.status(200).json({ success: true, users, usersNum });
});

//=======================5)============

export const banUser = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  console.log(userId);
  const user = await userModel.findById(userId);

  if (!user) {
    return next({ message: "User you try to ban not found", cause: 404 });
  }

  if (user.role == "superAdmin" || user.isBanned == true) {
    return next({ message: "You cannot ban this user", cause: 409 });
  }

  user.isBanned = true;
  user.isActive = false;
  await user.save();

  return res.status(200).json({ success: true, message: "User Banned", user });
});

//=======================6)============

export const unBanUser = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  const user = await userModel.findById(userId);

  if (!user) {
    return next({ message: "User you try to unban not found", cause: 404 });
  }

  if (user.isBanned == false) {
    return next({ message: "You cannot unban this user", cause: 409 });
  }

  user.isBanned = false;
  user.isActive = true;
  await user.save();

  return res
    .status(200)
    .json({ success: true, message: "User Unbanned", user });
});
