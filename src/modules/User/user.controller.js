import userModel from "../../../DB/models/user-model.js";
import { asyncHandler } from "../../utils/async-Handeller.js";

import bcrypt from "bcryptjs";

import cloudinary from "../../utils/cloudinary.js";

//==============update password===================//
const getUserProfilePicFolderPath = (folderId) => {
  if (folderId === null || folderId === undefined) {
    throw new Error(`Invalid folder id "${folderId}".`);
  }

  return `${process.env.CLOUD_FOLDER_NAME}/user/profilepics/${folderId}`;
};

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
  //TO DO =>DATE OF BIRTH

  const {
    firstname,
    lastname,
    phonenumber,
    bio,
    experience,
    education,
    contactinfo,
  } = req.body;

  const id = req.authUser._id;

  const User = await userModel.findById(id);

  User.firstName = firstname ? firstname : User.firstName;
  User.lastName = lastname ? lastname : User.lastName;
  User.phoneNumber = phonenumber ? phonenumber : User.phoneNumber;
  User.Bio = bio ? bio : User.Bio;
  User.experience = experience ? experience : User.experience;
  User.education = education ? education : User.education;
  User.contactInfo = contactinfo ? contactinfo : User.contactInfo;

  await User.save();

  const updatedUser = {
    userId: id,
    profile_pic: User.profile_pic,
    firstname: User.firstName,
    lastname: User.lastName,
    phonenumber: User.phoneNumber,
    bio: User.Bio,
    experience: User.experience,
    education: User.education,
    contactinfo: User.contactInfo,
    role: User.role,
  };

  return res
    .status(200)
    .json({ success: true, message: "profile updated", user: updatedUser });
});

//=======================upload profile pic=====================

export const uploadProfile_Pic = asyncHandler(async (req, res, next) => {
  const id = req.authUser._id;

  //upload image on cloudinary
  const { public_id, secure_url } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `${process.env.CLOUD_FOLDER_NAME}/user/profilepics/${id}`,
      resource_type: "image",
    }
  );

  // save URL in DB

  const User = await userModel.findByIdAndUpdate(
    id,
    {
      profile_pic: { url: secure_url, id: public_id },
    },
    { new: true }
  );

  if (!User) {
    await cloudinary.uploader.destroy(User.profile_pic.id);
    await cloudinary.api.delete_folder(
      `${process.env.CLOUD_FOLDER_NAME}/user/profilepics/${id}`
    );

    return next(new Error("Error while uploading photo", { cause: 500 }));
  }

  return res.status(200).json({
    success: true,
    message: "profile picture uploaded !",
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
    message: "profile picture updated !",
    photo: user.profile_pic,
    userId: user._id,
  });
});

//=================================delete profile pic====================

export const deleteProfile_Pic = asyncHandler(async (req, res, next) => {
  const id = req.authUser._id;
  const user = await userModel.findById(id);
  await cloudinary.uploader.destroy(user.profile_pic.id);
  await cloudinary.api.delete_folder(  `${process.env.CLOUD_FOLDER_NAME}/user/profilepics/${id}`);
  user.profile_pic = { url: undefined, id: undefined };
  await user.save();

  return res.status(200).json({
    success: true,
    message: "profile picture removed ",
    userId: user._id,
  });
});

//==============================get profile data=================

export const getProfile = asyncHandler(async (req, res, next) => {
  const id = req.authUser._id;

  const user = await userModel
    .findById(id)
    .select(
      "firstName lastName phoneNumber Bio contactInfo education experience _id profile_pic"
    );
  if (!user) {
    return next(new Error("Not found!", { cause: 404 }));
  }

  const User = {
    userId: id,
    profile_pic: user.profile_pic,
    firstname: user.firstName,
    lastname: user.lastName,
    phonenumber: user.phoneNumber,
    bio: user.Bio,
    experience: user.experience,
    education: user.education,
    contactinfo: user.contactInfo,
  };

  return res.status(200).json({ success: true, profile: User });
});
