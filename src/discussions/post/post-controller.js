import postModel from "../../../DB/models/post-model.js";
import { APIFeatures } from "../../utils/api-features.js";
import { asyncHandler } from "../../utils/async-Handeller.js";
import cloudinary from "../../utils/cloudinary.js";

//*create post
export const addPost = asyncHandler(async (req, res, next) => {
  const userId = req.authUser._id;

  //create post

  if (!req.body.content) {
    return next({ message: "post cannot be empty", cause: 400 });
  }
  const post = await postModel.create({
    content: req.body.content,
    addedBy: userId,
  });

  if (req.files) {
    let images = [];

    for (const file of req.files) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        file.path,
        {
          folder: `${process.env.CLOUD_FOLDER_NAME}/Posts/${userId}/${post._id}`,
        }
      );
      images.push({ id: public_id, url: secure_url });
    }
    post.images = [...images];
    await post.save();
  }

  req.savedDocuments = { model: postModel, _id: post._id };
  req.folder = `${process.env.CLOUD_FOLDER_NAME}/Posts/${userId}/${post._id}`;
  return res
    .status(201)
    .json({ success: true, message: "post published", post });
});

export const updatePost = asyncHandler(async (req, res, next) => {
  const userId = req.authUser._id;

  const { postId } = req.params;
  const { content } = req.body;

  const post = await postModel.findById(postId);

  if (!post) {
    return next({ message: "Post not found", cause: 404 });
  }
  if (post.addedBy.toString() !== userId.toString()) {
    return next({ message: "Not Authorized", cause: 403 });
  }

  post.content = content ? content : post.content;
  await post.save();

  if (req.body.replaceImages) {
    console.log("d");
    for (const image of post.images) {
      await cloudinary.uploader.destroy(image.id);
      post.images = [];
    }
  }
  if (req.files) {
    let newImages = [];
    await cloudinary.api.delete_resources_by_prefix(
      `${process.env.CLOUD_FOLDER_NAME}/Posts/${userId}/${post._id}`,
      { resource_type: "image" }
    );

    for (const file of req.files) {
      const { secure_url } = await cloudinary.uploader.upload(file.path, {
        folder: `${process.env.CLOUD_FOLDER_NAME}/Posts/${userId}/${post._id}`,
      });
      newImages.push({ id: public_id, url: secure_url });
    }
    post.images = [...post.images, ...newImages];
    await post.save();
  }

  return res.status(200).json({ success: true, message: "post updated", post });
});

//get all posts
export const viewPosts = asyncHandler(async (req, res, next) => {
  const features = new APIFeatures(
    req.query,
    postModel
      .find()
      .select("createdAt content  numberOfLikes numberOfComments  images")
      .populate([
        { path: "addedBy", select: "firstName lastName profile_pic _id" },
      ])
  );

  features.filter().search().sort().fields().pagination();
  const posts = await features.mongooseQuery;
  if (posts.length === 0)
    return next({ message: "there's no posts yet", cause: 404 });

  return res.status(200).json({ success: true, posts });
});

export const singlePost = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;
  const post = await postModel
    .findById(postId)
    .select("createdAt content numberOfLikes numberOfComments images")
    .populate({
      path: "addedBy",
      select: "firstName lastName profile_pic -_id",
    });
  if (!post) return next({ message: "post not found", cause: 404 });

  return res.status(200).json({ success: true, post });
});

//delete post

export const deletePost = asyncHandler(async (req, res, next) => {
  const userId = req.authUser._id;

  const { postId } = req.params;

  const post = await postModel.findOneAndDelete({ _id: postId }, { new: true });
  if (!post) {
    return next({
      message: " error while deleting or Post not found",
      cause: 404,
    });
  }
  if (post.addedBy.toString() !== userId.toString()) {
    console.log("d");
    return next({ message: "Not Authorized", cause: 403 });
  }

  if (post.images) {
    await cloudinary.api.delete_resources_by_prefix(
      `${process.env.CLOUD_FOLDER_NAME}/Posts/${userId}/${post._id}`
    );
    await cloudinary.api.delete_folder(
      `${process.env.CLOUD_FOLDER_NAME}/Posts/${userId}/${post._id}`
    );
  }

  return res.status(200).json({ success: true, message: "post deleted", post });
});
