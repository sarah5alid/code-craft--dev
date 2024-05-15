import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    couponCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    couponAmount: {
      type: Number,
      required: true,
      min: 1,
    },
    couponStatus: {
      type: String,
      default: "valid",
      enum: ["valid", "expired"],
    },

    fromDate: {
      type: String,
      required: true,
    },
    toDate: {
      type: String,
      required: true,
    },

    maxUsage: {
      type: Number,
      required: true,
      min: 1,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Coupon || mongoose.model("Coupon", couponSchema);
