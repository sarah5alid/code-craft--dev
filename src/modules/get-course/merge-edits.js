// import { Course } from "../../../DB/models/course-model.js";

// export const mergeEditsWithCourse = async (course) => {
//   // Convert Mongoose document to plain JavaScript object
//   //   const plainCourse = course.toObject();

//   //   const course = { ...plainCourse };

//   if (!course.edits) return;
//   const edits = course.edits.toObject();

//   console.log(edits);
//   for (const key in edits) {
//     if (
//       key === "image" &&
//       (!course.edits.image.id || !course.edits.image.url)
//     ) {
//       if (course.image && course.image.id && course.image.url) {
//         continue;
//       }
//     }

//     if (
//       course.edits[key] !== null &&
//       course.edits[key] !== undefined &&
//       key !== "_id"
//     ) {
//       course[key] = course.edits[key];
//     }
//   }

// //   await course.save();
//   //   const newCourseDocument = new Course(course);

//   // Log only the merged course data
//   console.log("Course", course);

//   //return course;
// };
