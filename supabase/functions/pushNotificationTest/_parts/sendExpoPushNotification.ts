const expoPushNotificationAccessToken = Deno.env.get(
  "EXPO_PUSH_NOTIFICATION_ACCESS_TOKEN",
);

export const sendExpoPushNotification = async ({
  to,
  title,
  body,
}: {
  to: string;
  title: string;
  body: string;
}) => {
  console.log("🚀 ~ { to, title, body, }:", {
    to,
    title,
    body,
  });
  const headers = {
    "content-type": "application/json",
    "accept-encoding": "gzip, deflate",
    accept: "application/json",
    authorization: `Bearer ${expoPushNotificationAccessToken}`,
    host: "exp.host",
  };
  const bodyString = JSON.stringify({
    to,
    title,
    body,
  });
  console.log("🚀 ~ bodyString:", bodyString);
  const response = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers,
    body: bodyString,
  });
  return response;
};
