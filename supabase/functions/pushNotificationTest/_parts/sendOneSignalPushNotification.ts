import * as OneSignal from "https://esm.sh/@onesignal/node-onesignal@1.0.0-beta7";

const _OnesignalAppId_ = Deno.env.get("ONESIGNAL_APP_ID")!;
const _OnesignalUserAuthKey_ = Deno.env.get("USER_AUTH_KEY")!;
const _OnesignalRestApiKey_ = Deno.env.get("ONESIGNAL_REST_API_KEY")!;
const configuration = OneSignal.createConfiguration({
  userKey: _OnesignalUserAuthKey_,
  appKey: _OnesignalRestApiKey_,
});

const onesignal = new OneSignal.DefaultApi(configuration);
export const sendOneSignalPushNotification = async ({
  to,
  title,
  body,
}: {
  to: string;
  title: string;
  body: string;
}) => {
  // Build OneSignal notification object
  const notification = new OneSignal.Notification();
  notification.app_id = _OnesignalAppId_;
  notification.include_external_user_ids = [to];
  notification.headings = {
    en: title,
  };
  notification.contents = {
    en: body,
  };
  const onesignalApiRes = await onesignal.createNotification(notification);
  return onesignalApiRes;
};
