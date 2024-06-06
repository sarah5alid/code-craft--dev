import ExcelJS from "exceljs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sendEmailService from "../../services/send-email-service.js";
import { asyncHandler } from "../../utils/async-Handeller.js";
import cloudinary from "../../utils/cloudinary.js";
import userModel from "../../../DB/models/user-model.js";

const workbook = new ExcelJS.Workbook();
const worksheet = workbook.addWorksheet("Contacts");
worksheet.columns = [
  { header: "Name", key: "name", width: 30 },
  { header: "Email", key: "email", width: 30 },
  { header: "Phone", key: "phoneNumber", width: 30 },
  { header: "Message", key: "message", width: 50 },
  { header: "File", key: "fileData", width: 50 },
];

export const contactUs = asyncHandler(async (req, res, next) => {
  const userId = req.authUser._id;
  const { name, email, phoneNumber, message } = req.body;

  const logedIn = await userModel.findOne({ _id: userId });
  if (logedIn.email !== email) {
    return next({
      message: " please enter the email you Signed Up with ",
      cause: 400,
    });
  }
  let fileData = null;
  if (req.file) {
    const { secure_url } = await cloudinary.uploader.upload(req.file.path, {
      folder: `${process.env.CLOUD_FOLDER_NAME}/contact-us/${email}`,
    });
    fileData = secure_url;
  }

  const send = await sendEmailService({
    to: "craftcode34@gmail.com",
    subject: `message from${email}`,
    message: `Name: ${name}\nEmail: ${email}\nPhone:${phoneNumber}\nMessage: ${message}`,
    attachments: fileData ? [{ path: fileData }] : [],
  });

  if (!send) {
    return next({ message: "error while sending ", cause: 409 });
  }

  worksheet.addRow({ name, email, phoneNumber, message, fileData });

  await workbook.xlsx.writeFile("contact.xlsx");

  return res
    .status(200)
    .json({ success: true, messge: "Message sent successfully" });
});
