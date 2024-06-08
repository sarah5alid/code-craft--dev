import { Category } from "../../../DB/models/category-model.js";
import { CourseContent } from "../../../DB/models/course-content-model.js";
import { Course } from "../../../DB/models/course-model.js";
import { asyncHandler } from "../../utils/async-Handeller.js";
import cloudinary from "../../utils/cloudinary.js";
import slugify from "slugify";
import userModel from "../../../DB/models/user-model.js";
import { APIFeatures } from "../../utils/api-features.js";

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
export const updateCourseInfo = asyncHandler(async (req, res, next) => {
  const { name, desc, level, prerequisites, discount, basePrice, oldPublicId } =
    req.body;
  const updatedBy = req.authUser._id;

  // Check if a different course name is provided
  if (name && name !== req.checkCourse.courseName) {
    const isNameDuplicated = await Course.findOne({ courseName: name });
    if (isNameDuplicated) {
      return next({ cause: 409, message: "Course name already exists" });
    }
  }

  // Initialize edits object if it doesn't exist
  req.checkCourse.edits = req.checkCourse.edits || {};

  let fileData = {};
  if (oldPublicId) {
    if (!req.file) {
      return next({ cause: 400, message: "Image is required" });
    }
    const newPublicId = req.checkCourse.image.id.split(`Images/`)[1]
    const { secure_url} = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: `${process.env.CLOUD_FOLDER_NAME}/Categories/${req.checkCourse.categoryId}/${req.authUser._id}/${req.checkCourse._id}/Images/edits`,
        public_id:newPublicId
      }
    );
    fileData.url = secure_url;
    fileData.id = newPublicId

    console.log(fileData); // Log fileData with its values
  }

  // Store the edits in the edits field
  req.checkCourse.edits = {
    courseName: name || req.checkCourse.courseName,
    desc: desc || req.checkCourse.desc,
    slug: name ? slugify(name, "-") : req.checkCourse.slug,
    level: level || req.checkCourse.level,
    image: fileData.url ? { ...fileData } : req.checkCourse.edits.image,
    prerequisites: prerequisites || req.checkCourse.prerequisites,
    basePrice: basePrice || req.checkCourse.basePrice,
    discount: discount || req.checkCourse.discount,
    appliedPrice: basePrice
      ? basePrice - basePrice * ((discount || 0) / 100)
      : req.checkCourse.appliedPrice,
    updatedBy: updatedBy,
  };

  // Retain remaining fields from req.checkCourse to edits object
  const remainingFields = [
    "numOfVideos",
    "rate",
    "courseDuration",
    "isDeleted",
    "vidoes",
    "addedBy",
    "categoryId",
  ];
  remainingFields.forEach((field) => {
    req.checkCourse.edits[field] = req.checkCourse[field];
  });

  // Clear the edits object if no changes were made
  if (Object.keys(req.checkCourse.edits).length === 0) {
    req.checkCourse.edits = null;
  }
  

  await req.checkCourse.save();

  res.status(200).json({
    success: true,
    message:
      "Course information updated successfully, please contact our support to review the course",
    data: req.checkCourse,
  });
});

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

//========================================get all courses for category============

export const categoryCourses = asyncHandler(async (req, res, next) => {
  const categoryId = req.params;

  const features = new APIFeatures(
    req.query,
    Course.find(categoryId)
      .select("-vidoes")
      .populate([
        { path: "addedBy", select: "firstName lastName" },
        { path: "categoryId", select: "name " },
      ])
  );

  features.filter().fields().sort().search().pagination();

  const courses = await features.mongooseQuery;

  if (courses.length == 0) {
    return next(new Error("No courses found!", { cause: 404 }));
  }

  //const pageNumber = features.pageNumber;
  const coursesNum = courses.length;
  return res.status(200).json({ success: true, courses, coursesNum });
});
