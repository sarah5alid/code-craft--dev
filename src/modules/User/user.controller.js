import userModel from "../../../DB/models/user-model.js";
import { asyncHandler } from "../../utils/async-Handeller.js";

import bcrypt from "bcryptjs";

import cloudinary from "../../utils/cloudinary.js";

//==============update password===================//

export const updatePassword = asyncHandler(async (req, res, next) => {
  const id = req.authUser._id;
  const { oldPassword, newPassword, confirmPassword } = req.body;
  const User = await userModel.findById(id);
  const match = bcrypt.compareSync(oldPassword, User.password);
  if (!match) {
    return next(new Error("wrong password", { cause: 400 }));
  }

  const newMatch = bcrypt.compareSync(newPassword, User.password);

  if (newMatch) {
    return next(new Error("password used many times,enter new one!"));
  }

  const hashedPassword = bcrypt.hashSync(newPassword, +process.env.SALT_ROUNDS);
  User.password = hashedPassword;
  await User.save();

  return res.status(200).json({
    success: true,
    message: "password updated successfully",
    userId: id,
  });
});

//=========================  updated profile data===================================

export const updateProfileData = asyncHandler(async (req, res, next) => {
  const {
    firstName,
    lastName,
    phoneNumber,
    Bio,
    experience,
    education,
    contactInfo,
  } = req.body;

  const id = req.authUser._id;

  const User = await userModel.findById(id);

  User.firstName = firstName ? firstName : User.firstName;
  User.lastName = lastName ? lastName : User.lastName;
  User.phoneNumber = phoneNumber ? phoneNumber : User.phoneNumber;
  User.Bio = Bio ? Bio : User.Bio;
  User.experience = experience ? experience : User.experience;
  User.education = education ? education : User.education;
  User.contactInfo = contactInfo ? contactInfo : User.contactInfo;

  await User.save();

  const updatedUser = {
    ...User._doc,
    password: undefined,
    forgetCode: undefined,
    accessToken: undefined,
  };

  return res.status(200).json({
    success: true,
    message: "profile updated successfully",
    user: updatedUser,
  });
});

//=======================upload profile pic=====================

export const uploadProfile_Pic = asyncHandler(async (req, res, next) => {
  const id = req.authUser._id;
  const User = await userModel.findById(id);

  if (!req.file || !req.file.path) {
    return next(new Error("No file provided", { cause: 400 }));
  }

  //upload image on cloudinary
  const { public_id, secure_url } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `${process.env.CLOUD_FOLDER_NAME}/user/profilepics/${id}`,
    }
  );

  // save URL in DB

  User.profile_pic = { url: secure_url, id: public_id };
  await User.save();

  if (!User) {
    await cloudinary.uploader.destroy(User.profile_pic.id);
    await cloudinary.api.delete_folder(
      `${process.env.CLOUD_FOLDER_NAME}/user/profilepics/${id}`
    );

    return next(new Error("Error while uploading photo", { cause: 500 }));
  }

  return res.status(200).json({
    success: true,
    message: "profile picture uploaded ",
    photo: User.profile_pic,
    userId: User._id,
  });
});

//=============================update Profile pic==================

export const updateProfile_Pic = asyncHandler(async (req, res, next) => {
  const id = req.authUser._id;
  const user = await userModel.findById(id);

  //update image;
  if (req.body.oldPublicId) {
    if (!req.file || !req.file.path) {
      return next(new Error("No file provided", { cause: 400 }));
    }

    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        public_id: user.profile_pic.id,
      }
    );

    user.profile_pic = { url: secure_url, id: public_id };
    await user.save();
  }
  return res.status(200).json({
    success: true,
    message: "profile picture updated ",
    photo: user.profile_pic,
    userId: user._id,
  });
});

//=================================delete profile pic====================

export const deleteProfile_Pic = asyncHandler(async (req, res, next) => {
  const id = req.authUser._id;
  const user = await userModel.findById(id);
  await cloudinary.uploader.destroy(user.profile_pic.id);
  console.log("sara");
  await cloudinary.api.delete_folder(
    `${process.env.CLOUD_FOLDER_NAME}/user/profilepics/${id}`
  );
  user.profile_pic = {
    url: "https://res.cloudinary.com/dsx35oatb/image/upload/v1718282507/Code-Craft/user/profilepics/defaults/Windows_10_Default_Profile_Picture.svg_vz3o73.png",
    id: "Code-Craft/user/profilepics/defaults/Windows_10_Default_Profile_Picture.svg_vz3o73.png",
  };

  await user.save();
  console.log("ssss");
  return res.status(200).json({
    success: true,
    message: "profile picture removed ",
    user,
  });
});

//==============================get profile data=================

export const getProfile = asyncHandler(async (req, res, next) => {
  const id = req.authUser._id;

  const user = await userModel.findById(id);

  if (!user) {
    return next(new Error("Not found!", { cause: 404 }));
  }

  return res.status(200).json({ success: true, profile: user });
});
