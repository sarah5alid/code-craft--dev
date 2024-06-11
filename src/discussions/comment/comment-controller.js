import { commentModel } from "../../../DB/models/comment-model.js";
import postModel from "../../../DB/models/post-model.js";
import { APIFeatures } from "../../utils/api-features.js";
import { asyncHandler } from "../../utils/async-Handeller.js";
import cloudinary from "../../utils/cloudinary.js";

export const addComment = asyncHandler(async (req, res, next) => {
  const { content } = req.body;
  const { _id } = req.authUser;
  const { postId } = req.params;

  const post = await postModel.findById(postId);
  if (!post) return next({ message: "post not found", cause: 404 });

  if (!content) {
    return next({ message: "comment cannot be empty", cause: 400 });
  }

  // create comment
  const comment = await commentModel.create({ content, addedBy: _id, postId });

  if (req.file) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: `${process.env.CLOUD_FOLDER_NAME}/Posts/${post.addedBy}/${post._id}/Comments/${comment.addedBy}`,
      }
    );
    comment.image = { id: public_id, url: secure_url };
  }

  await comment.save();

  post.numberOfComments = await commentModel.countDocuments({ postId });

  await post.save();

  return res
    .status(201)
    .json({
      success: true, message: "comment added successfully", comment: await commentModel
    .findById(comment._id)
    .select("content numberOfLikes createdAt image")
    .populate({
      path: "addedBy",
      select: "firstName lastName profile_pic _id",
    }),  post });
});

export const updateComment = asyncHandler(async (req, res, next) => {
  const { content } = req.body;
  const { _id } = req.authUser;
  const { commentId } = req.params;
  const comment = await commentModel.findById(commentId);
  if (!comment) {
    return next({ message: "Comment not found", cause: 404 });
  }

  const post = await postModel.findById(comment.postId);
  if (!post) return next({ message: "post not found", cause: 404 });

  if (comment.addedBy.toString() !== _id.toString()) {
    return next({ message: "Not Authorized", cause: 403 });
  }

  comment.content = content ? content : comment.content;
  await comment.save();

  if (req.file) {
    const publicId = comment.image.id.split(`Comments/${comment.addedBy}`)[1];
    const { secure_url } = await cloudinary.uploader.upload(req.file.path, {
      folder: `${process.env.CLOUD_FOLDER_NAME}/Posts/${post.addedBy}/${post._id}/Comments/${comment.addedBy}`,
      public_id: publicId,
    });
    comment.image = { id: publicId, url: secure_url };
    await comment.save();
  }
  return res
    .status(200)
    .json({ success: true, message: "comment updated successfully", comment });
});

export const postComments = asyncHandler(async (req, res, next) => {
  const { postId } = req.query;

  const post = await postModel.findById(postId);
  if (!post) {
    return next({ message: "post not found", cause: 404 });
  }

  const features = new APIFeatures(
    req.query,
    commentModel
      .find({ postId })
      .select("content numberOfLikes createdAt image")
      .populate({
        path: "addedBy",
        select: "firstName lastName profile_pic _id",
      })
  );

  features.filter().sort().dynamicPagination();
  const comments = await features.mongooseQuery;

  return res.status(200).json({ success: true, comments });
});

export const deleteComment = asyncHandler(async (req, res, next) => {
  const userId = req.authUser._id;

  const { commentId } = req.params;

  const comment = await commentModel.findOneAndDelete(
    { _id: commentId },
    { new: true }
  );

  if (!comment) {
    return next({
      message: " error while deleting or comment not found",
      cause: 404,
    });
  }

  if (comment.addedBy.toString() !== userId.toString()) {
    return next({ message: "Not Authorized", cause: 403 });
  }
  
  const post = await postModel.findById(comment.postId);
  post.numberOfComments = await commentModel.countDocuments({ postId: comment.postId });
  await post.save()
  
  if (comment.image && comment.image.id) {
    await cloudinary.uploader.destroy(comment.image.id);
    const post = await postModel.findById(comment.postId);

    const folderPath = `${process.env.CLOUD_FOLDER_NAME}/Posts/${post.addedBy}/${post._id}/Comments/${comment.addedBy}`;
    const folderResources = await cloudinary.api.resources({
      type: "upload",
      prefix: folderPath,
      max_results: 1,
    });

    if (folderResources.resources.length === 0) {
      try {
        await cloudinary.api.delete_folder(folderPath);
        console.log(`Folder ${folderPath} deleted successfully.`);
      } catch (error) {
        console.error(`Error deleting folder ${folderPath}:`, error);
      }
    }
  }

  return res
    .status(200)
    .json({ success: true, message: "comment deleted", comment, post });
});
