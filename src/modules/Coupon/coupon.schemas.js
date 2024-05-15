import joi from "joi";

export const addCouponSchema = {
  body: joi.object({
    couponCode: joi.string().required().min(3).max(10).alphanum(),
    couponAmount: joi.number().required().min(1),

    fromDate: joi
      .date()
      .greater(Date.now() - 24 * 60 * 60 * 1000)
      .required(),
    toDate: joi.date().greater(joi.ref("fromDate")).required(),

    maxUsage: joi.number().required().min(1),
  }),
};
