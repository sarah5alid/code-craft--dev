import couponModel from "../../../DB/models/coupon-model.js";
import orderModel from "../../../DB/models/order-model.js";
import { couponValidation } from "../../utils/applyCoupon-validation.js";
import { asyncHandler } from "../../utils/async-Handeller.js";
import { checkCourseExists } from "../../utils/checkCourseExistence.js";

export const createOrder = asyncHandler(async (req, res, next) => {
  // Destructure the request body
  const { course, couponCode, paymentMethod, phoneNumber } = req.body;
  const { _id: userId } = req.authUser;

  // Coupon code check
  let coupon = null;
  if (couponCode) {
    const isCouponValid = await couponValidation(couponCode);
    if (isCouponValid.status) {
      return next({
        message: isCouponValid.message,
        cause: isCouponValid.status,
      });
    }
    coupon = isCouponValid;
  }

  // Course check
  const courseAvailability = await checkCourseExists(course);
  if (courseAvailability.status) {
    return next({
      message: courseAvailability.message,
      cause: courseAvailability.status,
    });
  }

  // Create order items
  const orderItems = [
    {
      title: courseAvailability.courseName,
      price: courseAvailability.appliedPrice,
      course: courseAvailability._id,
    },
  ];

  console.log(orderItems);

  // Calculate prices
  let totalPrice = orderItems[0].price;
  console.log(totalPrice);

  if (coupon) {
    if (coupon.couponAmount > 100) {
      return next({ message: "Coupon amount exceeds limit", cause: 400 });
    }
  }

  let subTotal;
  if (coupon) {
    subTotal = totalPrice - (totalPrice * coupon.couponAmount) / 100;
  }
  console.log(subTotal);

  // Create order
  const order = new orderModel({
    user: userId,
    orderItems,
    phoneNumber,
    coupon: coupon?._id,
    totalPrice: subTotal,
    paymentMethod,
  });

  await order.save();

  if (coupon) {
    await couponModel.updateOne(
      { _id: coupon._id },
      { $inc: { usageCount: 1 } }
    );
  }

  res.status(201).json({ message: "Order created successfully", order });
});
