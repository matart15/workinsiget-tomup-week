// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

import { getSupabaseAdmin } from "../_shared/supabaseAdmin.ts";
import { CustomError } from "../_shared/errorResponse.ts";
import { dataResponse } from "../_shared/dataResponse.ts";
import { uMessagesRowSchema } from "../_shared/schema.ts";
import { sendOneSignalPushNotification } from "./_parts/sendOneSignalPushNotification.ts";

type MessageType = z.infer<typeof uMessagesRowSchema>;
interface WebhookPayload {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  record: MessageType;
  schema: "public";
  old_record: null | MessageType;
}

Deno.serve(async (req) => {
  const { record, type }: WebhookPayload = await req.json();
  if (type !== "INSERT") {
    return new CustomError(
      "WEBHOOK_ONLY_INSERT_METHOD_IS_SUPPORTED",
    ).errorResponse();
  }
  console.log("🚀 ~ record:", record);

  const parseResult = uMessagesRowSchema.safeParse(record);
  if (!parseResult.success) {
    return new CustomError("VALIDATION_ERROR", {
      extra: parseResult.error,
    }).errorResponse();
  }
  const messageId = parseResult.data.id;
  const senderId = parseResult.data.user_id;
  console.log("🚀 ~ senderId:", senderId);
  const supabaseAdmin = getSupabaseAdmin();
  const { data: message } = await supabaseAdmin
    .from("u_messages")
    .select(
      `
      *,
      u_matches(
        *
      )
    `,
    )
    .eq("id", messageId)
    .single();
  console.log("🚀 ~ message:", message);
  if (!message || !message.u_matches) {
    return new CustomError("NOT_FOUND", {
      extra: { message },
    }).errorResponse();
  }

  const receivingUserId =
    message.u_matches.user1_id === senderId
      ? message.u_matches.user2_id
      : message.u_matches.user1_id;

  console.log("🚀 ~ receivingUserId:", receivingUserId);
  const supabaseUserResult =
    await supabaseAdmin.auth.admin.getUserById(receivingUserId);
  const supabaseUser = supabaseUserResult.data.user;
  console.log("🚀 ~ supabaseUser:", supabaseUser);
  if (!supabaseUser) {
    return new CustomError("NOT_FOUND", {
      extra: supabaseUserResult,
    }).errorResponse();
  }
  // const expoPushToken = supabaseUser.user_metadata.expoPushToken;
  // console.log("🚀 ~ expoPushToken:", expoPushToken);
  // if (!expoPushToken) {
  //   return new CustomError("NO_PUSH_TOKEN", {
  //     extra: supabaseUserResult,
  //   }).errorResponse();
  // }
  const response = await sendOneSignalPushNotification({
    to: supabaseUser.id,
    title: "新しいメッセージが届きました",
    body: message.content,
  });
  if (!response) {
    return new CustomError("UNKNOWN_EXTERNAL_API_ERROR").errorResponse();
  }

  return dataResponse({
    success: true,
  });
});

// To invoke Local:
// curl -i --location --request POST 'http://localhost:54321/functions/v1/' \
//   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
//   --header 'Content-Type: application/json' \
//   --data '{"name":"Functions"}'
