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
    firstname: joi.string().min(3).max(20),
    lastname: joi.string().min(3).max(20),
    phonenumber: joi.string().pattern(new RegExp("^[0-9]{11}$")), // Assuming phone number is a 10-digit string
    bio: joi.string().min(3).max(120),
    experience: joi.string().min(3).max(300),
    education: joi.string(),
    contactinfo: joi.array().items(joi.string()),
  }),
};
