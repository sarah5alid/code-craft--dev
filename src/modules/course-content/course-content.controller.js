import slugify from "slugify";
import { Course } from "../../../DB/models/course-model.js";
import { asyncHandler } from "../../utils/async-Handeller.js";
import cloudinary from "../../utils/cloudinary.js";
import { CourseContent } from "../../../DB/models/course-content-model.js";
import { systemRoles } from "../../utils/system-roles.js";
export const uploadVideos = asyncHandler(async (req, res, next) => {
  const { title } = req.body;
  const { courseId } = req.params; //ASK
  const checkCourse = await Course.findById(courseId);

  if (!checkCourse)
    return next(
      new Error("course you try to upload its videos not found", { cause: 404 })
    );

  if (req.authUser._id.toString() !== checkCourse.addedBy.toString()) {
    return next(
      new Error("you are not Authorized to upload videos to this course", {
        cause: 400,
      })
    );
  }

  const checkTitle = await CourseContent.findOne({
    course: courseId,
    title: title,
  });

  if (checkTitle) {
    return next({
      message: "you upload a video with this title, choose new one !",
      cause: 400,
    });
  }

  const slug = slugify(title, "-");

  const content = {
    title,
    slug,

    course: courseId,
  };

  const video = await CourseContent.create(content);

  if (!req.file)
    return next(new Error("please upload videos !", { cause: 400 }));

  // Upload video to Cloudinary
  const result = await new Promise((resolve, reject) => {
    cloudinary.uploader.upload_large(
      req.file.path,
      {
        folder: `${process.env.CLOUD_FOLDER_NAME}/Categories/${checkCourse.categoryId}/${checkCourse.addedBy}/${checkCourse._id}/videos/${video._id}`,
        resource_type: "video",
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
  });

  const durationInMinutes = result.duration / 60;
  video.video.id = result.public_id;
  video.video.url = result.secure_url;
  video.duration = durationInMinutes;
  await video.save();

  checkCourse.vidoes.push(video._id);
  checkCourse.courseDuration += durationInMinutes;
  await checkCourse.save();

  return res
    .status(201)
    .json({ success: true, message: "video uploaded!", video: video });
});

//======================update
export const updateVideos = asyncHandler(async (req, res, next) => {
  const { title, oldPublicId } = req.body;
  const updatedBy = req.authUser._id;
  const { courseId, videoId } = req.params;

  const checkCourse = await Course.findById(courseId);

  if (!checkCourse)
    return next(
      new Error("course you try to update its videos not found", { cause: 404 })
    );

  const checkVideo = await CourseContent.findById(videoId);
  if (!checkVideo) return next(new Error("video not found", { cause: 404 }));

  if (req.authUser._id.toString() !== checkCourse.addedBy.toString()) {
    return next(
      new Error("you are not Authorized to upload videos to this course", {
        cause: 400,
      })
    );
  }

  if (title) {
    const checkTitle = await CourseContent.findOne({
      course: courseId,
      title: title,
    });

    if (checkTitle) {
      return next({
        message: "you upload a video with this title, choose new one !",
        cause: 400,
      });
    }

    checkVideo.title = title ? title : checkVideo.title;
    await checkVideo.save();
  }

  const slug = slugify(title, "-");
  checkVideo.slug = slug ? slug : checkVideo.slug;
  await checkVideo.save();

  if (oldPublicId) {
    if (!req.file) return next(new Error("please upload video"));

    const newPublicId = checkVideo.video.id.split("videos/")[1];

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_large(
        req.file.path,
        {
          folder: `${process.env.CLOUD_FOLDER_NAME}/Categories/${checkCourse.categoryId}/${checkCourse.addedBy}/${checkCourse._id}/videos/${checkVideo._id}`,
          public_id: newPublicId,
          resource_type: "video",
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
    });

    const durationInSeconds = result.duration;

    // Convert duration to minutes
    const durationInMinutes = durationInSeconds / 60;

    // Subtract the current video's duration from the course duration
    checkCourse.courseDuration -= checkVideo.duration;

    // Update video details with the new cloudinary result
    checkVideo.video.url = result.secure_url;
    checkVideo.video.id = result.public_id;
    checkVideo.duration = durationInMinutes;
    await checkVideo.save();
    // Update course duration based on the changes made
    checkCourse.courseDuration += durationInMinutes;

    await checkCourse.save();
  }

  checkCourse.updatedBy = updatedBy;

  await checkCourse.save();
  return res.status(200).json({
    success: true,
    message: "video updated",
    video: checkVideo,

    duration: checkCourse.courseDuration,
  });
});

// //===========================delete specifc video===============
// export const deleteSpecificVideo = asyncHandler(async (req, res, next) => {
//   const { courseId, videoId } = req.params;

//   const checkCourse = await Course.findById(courseId);

//   if (!checkCourse)
//     return next(
//       new Error("course you try to update its videos not found", { cause: 404 })
//     );

//   const checkVideo = await CourseContent.findById(videoId);
//   if (!checkVideo) return next(new Error("video not found", { cause: 404 }));

//   if (req.authUser._id.toString() !== checkCourse.addedBy.toString()) {
//     return next(
//       new Error("you are not Authorized to delete videos this course", {
//         cause: 400,
//       })
//     );
//   }

//   checkCourse.vidoes = checkCourse.vidoes.filter(
//     (videoid) => videoid.toString() !== videoId
//   );

//   checkCourse.courseDuration -= checkVideo.duration;
//   await checkCourse.save();

//   await cloudinary.api.delete_resources(checkVideo.video.id);
//   // await cloudinary.api.delete_folder(
//   //   `${process.env.CLOUD_FOLDER_NAME}/Categories/${checkCourse.categoryId}/${checkCourse.addedBy}/${checkCourse._id}/videos/${checkVideo._id}`,
//   //   { recursive: true }
//   // );

//   const deletedVideo = await CourseContent.findByIdAndDelete(videoId);

//   if (!deletedVideo) {
//     return next(new Error("error while deleting"), { cause: 500 });
//   }

//   return res.status(200).json({ success: true, message: "video deleted!" });
// });
