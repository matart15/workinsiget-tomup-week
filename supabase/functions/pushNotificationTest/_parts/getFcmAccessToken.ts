import { GoogleAuth, JWT } from "npm:google-auth-library@9.8.0";

const keyFile = "./mycone-41f7c-firebase-adminsdk-3xu2m-9553841956.json";
export async function getFcmAccessToken() {
  const auth = new GoogleAuth({
    keyFile: keyFile,

    scopes: "https://www.googleapis.com/auth/firebase.messaging",
  });

  const client = await auth.getClient();

  const token = await client.getAccessToken();

  const jwtToken = token.token;

  console.log(jwtToken);
  return jwtToken;
}
// async function geFcmtAccessToken_gemini1() {
//   const credentials = JSON.parse(await Deno.readTextFile(keyFile));
//   const scopes = ["https://www.googleapis.com/auth/firebase.messaging"]; // FCM v1 scope

//   const client = new JWT({
//     email: credentials.client_email,
//     privateKey: credentials.private_key,
//     scopes,
//   });

//   try {
//     const token = await client.sign();
//     return token.accessToken;
//   } catch (error) {
//     console.error("Error generating access token:", error);
//     throw error; // Or handle the error differently based on your needs
//   }
// }
// async function geFcmtAccessToken_gemini() {
//   const credentials = JSON.parse(await Deno.readTextFile(keyFile));
//   const scopes = ["https://www.googleapis.com/auth/firebase.messaging"]; // FCM v1 scope

//   const client = new JWT({
//     email: credentials.client_email,
//     privateKey: credentials.private_key,
//     scopes,
//   });

//   const token = await client.sign();
//   return token.accessToken;
// }

// getFcmAccessToken();
import axios from "https://deno.land/x/axiod@0.26.2/mod.ts";

const fcmToken =
  "94fab3ee295663153cc974bc3b920cd6c4b5aef9bcfe61e115b86df5c8a4b32f";
const tokenData = {
  data: "94fab3ee295663153cc974bc3b920cd6c4b5aef9bcfe61e115b86df5c8a4b32f",
  type: "ios",
};
const projectId = "mycone-41f7c";
const accessToken = await getFcmAccessToken();

const url = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;

const message = {
  message: {
    token: fcmToken,
    notification: {
      title: "Your Notification Title",
      body: "Notification message content",
    },
  },
};

const response1 = await axios.post(url, message, {
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  },
});
console.log("response1", response1);
