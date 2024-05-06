import { systemRoles } from "../../utils/system-roles.js";

export const endPointsRoles = {
  UPLOAD_COURSE: [systemRoles.USER,systemRoles.INSTRUCTOR, systemRoles.ADMIN],
  UPDATE_COURSE:[systemRoles.ADMIN,systemRoles.INSTRUCTOR],
  DELETE_COURSE:[systemRoles.INSTRUCTOR,systemRoles.SUPER_ADMIN],
  APPROVE_COURSE:[systemRoles.SUPER_ADMIN]
}
