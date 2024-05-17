import { asyncHandler } from "./async-Handeller.js";
import cloudinary from "./cloudinary.js";

export const rollBackUploadedFiles = ()=>{


return asyncHandler(async (req, res, next) => {
    if (req.folder) {

        console.log("here")
      await cloudinary.api.delete_resources_by_prefix(req.folder,{ resource_type: 'video' });
          
        console.log("there")
      await cloudinary.api.delete_folder(req.folder);
    }
    next();
  }
)







};
  