import { Course } from "../../DB/models/course-model.js";

export async function checkCourseExists(courseId) {
  const course = await Course.findById(courseId);

  if (!course) {
    return { message: "course not found", status: 404 };
  }
  return course;
}
