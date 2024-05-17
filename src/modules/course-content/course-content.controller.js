import slugify from "slugify";
import { Course } from "../../../DB/models/course-model.js";
import { asyncHandler } from "../../utils/async-Handeller.js";
import cloudinary from "../../utils/cloudinary.js";
import { CourseContent } from "../../../DB/models/course-content-model.js";

export const uploadVideos = asyncHandler(async (req, res, next) => {
  const { title } = req.body;

  const checkTitle = await CourseContent.findOne({
    course: req.req.checkCourse._id,
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

    course: req.req.checkCourse._id,
  };

  const video = await CourseContent.create(content);

  req.savedDocuments = { model: CourseContent, _id: video._id };

  if (!req.file)
    return next(new Error("please upload videos !", { cause: 400 }));

  // Upload video to Cloudinary
  const result = await new Promise((resolve, reject) => {
    cloudinary.uploader.upload_large(
      req.file.path,
      {
        folder: `${process.env.CLOUD_FOLDER_NAME}/Categories/${req.req.checkCourse.categoryId}/${req.req.checkCourse.addedBy}/${req.req.checkCourse._id}/videos/${video._id}`,
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

  req.folder = `${process.env.CLOUD_FOLDER_NAME}/Categories/${req.req.checkCourse.categoryId}/${req.req.checkCourse.addedBy}/${req.req.checkCourse._id}/videos/${video._id}`;

  const durationInMinutes = result.duration / 60;
  video.video.id = result.public_id;
  video.video.url = result.secure_url;
  video.duration = durationInMinutes;
  await video.save();

  req.req.checkCourse.vidoes.push(video._id);
  req.req.checkCourse.courseDuration += durationInMinutes;
  await req.req.checkCourse.save();

  return res
    .status(201)
    .json({ success: true, message: "video uploaded!", video: video });
});

//======================update
export const updateVideos = asyncHandler(async (req, res, next) => {
  const { title, oldPublicId } = req.body;
  const updatedBy = req.authUser._id;
  const { videoId } = req.params;

  const checkVideo = await CourseContent.findById(videoId);
  if (!checkVideo) return next(new Error("video not found", { cause: 404 }));

  if (title) {
    const checkTitle = await CourseContent.findOne({
      course: req.req.checkCourse._id,
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
          folder: `${process.env.CLOUD_FOLDER_NAME}/Categories/${req.checkCourse.categoryId}/${req.checkCourse.addedBy}/${req.checkCourse._id}/videos/${checkVideo._id}`,
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
    req.req.checkCourse.courseDuration -= checkVideo.duration;

    // Update video details with the new cloudinary result
    checkVideo.video.url = result.secure_url;
    checkVideo.video.id = result.public_id;
    checkVideo.duration = durationInMinutes;
    await checkVideo.save();
    // Update course duration based on the changes made
    req.req.checkCourse.courseDuration += durationInMinutes;

    await req.req.checkCourse.save();
  }

  req.req.checkCourse.updatedBy = updatedBy;

  await req.req.checkCourse.save();
  return res.status(200).json({
    success: true,
    message: "video updated",
    video: checkVideo,
  });
});

//===========================delete specifc video===============
export const deleteSpecificVideo = asyncHandler(async (req, res, next) => {
  const { videoId } = req.params;

  const checkVideo = await CourseContent.findById(videoId);
  if (!checkVideo) return next(new Error("video not found", { cause: 404 }));

  req.checkCourse.vidoes = req.checkCourse.vidoes.filter(
    (videoid) => videoid.toString() !== videoId
  );

  req.checkCourse.courseDuration -= checkVideo.duration;
  await req.checkCourse.save();
  await cloudinary.api.delete_resources_by_prefix(
    `${process.env.CLOUD_FOLDER_NAME}/Categories/${req.checkCourse.categoryId}/${req.checkCourse.addedBy}/${req.checkCourse._id}/videos/${checkVideo._id}`,
    { resource_type: "video" }
  );
  await cloudinary.api.delete_folder(
    `${process.env.CLOUD_FOLDER_NAME}/Categories/${req.checkCourse.categoryId}/${req.checkCourse.addedBy}/${req.checkCourse._id}/videos/${checkVideo._id}`
  );

  const deletedVideo = await CourseContent.findByIdAndDelete(videoId);

  if (!deletedVideo) {
    return next(new Error("Error while deleting"), { cause: 500 });
  }

  return res
    .status(200)
    .json({ success: true, message: "Video deleted Successfully!" });
});
