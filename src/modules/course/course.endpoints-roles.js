import { systemRoles } from "../../utils/system-roles.js";

export const endPointsRoles = {
  UPLOAD_COURSE: [systemRoles.USER,systemRoles.INSTRUCTOR, systemRoles.ADMIN,systemRoles.SUPER_ADMIN],
  UPDATE_COURSE:[systemRoles.ADMIN,systemRoles.INSTRUCTOR, systemRoles.SUPER_ADMIN],
  DELETE_COURSE:[systemRoles.INSTRUCTOR,systemRoles.SUPER_ADMIN],
  
}