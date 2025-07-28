import type { z as Zod } from 'zod';

import { usersUpdateSchema } from './schema.ts';

const authFunctionSchema = (z: typeof Zod) =>
  ({
    addLocalAdmin: {
      inputSchema: z.object({
        group_id: z.string(),
        password: z.string(),
      }),
      outputSchema: z.object({
        user_id: z.string(),
      }),
    },
    removeLocalAdmin: {
      inputSchema: z.object({
        user_id: z.string(),
      }),
      outputSchema: z.boolean(),
    },
    superAdminCreateGroup: {
      inputSchema: z.object({
        name: z.string(),
        description: z.string(),
      }),
      outputSchema: z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        created_at: z.string(),
      }),
    },
    adminAddUserToGroup: {
      inputSchema: z.object({
        group_id: z.string(),
        password: z.string(),
      }),
      outputSchema: z.object({
        user_id: z.string(),
      }),
    },
    afterUserRegister: {
      inputSchema: z.object({}),
      outputSchema: z.object({
        id: z.string(),
      }),
    },
    changeUserPermission: {
      inputSchema: z.object({
        user_id: z.string(),
        group_id: z.string(),
        group_user_id: z.string(),
        permission: z.enum(['local_admin', 'user']),
      }),
      outputSchema: z.boolean(),
    },
  }) as const;

const bigFunctionSchema = (z: typeof Zod) =>
  ({
    adminListUsersByRole: {
      inputSchema: z.object({
        role: z.enum(['admin', 'staff', 'manager', 'user']).optional(),
        from: z.number().optional(),
        to: z.number().optional(),
      }),
      outputSchema: z.object({
        users: z.array(z.any()), // or your user type
        count: z.number(),
      }),
    },
    adminUpdateUser: {
      inputSchema: usersUpdateSchema.merge(z.object({
        role: z.enum(['admin', 'staff', 'community_admin']),
      })),
      outputSchema: z.boolean(),
    },
    userRegister: {
      inputSchema: z.object({
        emailAddress: z.string().min(1).email(),
        password: z.string().min(8).max(20),
        invited_by: z.string().optional(),
      }),
      outputSchema: z.object({ status: z.string() }),
    },
    userDelete: {
      inputSchema: z.object({}),
      outputSchema: z.object({ status: z.string() }),
    },
    communityMatchWithManager: {
      inputSchema: z.object({
        managerId: z.string(),
        communityId: z.number(),
      }),
      outputSchema: z.array(z.any()), // returns insertResult.data (array of inserted rows)
    },
    adminUpdateUserAppmeta: {
      inputSchema: z.object({
        userId: z.string(),
        newAppMetadata: z.record(z.unknown()),
      }),
      outputSchema: z.boolean(),
    },
    staffRequest: {
      inputSchema: z.object({}),
      outputSchema: z.boolean(),
    },
    managerChangeStaffStatus: {
      inputSchema: z.object({
        targetUserId: z.string(),
        status: z.enum(['requested', 'accepted', 'rejected']).nullable(),
      }),
      outputSchema: z.boolean(),
    },
    adminGetUserData: {
      inputSchema: z.object({
        userId: z.string(),
      }),
      outputSchema: z.object({
        user: z.any(), // or your user type
      }),
    },
  }) as const;
export const validationSchema = (z: typeof Zod) =>
  ({
    'auth-function': authFunctionSchema(z),
    'big-function': bigFunctionSchema(z),
  }) as const;

// Infer the schema types
type BigFunctionSchema = ReturnType<typeof bigFunctionSchema>;
export type AuthFunctionSchema = ReturnType<typeof authFunctionSchema>;
export type ValidationSchema = ReturnType<typeof validationSchema>;
export type FunctionPaths<T extends keyof ValidationSchema>
  = keyof ValidationSchema[T];
// Utility type to get the outputSchema for a specific group and path
export type OutputSchema<
  T extends keyof ValidationSchema,
  P extends keyof ValidationSchema[T],
> = ValidationSchema[T][P] extends { outputSchema: Zod.ZodType<any, any, any> }
  ? Zod.infer<ValidationSchema[T][P]['outputSchema']>
  : never;

// Infer Zod types
type BigFunctionSchemaReturnType = {
  [K in keyof BigFunctionSchema]: Zod.infer<
    BigFunctionSchema[K]['outputSchema']
  >;
};

type AuthFunctionSchemaReturnType = {
  [K in keyof AuthFunctionSchema]: Zod.infer<
    AuthFunctionSchema[K]['outputSchema']
  >;
};

export type BigFunctionPaths = keyof BigFunctionSchemaReturnType;
export type AuthFunctionPaths = keyof AuthFunctionSchemaReturnType;
export type ValidationPaths = keyof ValidationSchema;

export const validateArgs = <T extends Zod.ZodRawShape>({
  args,
  schema,
}: {
  args: unknown;
  schema: Zod.ZodObject<T>;
}) => {
  const parsedArgs = schema.safeParse(args);

  if (!parsedArgs.success) {
    throw new Error(` Invalid args - ${JSON.stringify(parsedArgs.error)}`);
  }

  // Cast here
  return parsedArgs.data;
};
