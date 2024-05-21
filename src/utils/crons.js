import { scheduleJob } from "node-schedule";
import couponModel from "../../DB/models/coupon-model.js";

import { DateTime } from "luxon";

export function cron1() {
  scheduleJob("0 0 0 * * *", async () => {
    console.log("here");
    const coupons = await couponModel.find({ couponStatus: "valid" });

    for (const coupon of coupons) {
      if (DateTime.fromISO(coupon.toDate) < DateTime.now()) {
        coupon.couponStatus = "expired";
      }
      await coupon.save();
    }
  });
}
export function cron2() {
  scheduleJob("0 0 0 1 * * ", async () => {
    await couponModel.deleteMany({ couponStatus: "expired" });
  });
}
