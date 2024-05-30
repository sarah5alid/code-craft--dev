import { Enrollment } from "../../DB/models/course-enrollement-model.js";

export async function checkEnrollemnt(user, course) {
  const allowed = await Enrollment.findOne({ user, course });

  if (!allowed) {
    return { message: "You  are not enrolled in this course", cause: 403 };
  }

  return allowed;
}
