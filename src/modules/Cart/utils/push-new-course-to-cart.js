/**
 *
 * @param {Cart Type} cart
 * @param {course Type} course
 * @param {Number} quantity
 * @returns  {Promise<Cart>}
 * @description add course to cart
 */

import { calculateSubTotal } from "./calculate-cart-sub-total.js";

export async function pushNewcourse(cart, course) {
  cart?.courses.push({
    courseId: course._id,

    basePrice: course.appliedPrice,
    title: course.courseName,
    image: course.image,
    desc: course.desc,
  });

  cart.subTotal = calculateSubTotal(cart.courses);

  return await cart.save();
}
