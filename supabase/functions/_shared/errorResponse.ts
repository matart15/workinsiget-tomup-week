import { corsResponse } from "./cors.ts";

export class CustomError extends Error {
  code: string;
  displayMessage: string;
  // deno-lint-ignore no-explicit-any
  extra: any;

  constructor(
    code: keyof typeof ERROR_CODES,
    options?: {
      displayMessage?: string;
      // deno-lint-ignore no-explicit-any
      extra?: any;
    },
  ) {
    super(options?.displayMessage || ERROR_CODES[code]);
    this.code = code;
    this.displayMessage = options?.displayMessage || ERROR_CODES[code];
    this.extra = options?.extra;
  }
  errorResponse = () => {
    console.log("Error", this.code, this.displayMessage, this.extra);
    return corsResponse(
      new Response(
        JSON.stringify({
          error: this,
        }),
        {
          headers: { "Content-Type": "application/json" },
          status: 200, // this app specific custom error code
        },
      ),
    );
  };
}

const SERVER_ERROR_STRING = "サーバーエラーが発生しました。";
// Predefined error codes with display messages
export const ERROR_CODES = {
  // development purpose only
  NOT_IMPLEMENTED: SERVER_ERROR_STRING,
  THIS_SHOULD_NOT_HAPPEN: "本来発生してはいけないエラーです。",

  // base
  UNHANDLED: SERVER_ERROR_STRING, // avoid this error as much as possible. use UNKNOWN_EXTERNAL_API_ERROR at least.
  VALIDATION_ERROR: "入力値が不正です。入力値を確認してください。",
  UNAUTHORIZED: "権限がありません。",
  NOT_FOUND: "リソースが見つかりません。",
  UNKNOWN_EXTERNAL_API_ERROR: SERVER_ERROR_STRING, // avoid this error as much as possible. try to handle errors

  // specific errors
  NO_PUSH_TOKEN: "プッシュ通知用のトークンがありません。",
  CANT_CREATE_SUPABASE_USER: "ユーザーを作成できませんでした。",
  CANT_CREATE_APP_USER: "ユーザーを作成できませんでした。",
  CANT_DELETE_APP_USER: "ユーザーを削除できませんでした。",

  // stripe
  STRIPE_CUSTOMER_DELETED: "顧客のStripe情報が削除されています。",
  STRIPE_TOO_MANY_SUBSCRIPTIONS: SERVER_ERROR_STRING, // this means we did something wrong. we should not create more than 1 subscription per user.
  STRIPE_SUBSCRIPTION_ALREADY_EXISTS: "こちらのプランに参加しております。", // this means frontend is not working properly. frontend should not send request if user already has same subscription.
  STRIPE_PAYMENT_METHOD_NOT_FOUND: SERVER_ERROR_STRING, // Customer has no attached payment method. Frontend should make sure user have payment method

  // revenue cat
  REVENUECAT_APP_USER_ID_NOT_SAVED_BEFORE_WEBHOOK:
    "アプリユーザーIDが保存されていません。",
  REVENUECAT_UPDATE_USER_FAILED: "アプリユーザー情報の更新に失敗しました。",

  // HOOKS
  WEBHOOK_ONLY_INSERT_METHOD_IS_SUPPORTED: SERVER_ERROR_STRING,
};
