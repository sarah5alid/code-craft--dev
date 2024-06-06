import joi from "joi";

import { isValidObjectId } from "../../middlewares/validation-middleware.js";

export const addReview = {
  body: joi.object({
    reviewRate: joi.number().min(1).max(5).required(),
    reviewComment: joi.string().min(0).max(255),
  }),

  params: joi.object({
    courseId: joi.string().custom(isValidObjectId).required(),
  }),
};
