import joi from "joi";

import { isValidObjectId } from "../../middlewares/validation-middleware.js";

export const uploadCourseInfoSchema = {
  body: joi.object({
    name: joi.string().min(10).max(100).required(),
    desc: joi.string().min(20).required(),
    level: joi
      .string()
      .valid("Beginner", "Intermediate", "Advanced")
      .required(),
    prerequisites: joi.string().required(),
    basePrice: joi.number().required(),
  }),
  params: joi.object({
    categoryId: joi.string().custom(isValidObjectId).required(),
  }),
};

export const updateCourseInfoSchema = {
  body: joi.object({
    name: joi.string().min(10).max(100),
    desc: joi.string().min(20),
    level: joi.string().valid("Beginner", "Intermediate", "Advanced"),
    prerequisites: joi.string(),
    basePrice: joi.number(),
  }),

  params: joi.object({
    courseId: joi.string().custom(isValidObjectId).required(),
  }),
};
