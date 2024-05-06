import { Category } from "../../../DB/models/category-model.js";
import { CourseContent } from "../../../DB/models/course-content-model.js";
import { Course } from "../../../DB/models/course-model.js";
import { asyncHandler } from "../../utils/async-Handeller.js";
import cloudinary from "../../utils/cloudinary.js";
import slugify from "slugify";
import generateUniqurString from "../../utils/generate-unique-string.js";
import userModel from "../../../DB/models/user-model.js";
export const uploadCourseInfo = asyncHandler(async (req, res, next) => {
  const { name, desc, level, prerequisites, discount, basePrice } = req.body;
  const { categoryId } = req.query; //ASK
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
  //files

  if (!req.file) return next({ cause: 400, message: "Image is required" });

  const folderId = generateUniqurString(4);

  //upload image on cloudinary
  const { public_id, secure_url } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `${process.env.CLOUD_FOLDER_NAME}/Categories/${checkcategory._id}/${addedBy}/${folderId}`,
      resource_type: "image",
    }
  );

  req.folder = `${process.env.CLOUD_FOLDER_NAME}/Categories/${checkcategory._id}/${addedBy}/${folderId}`;

  const CourseInfo = {
    courseName: name,
    slug,
    desc,
    level,
    prerequisites,
    basePrice,
    appliedPrice,
    image: { id: public_id, url: secure_url },
    folderId,
    categoryId,
    addedBy,
  };

  const newCourse = await Course.create(CourseInfo);

  checkcategory.courses.push(newCourse._id);
  await checkcategory.save();

  const changeRole = await userModel.findById(addedBy);
  if (changeRole.role == "user") {
    changeRole.role = "instructor";
    await changeRole.save();
  }

  return res.status(200).json({
    success: true,
    message: "Course Information added successfully",
    data: newCourse,
  });
});

//===================update

export const updateCourseInfo = async (req, res, next) => {
  // 1- destructuring the request body
  const { name, desc, level, prerequisites, basePrice, oldPublicId } = req.body;
  // 2- destructuring the request params
  const { courseId } = req.params;
  // 3- destructuring _id from the request authUser
  const updatedBy = req.authUser._id;

  // 4- check if the course is exist bu using courseId
  const course = await Course.findById(courseId);
  if (!course) return next({ cause: 404, message: "Course not found" });

  //authorization

  if (req.authUser._id.toString() !== course.addedBy.toString())
    return next(new Error("you are not authorized to update this course"));

  // 5- check if the use want to update the name field
  if (name) {
    // 5.1 check if the new course name different from the old name
    if (name == course.name) {
      return next({
        cause: 400,
        message: "Please enter different course name from the existing one.",
      });
    }

    // 5.2 check if the new course name is already exist
    const isNameDuplicated = await Course.findOne({ name });
    if (isNameDuplicated) {
      return next({ cause: 409, message: "Course name is already exist" });
    }

    // 5.3 update the course name and the course slug
    course.courseName = name;
    course.slug = slugify(name, "-");
  }

  course.desc = desc ? desc : course.desc;
  course.level = level ? level : course.level;
  course.prerequisites = prerequisites ? prerequisites : course.prerequisites;
  course.basePrice = basePrice ? basePrice : course.basePrice;
  course.isApproved = false;

  await course.save();

  // 6- check if the user want to update the image
  if (oldPublicId) {
    if (!req.file) return next({ cause: 400, message: "Image is required" });

    const newPulicId = oldPublicId.split(`${course.folderId}/`)[1];

    const { secure_url } = await cloudinary().uploader.upload(req.file.path, {
      folder: `${process.env.CLOUD_FOLDER_NAME}/Categories/${course.categoryId}/${addedBy}/${course.folderId}`,

      public_id: newPulicId,
    });
    course.image.url = secure_url;
    course.image.id = newPulicId;
    await course.save();
  }

  // 7- set value for the updatedBy field
  course.updatedBy = updatedBy;

  await course.save();
  res.status(200).json({
    success: true,
    message: "course updated successfully",
    data: course,
  });
};
//=============================delete course===============

export const deleteCourse = asyncHandler(async (req, res, next) => {
  const { courseId } = req.params;

  const checkCourse = await Course.findById(courseId);

  if (!checkCourse)
    return next(
      new Error("course you try to delete not found", { cause: 404 })
    );

  if (
    req.authuser._id.toString() !== checkCourse.addedBy.toString() ||
    req.authuser._id.toString() !== systemRoles.SUPER_ADMIN
  ) {
    return next(
      new Error("you are not Authorized to delete this course", {
        cause: 400,
      })
    );
  }

  const deletedCourse = await Course.findByIdAndDelete(courseId);

  if (!deletedCourse)
    return next(new Error("error while deleting"), { cause: 500 });
  //ASK

  await CourseContent.deleteMany({ course: courseId });

  return res.status(204).json({ success: true, message: "Course deleted !" });
});
