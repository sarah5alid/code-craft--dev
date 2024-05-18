
/**
 * @param {Cart Type} cart 
 * @param {String} courseId 
 * @returns  {Promise<Boolean>}
 * @description check if course exists in cart
 */

export async function checkcourseIfExistsInCart(cart, courseId) {

    return cart.courses.some(
        (course) => course.courseId.toString() === courseId
    )

}