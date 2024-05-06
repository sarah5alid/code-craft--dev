import { Types } from "mongoose";

const reqKeys = ["body", "params", "query", "headers"];

export const isValidObjectId = (value, helper) => {
  if (Types.ObjectId.isValid(value)) return true;
  return helper.message("Invalid objectId!");
};

export const validationMiddleware = (schema) => {
  return (req, res, next) => {
    let validationErrorArr = [];

    for (const key of reqKeys) {
      const validationResult = schema[key]?.validate(req[key]);

      if (validationResult?.error) {
        console.log(
          `Validation error for ${key}:`,
          validationResult.error.message
        );
        validationErrorArr.push(...validationResult.error.details);
      }
    }

    if (validationErrorArr.length) {
      return res.json({
        success: false,
        message: "Validation error",
        errors: validationErrorArr.map((obj) => obj.message),
      });
    }
    next();
  };
};
