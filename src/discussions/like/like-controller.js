import { commentModel } from "../../../DB/models/comment-model.js";
import likeModel from "../../../DB/models/like-model.js";
import postModel from "../../../DB/models/post-model.js";
import replyModel from "../../../DB/models/reply-model.js";
import { asyncHandler } from "../../utils/async-Handeller.js";

export const likeOrUnlike = asyncHandler(async (req, res, next) => {
  const { likeDoneOnId } = req.params; // productId or commentId or replyId
  const { _id } = req.authUser;
  const { onModel } = req.body;

  let dbModel = "";
  if (onModel === "Post") dbModel = postModel;
  else if (onModel == "Comment") dbModel = commentModel;
  else if (onModel == "Reply") dbModel = replyModel;
  console.log(dbModel);
  //check productId
  const document = await dbModel.findById(likeDoneOnId);
  if (!document)
    return next(new Error(` ${onModel} is not found'`, { cause: 404 }));

  const isAlreadyLiked = await likeModel.findOne({
    likedBy: _id,
    likeDoneOnId,
  });
  if (isAlreadyLiked) {
    // delete like document from likes collection
    await likeModel.findByIdAndDelete(isAlreadyLiked._id);
    // decrement numberOfLikes in product document by 1
    document.numberOfLikes -= 1;
    await document.save();
    return res
      .status(200)
      .json({ message: "unLike Done", document, success: true, like: false });
  }
  // create like
  // create like document in likes collection
  const like = await likeModel.create({ onModel, likedBy: _id, likeDoneOnId });
  // increment numberOfLikes in product document by 1
  document.numberOfLikes += 1;
  await document.save();

  res
    .status(200)
    .json({ message: "Like Done", like, document, success: true, like: true});
});

export const getUserLikes = asyncHandler(async (req, res, next) => {
  const { _id } = req.authUser;
  const { onModel, ids } = req.query;
  console.log({ onModel, ids });

  const likes = await likeModel.find({
    onModel, likeDoneOnId: {$in: ids.split(',')}, likedBy: _id,
  });

  res.status(200).json({ message: "done", likes: likes.map(like => like.likeDoneOnId), success: true});
});

export const getUserLikesHistory = asyncHandler(async (req, res, next) => {
  const { _id } = req.authUser;
  // generate object to assgin the filter object to it then send it to find method
  let queryFilter = {};
  if (req.query.onModel) queryFilter.onModel = req.query.onModel; // if there is onModel in query so didn't consider it as condition
  queryFilter.likedBy = _id;
  const likes = await likeModel.find(queryFilter).populate([
    {
      path: "likeDoneOnId",
      populate: {
        path: "addedBy",
        select: "firstName lastName profile_pic",
      }, // nested populate
    },
  ]);

  res.status(200).json({ message: "done", likes });
});
