import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    phoneNumber: { type: String, required: true },
    orderItems: [
      {
        title: { type: String, required: true },

        price: { type: Number, required: true },
        course: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Course",
          required: true,
        },
      },
    ],
    coupon: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon" },
    totalPrice: { type: Number, required: true },

    paymentMethod: { type: String, enum: ["Stripe", "Paymob"], required: true },
    orderStatus: {
      type: String,
      enum: ["Pending", "Paid", "Cancelled", "Refunded"],
      required: true,
      default: "Pending",
    },

    isPaid: { type: Boolean, required: true, default: false },
    paidAt: { type: String },

    cancelledAt: { type: String },
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    payment_intent: { type: String },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Order || mongoose.model("Order", orderSchema);
