// await fetch("https://fcm.googleapis.com/fcm/send", {
//   method: "POST",
//   headers: {
//     "Content-Type": "application/json",
//     Authorization: `key=<FCM-SERVER-KEY>`,
//   },
//   body: JSON.stringify({
//     to: "<NATIVE-DEVICE-PUSH-TOKEN>",
//     priority: "normal",
//     data: {
//       experienceId: "@yourExpoUsername/yourProjectSlug",
//       scopeKey: "@yourExpoUsername/yourProjectSlug",
//       title: "📧 You've got mail",
//       message: "Hello world! 🌐",
//     },
//   }),
// });
// import { createClient } from "npm:@supabase/supabase-js@2";
import { JWT } from "npm:google-auth-library@9";
import serviceAccount from "./mycone-41f7c-firebase-adminsdk-3xu2m-9553841956.json" with { type: "json" };

const getAccessToken = ({
  clientEmail,
  privateKey,
}: {
  clientEmail: string;
  privateKey: string;
}): Promise<string> => {
  return new Promise((resolve, reject) => {
    const jwtClient = new JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/firebase.messaging"],
    });
    jwtClient.authorize((err, tokens) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(tokens!.access_token!);
    });
  });
};

const fcmToken =
  "6f314baca9048e67919651c0b0af8365feee0ff4382d4aab97bd24cda0c7f562";
const accessToken = await getAccessToken({
  clientEmail: serviceAccount.client_email,
  privateKey: serviceAccount.private_key,
});
console.log("serviceAccount.project_id", serviceAccount.project_id);

const res = await fetch(
  `https://fcm.googleapis.com/v1/projects/${serviceAccount.project_id}/messages:send`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      // message: {
      token: fcmToken,
      notification: {
        title: `Notification from Supabase`,
        body: "payload.record.body",
      },
      // },
    }),
  },
);
console.log("result ", res);
