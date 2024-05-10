import joi from "joi";
import { systemRoles } from "../../utils/system-roles.js";

export const signUpSchema = {
  body: joi
    .object({
      firstname: joi.string().min(3).max(20).required(),
      lastname: joi.string().min(3).max(20).required(),
      email: joi
        .string()
        .email({ maxDomainSegments: 2, tlds: { allow: ["com", "net"] } })
        .required(),
      password: joi
        .string()
        .min(8)
        .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
        .required(),

      confirmpassword: joi.ref("password"),

      age: joi.number().integer().positive().min(8),

      gender: joi.string().valid("male", "female").required(),
      phoneNumber: joi.string().pattern(new RegExp("^[0-9]{11}$")),
      // role: joi.valid("user", "instructor", "admin", "superAdmin").required(),
    })
    .with("password", "confirmpassword"),
};

export const signInSchema = {
  body: joi.object({
    email: joi
      .string()
      .email({ maxDomainSegments: 2, tlds: { allow: ["com", "net"] } })
      .required(),
    password: joi
      .string()
      .min(8)
      .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
      .required(),
  }),
};

export const forgetCodeSchema = {
  body: joi.object({
    email: joi
      .string()
      .email({ maxDomainSegments: 2, tlds: { allow: ["com", "net"] } })
      .required(),
  }),
};

export const checkCodeSchema = {
  body: joi.object({
    forgetCode: joi.string().min(4).required(),
  }),
  query: joi.object({
    email: joi
      .string()
      .email({ maxDomainSegments: 2, tlds: { allow: ["com", "net"] } })
      .required(),
  }),
};

export const resetPasswordSchema = {
  query: joi.object({
    email: joi
      .string()
      .email({ maxDomainSegments: 2, tlds: { allow: ["com", "net"] } })
      .required(),
  }),

  body: joi
    .object({
      password: joi
        .string()
        .min(8)
        .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
        .required(),
      confirmpassword: joi.ref("password"),
    })
    .with("password", "confirmpassword"),
};

export const reactivationSchema = {
  query: joi.object({
    email: joi
      .string()
      .email({ maxDomainSegments: 2, tlds: { allow: ["com", "net"] } })
      .required(),
  }),
};
