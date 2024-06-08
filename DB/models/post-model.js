import { Schema, Types, model } from "mongoose";
import { commentModel } from "./comment-model.js";
// import { likeModel } from "./likeModel.js";
// import { commentModel } from "./commentModel.js";

const postSchema = new Schema(
  {
    content: { type: String, required: true },
    images: [{ id: { type: String }, url: { type: String } }],
    addedBy: { type: Types.ObjectId, ref: "User", required: true },

    numberOfLikes: { type: Number, default: 0, min: 0 },

    numberOfComments: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

postSchema.post("findOneAndDelete", async function (doc) {
  const postId = doc._id;
  console.log("ss");

  await commentModel.deleteMany({ postId });
  console.log(postId);
});

export default model("Post", postSchema);
