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

  if (!req.file)
    return next(new Error("please upload videos !", { cause: 400 }));

  // Upload video to Cloudinary
  const result = await new Promise((resolve, reject) => {
    cloudinary.uploader.upload_large(
      req.file.path,
      {
        folder: `${process.env.CLOUD_FOLDER_NAME}/Categories/${checkCourse.categoryId}/${checkCourse.addedBy}/${checkCourse._id}/videos`,
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
  const content = {
    title,
    slug,

    video: { id: result.public_id, url: result.secure_url },
    duration: durationInMinutes,
    course: courseId,
  };

  const video = await CourseContent.create(content);

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

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_large(
        req.file.path,
        {
          folder: `${process.env.CLOUD_FOLDER_NAME}/Categories/${checkCourse.categoryId}/${checkCourse.addedBy}/${checkCourse._id}/videos`,
          public_id: checkVideo.video.id,
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

    checkCourse.courseDuration -= checkVideo.duration;
    await checkCourse.save();

    checkVideo.video.url = result.secure_url;
    checkVideo.video.id = result.public_id;
    checkVideo.duration = result.duration / 60;

    checkCourse.courseDuration += checkVideo.duration;

    await checkVideo.save();
  }

  checkCourse.updatedBy = updatedBy;

  await checkCourse.save();
  return res.status(200).json({
    success: true,
    message: "video updated",
    video: checkVideo,
  });
});
//===========================delete specifc video===============
export const deleteSpecificVideo = asyncHandler(async (req, res, next) => {
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
      new Error("you are not Authorized to delete videos this course", {
        cause: 400,
      })
    );
  }

  checkCourse.vidoes = checkCourse.vidoes.filter(
    (videoid) => videoid.toString() !== videoId
  );
  await checkCourse.save();
  const deletedVideo = await CourseContent.findByIdAndDelete(videoId);
  if (!deletedVideo) {
    return next(new Error("error while deleting"), { cause: 500 });
  }

  return res.status(200).json({ success: true, message: "video deleted!" });
});
