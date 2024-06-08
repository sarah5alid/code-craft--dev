import { Schema, Types, model } from "mongoose";

const commentSchema = new Schema(
  {
    content: { type: String, required: true },
    addedBy: { type: Types.ObjectId, ref: "User" },
    image: { id: { type: String }, url: { type: String } },
    postId: { type: Types.ObjectId, ref: "Post" },
    numberOfLikes: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

export const commentModel = model("comment", commentSchema);

commentSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await replyModel.deleteMany({ replyOnId: doc._id });
  }
});

commentSchema.post("deleteMany", async function () {
  const query = this.getQuery();
  const comments = await this.model.find(query);
  const commentIds = comments.map((comment) => comment._id);
  await replyModel.deleteMany({ replyOnId: { $in: commentIds } });
});
