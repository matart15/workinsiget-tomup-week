import apn from "npm:@parse/node-apn";
import { JWT } from "npm:google-auth-library@9";
import serviceAccount from "./mycone-41f7c-firebase-adminsdk-3xu2m-9553841956.json" with { type: "json" };

var options = {
  token: {
    key: "./myconeExpoPushNotifKey _AuthKey_5DZX58DYTD.p8",
    keyId: "key-id",
    teamId: "developer-team-id",
  },
  production: false,
};

var apnProvider = new apn.Provider(options);

let deviceToken =
  "6f314baca9048e67919651c0b0af8365feee0ff4382d4aab97bd24cda0c7f562";

var note = new apn.Notification();

note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
note.badge = 3;
note.sound = "ping.aiff";
note.alert = "\uD83D\uDCE7 \u2709 You have a new message";
note.payload = { messageFrom: "John Appleseed" };
note.topic = "jp.mycone.app";

apnProvider.send(note, deviceToken).then((result) => {
  // see documentation for an explanation of result
});
