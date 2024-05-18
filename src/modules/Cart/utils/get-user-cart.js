

import cartModel from "../../../../DB/models/cart-model.js"




/**
 * 
 * @param {String} userId 
 * @returns  {Promise<Cart | null>}
 * @description  Get the user's cart
 */


export async function getUserCart(userId) {
    const userCart = await cartModel.findOne({ userId })
    return userCart
}