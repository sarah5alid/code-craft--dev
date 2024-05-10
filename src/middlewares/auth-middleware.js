import user from "../../DB/models/user-model.js";

import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/async-Handeller.js";

export const authuntication = (accessRoles) => {
  return asyncHandler(async (req, res, next) => {
    let { token } = req.headers;

    if (!token) {
      return next(new Error("please log in first", { cause: 404 }));
    }

    if (!token.startsWith(process.env.BEARER_KEY)) {
      return next(new Error("invalid token", { cause: 400 }));
    }

    token = token.split(process.env.BEARER_KEY)[1];

    const payload = jwt.verify(token, process.env.SECRET_KEY);

    if (!payload || !payload.id) {
      return next(new Error("invalid payload", { cause: 400 }));
    }

    const findUser = await user.findById(payload.id, "userName email role "); // loggdInUser ROle
    if (!findUser) return next(Error("please signUp first", { cause: 404 }));

    if (findUser.accessToken.isValid == false) {
      return next(new Error("Session Expired !", { statusCode: 401 }));
    }
    // auhtorization
    if (!accessRoles.includes(findUser.role))
      return next(new Error("unauthorized", { cause: 401 }));
    req.authUser = findUser;
    next();
  });
};
