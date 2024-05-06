import { systemRoles } from "../../utils/system-roles.js";

export const endPointsRoles = {
  ADD_CATEGORY: [systemRoles.SUPER_ADMIN, systemRoles.ADMIN],
  UPDATE_CATEGORY:[systemRoles.SUPER_ADMIN,systemRoles.ADMIN]
};
