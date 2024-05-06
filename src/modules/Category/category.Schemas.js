import joi from "joi";

export const addCategorySchema = {
  body: joi.object({
    name: joi.string().min(5).max(30).required(),
  }),
};

export const updateCategorySchema = {
  body: joi.object({
    name: joi.string().min(5).max(30),
  }),
};
