import slugify from "slugify";
import { Category } from "../../../DB/models/category-model.js";
import { asyncHandler } from "../../utils/async-Handeller.js";

export const addCategory = asyncHandler(async (req, res, next) => {
  //destruct request boody
  const { name } = req.body;
  const addedBy = req.authUser._id;

  //check category
  const checkCategory = await Category.findOne({ name });
  if (checkCategory) {
    return next(new Error("category name already exsits!", { cause: 409 }));
  }
  //generate slug
  const slug = slugify(name, "-");

  const category = {
    name,
    slug,

    createdBy: addedBy,
  };

  const categoryCreated = await Category.create(category);
  return res.status(201).json({
    success: true,
    message: "category added !",
    data: categoryCreated,
  });
});
//===============update=================================

export const updateCategory = asyncHandler(async (req, res, next) => {
  //destructing data
  const { categoryId } = req.params;
  const { name } = req.body;

  //check category existence
  const category = await Category.findById(categoryId);
  if (!category) {
    return next({ message: "category not found", cause: 404 });
  }
  //check name
  if (name) {
    if (name == category.name) {
      return next({
        message: "Enter different category name from the existing one!",
        cause: 400,
      });
    }
  }
  // check if the new name is assigned to another category

  if (name) {
    const isNameDuplicated = await Category.findOne({ name });
    if (isNameDuplicated) {
      return next({ message: "category name already exsits!", cause: 409 });
    }
    //update name & slug
  }
  category.name = name ? name : category.name;
  category.slug = name ? slugify(name) : category.slug;
  await category.save();

  //setting value for the updated value fields
  category.updatedBy = req.user._id;
  await category.save();

  return res
    .status(200)
    .json({ success: true, message: "category updated !", category: category });
});
//===================Delete TO DO
//================== Get  TO DO


