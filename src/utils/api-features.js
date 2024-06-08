// export class ApiFeatures {
//   constructor(mongooseQuery, query) {
//     this.mongooseQuery = mongooseQuery;
//     this.query = query;
//   }

//   pagination() {
//     if (requestAnimationFrame.query.page <= 0) this.query.page = 1;
//     let pageNumber = this.query.page * 1 || 1;
//     let limit = 4;
//     let skip = (pageNumber - 1) * limit;
//       this.pageNumber=pageNumber
//     this.mongooseQuery.skip(skip).limit(limit);

//     return this; //function chain
//   }
//   filter() {
//     let filterObj = { ...this.query };

//     let excludedFields = ["page", "sort", "fields", "keyword"];
//     excludedFields.forEach((val) => {
//       delete filterObj[val];
//     });

//     filterObj = JSON.stringify(filterObj);
//     filterObj = filterObj.replace(/ (gt|gte|lt|lte)/g, (match) => "$" + match);

//     filterObj = JSON.parse(filterObj);

//     this.mongooseQuery.find(filterObj);

//     return this;
//   }

//   sort() {
//     if (this.query.sort) {
//       let sortBy = this.query.sort.split(",").join(" ");
//       this.mongooseQuery.sort(sortBy);
//     }
//     return this;
//   }

//   fields() {
//     if (this.query.fields) {
//       let fields = this.query.fields.split(",").join(" ");
//       this.mongooseQuery.select(fields);
//     }
//     return this;
//   }

//   search() {
//     if (this.query.keyword) {
//       this.mongooseQuery.find({
//         $or: [
//           { title: { $regex: this.query.keyword } },
//           { description: { $regex: this.query.keyword } },
//         ],
//       });
//     }
//     return this;
//   }
// }

//import { paginationFunction } from "./pagination.js";

/**
 * @class APIFeatures
 * @constructor query, mongooseQuery
 * @description this class will be used to filter, sort, paginate and search the data
 * @method pagination
 *@description this method will be used to divide the data into chunks or patches
 *@param {page, size}
 * @method sort
 * @description this method will be used to sort the data depending on the given field
 * @check if the field is not given then it will sort the data by createdAt field in descending order
 * @param {sortBy}
 * @method search
 * @description this method will be used to search the data depending on the given fields
 * @param {search}  => object contains the fields that we want to search by
 * @method filters
 *@description this method will be used to filter the data depending on the given fields but more dynamically than the @mtethod search
 *@param {filters} => object contains the fields that we want to filter by
 *@example
 * @params will be in this formate
 * appliedPrice[gte]=100
 * stock[lte]=200
 * discount[ne]=0
 * title[regex]=iphone
 * @object will be like this after the replace method
 * { appliedPrice: { $gte: 100 }, stock: { $lte: 200 }, discount: { $ne: 0 }, title: { $regex: 'iphone' }
 */

export class APIFeatures {
  // mongooseQuery  = model.find()
  // query = this.query
  constructor(query, mongooseQuery) {
    this.query = query; // we can remove this variable becaue we didn't use it
    this.mongooseQuery = mongooseQuery;
  }

  pagination() {
    if (this.query.page <= 0) this.query.page = 1;
    let pageNumber = this.query.page * 1 || 1;
    let limit = 8;
    let skip = Math.max(0, (pageNumber - 1) * limit);
    this.pageNumber = pageNumber;
    this.mongooseQuery.skip(skip).limit(limit);

    return this; //function chain
  }

  dynamicPagination() {
    const skip = Math.max(this.query.skip, 0);
    // Default limit is 8, Max limit is 100.
    const limit = Math.min(this.query.limit || 8, 100);
    this.mongooseQuery.skip(skip).limit(limit);
    console.log({ skip, limit });
    return this; //function chain
  }

  sort() {
    if (!this.query.sort) {
      this.mongooseQuery = this.mongooseQuery.sort({ createdAt: -1 });
      return this;
    }
    const formula = this.query.sort
      .replace(/desc/g, -1)
      .replace(/asc/g, 1)
      .replace(/ /g, ":"); // 'stock  desc' => 'stock: -1'
    const [key, value] = formula.split(":");
    console.log([key], value);
    this.mongooseQuery = this.mongooseQuery.sort({ [key]: +value });
    return this;
  }

  search() {
    if (this.query.keyword) {
      this.mongooseQuery.find({
        $or: [
          { courseName: { $regex: this.query.keyword } },
          { desc: { $regex: this.query.keyword } },
          { firstName: { $regex: this.query.keyword } },
          { lastName: { $regex: this.query.keyword } },
        ],
      });
    }
    return this;
  }
  filter() {
    console.log("filter");
    let filterObj = { ...this.query };

    let excludedFields = ["page", "sort", "fields", "keyword", "skip", "limit"];
    excludedFields.forEach((val) => {
      delete filterObj[val];
    });

    filterObj = JSON.stringify(filterObj);
    filterObj = filterObj.replace(
      /(gt|gte|lt|lte|in|nin|eq|ne|regex)/g,
      (match) => "$" + match
    );

    filterObj = JSON.parse(filterObj);
    console.log(filterObj);
    this.mongooseQuery.find(filterObj);

    return this;
  }

  fields() {
    if (this.query.fields) {
      let fields = this.query.fields.split(",").join(" ");
      this.mongooseQuery.select(fields);
    }
    return this;
  }
}
