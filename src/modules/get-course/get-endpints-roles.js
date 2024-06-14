import { systemRoles } from "../../utils/system-roles.js";

export const endPointsRoles = {
  GET_INS_COURSE: [systemRoles.INSTRUCTOR],
  GET_VIEWED: [
    systemRoles.SUPER_ADMIN,
    systemRoles.INSTRUCTOR,
    systemRoles.ADMIN,
  ],
  APPROVE_COURSE: [systemRoles.SUPER_ADMIN],
};
