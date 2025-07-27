import { z as Zod } from 'zod';

export const getUserRegistrationSchema = (z: typeof Zod) => {
  return z.object({
    emailAddress: z
      .string()
      .min(1, {
        message: 'メールアドレスが必須です',
      })
      .email({
        message: 'メールアドレスの形式で入力してください',
      }),
    password: z
      .string()
      .min(8, {
        message: 'パスワードは8文字以上で入力してください',
      })
      .max(20, {
        message: 'パスワードは20文字以下で入力してください',
      }),
    invited_by: z.string().optional(),
  });
};

export const communityMatchWithManagerSchema = (z: typeof Zod) => {
  return z.object({
    managerId: z.string(),
    communityId: z.number(),
  });
};
