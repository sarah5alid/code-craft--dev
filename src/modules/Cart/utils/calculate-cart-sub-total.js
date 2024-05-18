/**
 * @param {Array{}} courses
 * @returns  {Number}
 * @description calculate the subTotal of the cart
 */

export function calculateSubTotal(courses) {
  let subTotal = 0;
  for (const course of courses) {
    subTotal += course.basePrice;
  }

  return subTotal;
}
