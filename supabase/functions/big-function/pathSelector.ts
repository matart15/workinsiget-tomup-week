import { assertNever } from "../_shared/assertNever.ts";
import { adminGetUserData } from "./adminGetUserData/index.ts";
import { adminListUsersByRole } from "./adminListUsersByRole/index.ts";
import { adminUpdateUser } from "./adminUpdateUser/index.ts";
import { adminUpdateUserAppmeta } from "./adminUpdateUserAppmeta/index.ts";
import { communityMatchWithManager } from "./communityMatchWithManager/index.ts";
import { managerChangeStaffStatus } from "./managerChangeStaffStatus/index.ts";
import { staffRequest } from "./staffRequest/index.ts";
import { userDelete } from "./userDelete/index.ts";
import { userRegister } from "./userRegister/index.ts";

type AllowedPath =
  | "userRegister"
  | "userDelete"
  | "adminUpdateUser"
  | "communityMatchWithManager"
  | "adminUpdateUserAppmeta"
  | "staffRequest"
  | "managerChangeStaffStatus"
  | "adminListUsersByRole"
  | "adminGetUserData";

export const pathSelector = (path: AllowedPath) => {
  switch (path) {
    case "userRegister":
      return userRegister;
    case "userDelete":
      return userDelete;
    case "adminUpdateUser":
      return adminUpdateUser;
    case "communityMatchWithManager":
      return communityMatchWithManager;
    case "adminUpdateUserAppmeta":
      return adminUpdateUserAppmeta;
    case "staffRequest":
      return staffRequest;
    case "managerChangeStaffStatus":
      return managerChangeStaffStatus;
    case "adminListUsersByRole":
      return adminListUsersByRole;
    case "adminGetUserData":
      return adminGetUserData;
  }
  return assertNever(path);
};
