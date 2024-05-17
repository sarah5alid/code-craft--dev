import { asyncHandler } from "./async-Handeller.js";

export const rollbackSavedDocuments = () => {
  return asyncHandler(async (req, res, next) => {
    
    console.log("rollbackSavedDocuments middleware", req.savedDocuments);
    if (req.savedDocuments) {
      console.log(req.savedDocuments);
      const { model, _id } = req.savedDocuments;
      await model.findByIdAndDelete(_id);
    }
  });
};
