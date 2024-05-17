import { Category } from "../../../DB/models/category-model.js";
import { CourseContent } from "../../../DB/models/course-content-model.js";
import { Course } from "../../../DB/models/course-model.js";
import { asyncHandler } from "../../utils/async-Handeller.js";
import cloudinary from "../../utils/cloudinary.js";
import slugify from "slugify";
import userModel from "../../../DB/models/user-model.js";

export const uploadCourseInfo = asyncHandler(async (req, res, next) => {
  const { name, desc, level, prerequisites, discount, basePrice } = req.body;
  const { categoryId } = req.params; //ASK
  const addedBy = req.authUser._id;

  //check category

  const checkcategory = await Category.findById(categoryId);
  if (!checkcategory)
    return next(new Error("category not found", { cause: 404 }));

  //name check

  const nameCheck = await Course.findOne({ courseName: name });

  if (nameCheck) {
    return next(
      new Error("course found with this name, please enter new one", {
        cause: 400,
      })
    );
  }

  //generate slug

  const slug = slugify(name, { lower: true, replacement: "-" });

  // if discount

  const appliedPrice = basePrice - basePrice * ((discount || 0) / 100);

  const CourseInfo = {
    courseName: name,
    slug,
    desc,
    level,
    prerequisites,
    basePrice,
    appliedPrice,

    categoryId,
    addedBy,
  };

  const newCourse = await Course.create(CourseInfo);
  req.savedDocuments = { model: Course, _id: newCourse._id };
  checkcategory.courses.push(newCourse._id);
  await checkcategory.save();

  const changeRole = await userModel.findById(addedBy);
  if (changeRole.role == "user") {
    changeRole.role = "instructor";
    await changeRole.save();
  }

  changeRole.coursesUploaded.push(newCourse._id);
  await changeRole.save();
  //files

  if (!req.file) return next({ cause: 400, message: "Image is required" });

  //upload image on cloudinary
  const { public_id, secure_url } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `${process.env.CLOUD_FOLDER_NAME}/Categories/${checkcategory._id}/${addedBy}/${newCourse._id}/Images`,
      resource_type: "image",
    }
  );

  req.folder = `${process.env.CLOUD_FOLDER_NAME}/Categories/${checkcategory._id}/${addedBy}/${newCourse._id}/Images`;
  newCourse.image.id = public_id;
  newCourse.image.url = secure_url;
  await newCourse.save();

  return res.status(200).json({
    success: true,
    message: "Course Information added successfully",
    data: newCourse,
  });
});

//===================update

export const updateCourseInfo = async (req, res, next) => {
  const { name, desc, level, prerequisites, discount, basePrice, oldPublicId } =
    req.body;

  const updatedBy = req.authUser._id;

  if (name) {
    if (name == req.checkCourse.courseName) {
      return next({
        cause: 400,
        message: "Please enter different course name from the existing one.",
      });
    }

    const isNameDuplicated = await Course.findOne({ courseName: name });
    if (isNameDuplicated) {
      return next({ cause: 409, message: "Course name is already exist" });
    }

    req.checkCourse.courseName = name;
    req.checkCourse.slug = slugify(name, "-");

    await req.checkCourse.save();

    console.log(req.checkCourse.courseName);
  }

  req.checkCourse.desc = desc ? desc : req.checkCourse.desc;
  req.checkCourse.level = level ? level : req.checkCourse.level;
  req.checkCourse.prerequisites = prerequisites
    ? prerequisites
    : req.checkCourse.prerequisites;
  req.checkCourse.basePrice = basePrice ? basePrice : req.checkCourse.basePrice;

  const appliedPrice = basePrice - basePrice * ((discount || 0) / 100);
  req.checkCourse.appliedPrice = appliedPrice
    ? appliedPrice
    : req.checkCourse.appliedPrice;

  req.checkCourse.isApproved = false;

  await req.checkCourse.save();

  if (oldPublicId) {
    if (!req.file) return next({ cause: 400, message: "Image is required" });

    const newPulicId = oldPublicId.split("Images/")[1];

    const { secure_url } = await cloudinary().uploader.upload(req.file.path, {
      folder: `${process.env.CLOUD_FOLDER_NAME}/Categories/${req.checkCourse.categoryId}/${addedBy}/${req.checkCourse._id}/Images`,

      public_id: newPulicId,
    });
    req.checkCourse.image.url = secure_url;
    req.checkCourse.image.id = newPulicId;
    await req.checkCourse.save();
  }

  req.checkCourse.updatedBy = updatedBy;

  await req.checkCourse.save();

  res.status(200).json({
    success: true,
    message:
      "Course information Updated Successfully, please contact our support to review the course",
    data: req.checkCourse,
  });
};
//=============================delete course===============

// export const deleteCourse = asyncHandler(async (req, res, next) => {
//   const { courseId } = req.params;

//   const checkCourse = await Course.findById(courseId);

//   if (!checkCourse)
//     return next(
//       new Error("course you try to delete not found", { cause: 404 })
//     );

//   if (
//     req.authuser._id.toString() !== checkCourse.addedBy.toString() ||
//     req.authuser._id.toString() !== systemRoles.SUPER_ADMIN
//   ) {
//     return next(
//       new Error("you are not Authorized to delete this course", {
//         cause: 400,
//       })
//     );
//   }

//   const deletedCourse = await Course.findByIdAndDelete(courseId);

//   if (!deletedCourse)
//     return next(new Error("error while deleting"), { cause: 500 });
//   //ASK

//   await CourseContent.deleteMany({ course: courseId });

//   return res.status(204).json({ success: true, message: "Course deleted !" });
// });
