import user from "../../../DB/models/user-model.js";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../../utils/async-Handeller.js";
import bcrypt from "bcryptjs";

import sendEmailService from "../../services/send-email-service.js";

import randomstring from "randomstring";

export const signUp = asyncHandler(async (req, res, next) => {
  // 1- destructure the required data from the request body
  const {
    firstname,
    lastname,
    email,
    password,
    confirmpassword,
    age,

    gender,
    phoneNumber,
  } = req.body;

  // 2- check if the user already exists in the database using the email

  const checkUser = await user.findOne({ email, isDeleted: true });

  if (checkUser) {
    return res.status(409).json({
      message: "Email used in signnig up before,do you want to eactive it",
      email: email,
    });
  }

  const checkuser = await user.findOne({ email });

  if (checkuser) {
    return next(new Error("Email already exits , try Log In", { cause: 409 }));
  }

  // 3- send confirmation email to the user
  const usertoken = jwt.sign({ email }, process.env.SECRET_KEY, {
    expiresIn: "3d",
  });

  const isEmailSent = await sendEmailService({
    to: email,
    subject: "Email Verification",
    message: `
        <h2>please clich on this link to verfiy your email</h2>
        <a href="${req.protocol}://${req.headers.host}/Auth/verify-email?token=${usertoken}">Verify Email</a>
        `,
  });
  console.log(req.protocol, req.headers.host);

  // 4- check if email is sent successfully
  if (!isEmailSent) {
    return next(
      new Error("Email is not sent, please try again later", { cause: 500 })
    );
  }
  // 5- password hashing
  const hashedPassword = bcrypt.hashSync(password, +process.env.SALT_ROUNDS);

  // 6- create new document in the database
  const newUser = await user.create({
    firstName: firstname,
    lastName: lastname,
    email,
    password: hashedPassword,
    age,

    phoneNumber,
    gender,

    //  test:req.body.test
  });

  // 7- return the response
  res.status(201).json({
    success: true,
    message:
      "User created successfully, please check your email to verify your account",
    username: newUser.userName,
  });
});
//==================================

export const verifyEmail = asyncHandler(async (req, res, next) => {
  const { token } = req.query;
  const decodedData = jwt.verify(token, process.env.SECRET_KEY);
  // get uset by email , isEmailVerified = false
  const User = await user.findOneAndUpdate(
    {
      email: decodedData.email,
      isEmailVerified: false,
    },
    { isEmailVerified: true },
    { new: true }
  );
  if (!User) {
    return next(new Error("User not found", { cause: 404 }));
  }

  res.status(200).json({
    success: true,
    message: "Email verified successfully, please try to login",
  });
});
//=================================================sign in====================

export const signIn = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  // get user by email
  const User = await user.findOne({
    email,
    isEmailVerified: true,
  });
  if (!User) {
    return next(new Error("Invalid login credentails", { cause: 404 }));
  }

  if (User.isDeleted == true) {
    return next(
      new Error("Your account is soft deleted you cannot Log In", {
        cause: 404,
      })
    );
  }

  if (User.isPinned == true) {
    return next(
      new Error("Your account is pinned you cannot Log In", {
        cause: 404,
      })
    );
  }

  // check password
  const isPasswordValid = bcrypt.compareSync(password, User.password);
  if (!isPasswordValid) {
    return next(new Error("Invalid login credentails", { cause: 404 }));
  }

  // generate login token
  const token = jwt.sign(
    { email, id: User._id, loggedIn: true },
    process.env.SECRET_KEY
  );

  User.accessToken = { token: token, isValid: true };
  await User.save();

  console.log(User.accessToken.token);
  // updated isLoggedIn = true  in database

  User.isLoggedIn = true;
  await User.save();

  res.status(200).json({
    success: true,
    message: "User logged in successfully",
    data: {
      token,
    },
  });
});
//============================================================== forget password code=================

export const forgetCode = asyncHandler(async (req, res, next) => {
  const User = await user.findOne({ email: req.body.email });

  if (!User) {
    return next(new Error("invalid Email!", { cause: 400 }));
  }

  if (!User.isEmailVerified) {
    return next(
      new Error("Your account not activated,activate it first", { cause: 400 })
    );
  }

  //  gnerate code

  const code = randomstring.generate({
    length: 4,
    charset: "numeric",
  });
  // save code
  User.forgetCode = code;
  await User.save();
  //send mail
  const sendMessage = sendEmailService({
    to: User.email,
    subject: "reset password!",
    //text: "hello from signUp",
    message: `<div> ${code}</div>`,
  });

  if (!sendMessage) {
    return next(
      new Error("Email is not sent, please try again later", { cause: 500 })
    );
  }
  // redirect fornt end page
  return res.status(200).json({
    success: true,
    message: " code sent! ",
    email: req.body.email,
  });
});
//===============================check code==========================

export const checkCode = asyncHandler(async (req, res, next) => {
  let User = await user.findOne({
    email: req.query.email,
  });

  if (!User) return next(new Error("Invalid email", { cause: 404 }));

  //check code
  if (User.forgetCode !== req.body.forgetCode || User.forgetCode == null) {
    return next(new Error("Invalid Code", { cause: 400 }));
  }

  await user.findOneAndUpdate(
    { email: req.params.email },
    { forgetCode: null },
    { new: true }
  );

  return res.status(200).json({
    success: true,
    message: "Code checked, you can reset your password",
  });
});

//=========================reset pass===================

export const resetPassword = asyncHandler(async (req, res, next) => {
  const User = await user.findOne({ email: req.query.email });

  if (!User) {
    return next(new Error("Invalid email", { cause: 404 }));
  }

  if (User) {
    const match = bcrypt.compareSync(req.body.password, User.password);

    if (match) {
      return next(
        new Error("Password used many times,enter new one!", { cause: 400 })
      );
    }
  }
  if (req.body.password !== req.body.confirmpassword) {
    return next(
      new Error("Confirm Password must match with password", { cause: 400 })
    );
  }

  User.password = bcrypt.hashSync(req.body.password, +process.env.SALT_ROUNDS);

  await User.save();

  return res
    .status(200)
    .json({ success: true, message: "Password reset successfully,try log In" });
});

//================================logOut===================================
export const logOut = asyncHandler(async (req, res, next) => {
  const id = req.authUser._id;

  await user.findByIdAndUpdate(id, {
    accessToken: { isValid: false },
    isLoggedIn: false,
  });

  return res.status(200).json({ success: true, message: " logged Out" });
});

//==========================delete account

export const deleteAccount = asyncHandler(async (req, res, next) => {
  const id = req.authUser._id;

  const User = await user.findById(id);

  if (!User) {
    return next(new Error("user not found", { cause: 400 }));
  }

  if (User.coursesUploaded.length > 0) {
    return next(
      new Error(
        "you cannot delete account because you upload courses,contact with our support"
      )
    );
  }

  User.isDeleted = true;
  User.accessToken.isValid = false;
  await User.save();

  return res.status(200).json({ success: true, message: "User deleted !" });
});

//=================Reactivation==================

export const sendReactiveEmail = asyncHandler(async (req, res, next) => {
  const { email } = req.query;

  const usertoken = jwt.sign({ email }, process.env.SECRET_KEY, {
    expiresIn: "3d",
  });

  const isEmailSent = await sendEmailService({
    to: email,
    subject: "Email Reactivation",
    message: `
          <h2>please clich on this link to reactive your email</h2>
          <a href="${req.protocol}://${req.headers.host}/Auth/reactive-email?token=${usertoken}">Reactive Email</a>
          `,
  });
  if (!isEmailSent) {
    return next(
      new Error("Email is not sent, please try again later", { cause: 500 })
    );
  }

  return res.status(200).json({ success: true, message: "Email sent!" });
});

//=================mark us not deleted

export const reactiveEmail = asyncHandler(async (req, res, next) => {
  const { token } = req.query;
  const decodedData = jwt.verify(token, process.env.SECRET_KEY);
  // get uset by email , isEmailVerified = false
  const User = await user.findOneAndDelete({
    email: decodedData.email,
    isDeleted: true,
  });
  if (!User) {
    return next(new Error("User not found", { cause: 404 }));
  }

  res.status(200).json({
    success: true,
    message: "Email Reactivated successfully, please try to sign In",
  });
});
