import cartModel from "../../../../DB/models/cart-model.js";

/**
 * 
 * @param {String} userId 
 * @param {Course Type} course
 
 * @returns  {Promise<Cart>}
 * @description add user's cart in the database
 */
export async function addCart(userId, course) {
  const cartObj = {
    userId,
    courses: [
      {
        courseId: course._id,
        basePrice: course.appliedPrice,
        title: course.courseName,
        image:{id:course.image.id,url:course.image.url}  ,
        desc: course.desc,
      },
    ],
    subTotal: course.appliedPrice,
  };

  const newCart = await cartModel.create(cartObj);
  return newCart;
}
