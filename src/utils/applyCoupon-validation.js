import { DateTime } from "luxon";
import couponModel from "../../DB/models/coupon-model.js";

export const couponValidation = async (couponCode) => {
  //couponCode check
  const coupon = await couponModel.findOne({ couponCode });
  if (!coupon) return { message: "Coupon not found", status: 404 };

  // expired check
  if (
    coupon.couponStatus === "expired" ||
    DateTime.fromISO(coupon.toDate) < DateTime.now()
  )
    return { message: "Coupon is expired", status: 400 };

  // valid check
  if (DateTime.fromISO(coupon.fromDate) > DateTime.now())
    return { message: "Coupon is not started yet", status: 400 };

  // user exceeded the max usage or not
  if (coupon.usageCount >= coupon.maxUsage)
    return { message: "Coupon exceeded the max usage", status: 400 };

  return coupon;
};

/**
 * moment
 * luxon
 */
