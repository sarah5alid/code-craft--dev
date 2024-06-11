import cartModel from "../../../DB/models/cart-model.js";
import { Enrollment } from "../../../DB/models/course-enrollement-model.js";
import { asyncHandler } from "../../utils/async-Handeller.js";
import { checkCourseExists } from "../../utils/checkCourseExistence.js";
import { addCart } from "./utils/add-user-cart.js";
import { calculateSubTotal } from "./utils/calculate-cart-sub-total.js";
import { checkcourseIfExistsInCart } from "./utils/check-course-in-cart.js";
import { getUserCart } from "./utils/get-user-cart.js";
import { pushNewcourse } from "./utils/push-new-course-to-cart.js";

export const addToCart = asyncHandler(async (req, res, next) => {
  const { courseId } = req.body;
  const id = req.authUser._id;
  const isEnrolled = await Enrollment.findOne({ course: courseId, user: id });
  if (isEnrolled) {
    return res.status(409).json({
      success: true,
      message: "you already Enrolled",
    });
  }

  /**
   * @check if course exists
   */

  const course = await checkCourseExists(courseId);
  if (course.status)
    return next({ message: course.message, cause: course.status });

  /**
   * @check if user has a cart
   */

  const userCart = await getUserCart(id);

  /**
 * @check if user donnot has cart, create a new one and add the course to it
 
 */
  if (!userCart) {
    const newCart = await addCart(id, course);

    return res.status(201).json({
      success: true,
      message: "Course added to cart successfully",
      data: newCart,
    });
  }

  /**
   * @returns The cart state after modifying its courses array to reflect the updated cart and subtotals.
   * @check if the returned value is null, then the course is not found in the cart and we will add it.
   */
  const checkCourse = await checkcourseIfExistsInCart(userCart, courseId);

  if (checkCourse) {
    return next({ message: "Course already added to cart", cause: 400 });
  }
  const addedCourse = await pushNewcourse(userCart, course);
  if (!addedCourse) {
    return next({ message: "Course not added to cart", cause: 400 });
  }
  return res.status(201).json({
    success: true,
    message: "Course added to cart successfully",
    data: userCart,
  });
});

//=========================== remove from cart=======================
export const removeFromcart = async (req, res, next) => {
  const { courseId } = req.params;
  const { _id } = req.authUser;

  /**
   
   * @check if the course exists in the user's cart
   */
  const userCart = await cartModel.findOne({
    userId: _id,
    "courses.courseId": courseId,
  });
  if (!userCart)
    return next({ message: "course not found in cart", cause: 404 });

  /** @returns the resulting state of the userCart.courses array, after removing the specified course from the user's cart */
  userCart.courses = userCart.courses.filter(
    (course) => course.courseId.toString() !== courseId
  );

  /**@returns the calculated subtotal after update the cart's courses array. */
  userCart.subTotal = calculateSubTotal(userCart.courses);

  const newCart = await userCart.save();

  /**@check If the cart's courses array is empty we will delete the cart. */
  if (newCart.courses.length === 0) {
    await cartModel.findByIdAndDelete(newCart._id);
  }

  res
    .status(200)
    .json({ success: true, message: "course removed from cart successfully" });
};
//=======================get user cart ========================

export const userCart = asyncHandler(async (req, res, next) => {
  const userId = req.authUser._id;
  const cart = await cartModel.findOne({ userId });

  if (!cart) {
    return next({ message: "User has no Cart", cause: 404 });
  }

  return res.status(200).json({ success: true, Cart: cart });
});
