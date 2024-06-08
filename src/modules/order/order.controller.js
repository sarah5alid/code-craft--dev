import cartModel from "../../../DB/models/cart-model.js";
import couponModel from "../../../DB/models/coupon-model.js";
import { Enrollment } from "../../../DB/models/course-enrollement-model.js";
import orderModel from "../../../DB/models/order-model.js";
import {
  confirmPaymentIntent,
  createCheckOutSession,
  createPaymentIntent,
  createStripeCoupon,
} from "../../payment-handler/Stripe.js";
import { couponValidation } from "../../utils/applyCoupon-validation.js";
import { asyncHandler } from "../../utils/async-Handeller.js";
import { checkCourseExists } from "../../utils/checkCourseExistence.js";
import { getUserCart } from "../Cart/utils/get-user-cart.js";
import { DateTime } from "luxon";
export const createOrder = asyncHandler(async (req, res, next) => {
  // Destructure the request body
  const { course, couponCode, paymentMethod } = req.body;
  const { _id: user } = req.authUser;



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

  if (coupon) {
    totalPrice -= (totalPrice * coupon.couponAmount) / 100;
  }

  // Create order
  const order = new orderModel({
    user,
    orderItems,
    coupon: coupon?._id,
    totalPrice,
    paymentMethod,
  });

  await order.save();

  if (coupon) {
    await couponModel.updateOne(
      { _id: coupon._id },
      { $inc: { usageCount: 1 } }
    );
  }

  res
    .status(201)
    .json({ success: true, message: "Order created successfully", order });
});
//===============================================================
export const convertFromCartToOrder = asyncHandler(async (req, res, next) => {
  const { couponCode, paymentMethod } = req.body;

  const { _id: user } = req.authUser;
  // cart items
  const userCart = await getUserCart(user);
  if (!userCart) return next({ message: "Cart not found", cause: 404 });

  // coupon code check
  let coupon = null;
  if (couponCode) {
    const isCouponValid = await couponValidation(couponCode, user);
    if (isCouponValid.status)
      return next({
        message: isCouponValid.message,
        cause: isCouponValid.status,
      });
    coupon = isCouponValid;
  }

  let orderItems = userCart.courses.map((cartItem) => {
    return {
      title: cartItem.title,
      price: cartItem.basePrice,
      course: cartItem.courseId,
    };
  });

  //prices
  let totalPrice = userCart.subTotal;

  if (coupon) {
    if (coupon.couponAmount > 100) {
      return next({ message: "Coupon amount exceeds limit", cause: 400 });
    }
  }

  if (coupon) {
    totalPrice -= (totalPrice * coupon.couponAmount) / 100;
  }

  // create order
  const order = new orderModel({
    user,
    orderItems,
    coupon: coupon?._id,
    totalPrice,
    paymentMethod,
  });

  await order.save();

  await cartModel.findByIdAndDelete(userCart._id);

  if (coupon) {
    await couponModel.updateOne(
      { couponId: coupon._id },
      { $inc: { usageCount: 1 } }
    );
  }

  res
    .status(201)
    .json({ success: true, message: "Order created successfully", order });
});
//=========================================pay with stripe===================

export const payWithStripe = asyncHandler(async (req, res, next) => {
  const { orderId } = req.params;
  const { _id: userId } = req.authUser;

  const order = await orderModel.findOne({
    _id: orderId,
    user: userId,
    orderStatus: "Pending",
  });

  if (!order) {
    return next({ message: "order not found ", cause: 404 });
  }

  const paymentObject = {
    customer_email: req.authUser.email,
    metadata: { orderId: order._id.toString() },

    discounts: [],
    line_items: order.orderItems.map((item) => {
      return {
        price_data: {
          currency: "EGP",
          product_data: {
            name: item.title,
          },
          unit_amount: item.price * 100,
        },
        quantity: 1,
      };
    }),
  };

  if (order.coupon) {
    const stripeCoupon = await createStripeCoupon({ couponId: order.coupon });

    if (stripeCoupon.status)
      return next({ message: stripeCoupon.message, cause: 404 });

    paymentObject.discounts.push({
      coupon: stripeCoupon.id,
    });
  }

  const checkOutSession = await createCheckOutSession(paymentObject);

  const paymentIntent = await createPaymentIntent({
    amount: order.totalPrice,
    currency: "EGP",
  });
  order.payment_intent = paymentIntent.id;
  await order.save();
  return res
    .status(200)
    .json({ success: true, checkOutSession, paymentIntent });
});

//========================

export const stripeWebhookLocal = asyncHandler(async (req, res, next) => {
  console.log("webhook received", req.body);

  const orderId = req.body.data.object.metadata.orderId;

  const confirmedOrder = await orderModel.findById(orderId);

  if (!confirmedOrder) {
    return next({ message: "Order not found", cause: 404 });
  }

  const conformPaymentIntentDetails = await confirmPaymentIntent(
    confirmedOrder.payment_intent
  );

  confirmedOrder.isPaid = true;
  confirmedOrder.paidAt = DateTime.now().toFormat("yyyy-MM-dd HH:mm:ss");
  confirmedOrder.orderStatus = "Paid";

  await confirmedOrder.save();

  // enroll user in course

  const courses = confirmedOrder.orderItems.map((item) => item.course);
  const enrollments = courses.map((course) => ({
    user: confirmedOrder.user,
    course: course,
  }));
  console.log(enrollments);
  const newEnroll = await Enrollment.insertMany(enrollments);
  console.log(newEnroll);

  console.log(conformPaymentIntentDetails);
  res.status(200).json({ message: "webhook received" });
});
//============
