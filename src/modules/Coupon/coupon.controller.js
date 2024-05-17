import couponModel from "../../../DB/models/coupon-model.js";
import { asyncHandler } from "../../utils/async-Handeller.js";
import { couponValidation } from "../../utils/applyCoupon-validation.js";
import { APIFeatures } from "../../utils/api-features.js";
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
  req.savedDocument = { model: couponModel, _id: coupon._id };

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
export const validteCouponApi = asyncHandler(async (req, res, next) => {
  const { code } = req.body;

  // applyCouponValidation
  const isCouponValid = await couponValidation(code);
  if (isCouponValid.status) {
    return next({
      message: isCouponValid.message,
      cause: isCouponValid.status,
    });
  }

  return res.json({ message: "coupon is valid", coupon: isCouponValid });
})
//=============================== get All coupons========================

export const getAllCoupons=  asyncHandler(async(req,res,next) =>{


  const features = new APIFeatures(req.query, couponModel.find({couponStatus:"valid"}));

  features.filter().fields().sort().search().pagination;

  const coupons = await features.mongooseQuery;

  if (coupons.length == 0) {
    return next(new Error("No coupons found!", { cause: 404 }));
  }

  //const pageNumber = features.pageNumber;
  const couponsNum = coupons.length;
  return res.status(200).json({ success: true,coupons , couponsNum });





})
