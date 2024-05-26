import joi from "joi";


export const updatePasswordSchema = {
  body: joi
    .object({
      oldPassword: joi
        .string()
        .min(8)
        .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
        .required(),
      newPassword: joi
        .string()
        .min(8)
        .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
        .required(),
      confirmPassword: joi.ref("newPassword"),
    })
    .with("newPassword", "confirmPassword"),
};

export const updateProfileSchema = {
  body: joi.object({
    firstName: joi.string().min(3).max(20),
    lastName: joi.string().min(3).max(20),
    phoneNumber: joi.string().pattern(new RegExp("^[0-9]{11}$")), // Assuming phone number is a 10-digit string
    Bio: joi.string().min(3).max(120),
    experience: joi.string().min(3).max(300),
    education: joi.string(),
    contactInfo: joi.array().items(joi.string()),
  }),
};
