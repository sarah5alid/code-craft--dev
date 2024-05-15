import couponModel from "../../../DB/models/coupon-model.js";
import { asyncHandler } from "../../utils/async-Handeller.js";

//============================== Add Coupon API ==============================//
/**
 * @param {*} req.body  { couponCode , couponAmount , fromDate, toDate , isFixed , isPercentage, Users}
 * @param {*} req.authUser  { _id:userId}
 * @returns  {message: "Coupon added successfully",coupon, couponUsers}
 * @description create coupon and couponUsers
 */
export const addCoupon = asyncHandler(async (req, res, next) => {
  const { couponCode, couponAmount, fromDate, toDate, maxUsage } = req.body;

  const { _id: addedBy } = req.authUser;

  // couponcode check
  const isCouponCodeExist = await couponModel.findOne({ couponCode });
  if (isCouponCodeExist)
    return next({ message: "Coupon code already exist", cause: 409 });

  if (couponAmount > 100)
    return next({ message: "Percentage should be less than 100", cause: 400 });

  const couponObject = {
    couponCode,
    couponAmount,
    fromDate,
    toDate,
    maxUsage,
    addedBy,
  };

  const coupon = await couponModel.create(couponObject);

  res.status(201).json({ message: "Coupon added successfully", coupon });
});

/**
 * Anotehr APIs from coupon module
 * getAllCoupons
 * getCouponByCode
 * updateCoupon  , set the loggedInUserId as updatedBy
 * deleteCoupon
 */

//=========================== For Testing ===========================//
export const validteCouponApi = async (req, res, next) => {
  const { code } = req.body;
 

  // applyCouponValidation
  const isCouponValid = await applyCouponValidation(code);
  if (isCouponValid.status) {
    return next({ message: isCouponValid.msg, cause: isCouponValid.status });
  }

  return res.json({ message: "coupon is valid", coupon: isCouponValid });
};
