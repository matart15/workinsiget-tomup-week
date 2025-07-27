export type AppVersionString =
  | "unknown"
  | "1.0.4"
  | "1.0.3"
  | "1.0.5"
  | "1.0.6";
export const getAppVersion = async (req: any): Promise<AppVersionString> => {
  const app_version = req.headers.get("x-app-version");
  if (app_version === "1.0.4") {
    return "1.0.4";
  }
  if (app_version === "1.0.3") {
    return "1.0.3";
  }
  if (app_version === "1.0.5") {
    return "1.0.5";
  }
  if (app_version === "1.0.6") {
    return "1.0.6";
  }
  return "unknown";
};
