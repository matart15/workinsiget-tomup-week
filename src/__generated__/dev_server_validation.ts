import type { z as Zod } from 'zod';

const devFunctionSchema = (z: typeof Zod) => {
  const uComponentDefsRowSchema = z.object({
    account_id: z.string(),
    created_at: z.string().nullable(),
    created_by: z.string().nullable(),
    detail: z.string().nullable(),
    feature_id: z.string().nullable(),
    id: z.string(),
    name: z.string(),
    page_id: z.string().nullable(),
    parent_component_id: z.string().nullable(),
    path: z.string(),
    project_id: z.string().nullable(),
    updated_at: z.string().nullable(),
    updated_by: z.string().nullable(),
  });
  return ({
    checkFileOrFolderExistsLocal: {
      inputSchema: z.object({
        inputPath: z
          .string()
          .min(1, { message: 'inputPathを入力してください' }),
        isFolder: z.boolean(),
      }),
      outputSchema: z.boolean(),
    },
    getFileContentLocal: {
      inputSchema: z.object({
        inputPath: z
          .string()
          .min(1, { message: 'inputPathを入力してください' }),
      }),
      outputSchema: z.string(),
    },
    createFilesLocal: {
      inputSchema: z.object({
        parentFolderAbsolute: z
          .string()
          .min(1, { message: 'inputPathを入力してください' }),
        files: z.array(
          z.object({
            path: z.string().min(1, { message: 'pathを入力してください' }),
            content: z
              .string()
              .min(1, { message: 'contentを入力してください' }),
          }),
        ),
      }),
      outputSchema: z.string(),
    },
    openInEditorLocal: {
      inputSchema: z.object({
        absolutePath: z
          .string()
          .min(1, { message: 'absolutePathを入力してください' }),
        editor: z.enum(['vscode', 'cursor', 'windsurf']),
      }),
      outputSchema: z.string(),
    },
    listLocalComponentFilesLocal: {
      inputSchema: z.object({
        folderPath: z
          .string()
          .min(1, { message: 'folderPathを入力してください' }),
        isFolderComponents: z.boolean(),
        overrideNaming: z.boolean(),
      }),
      outputSchema: z.array(uComponentDefsRowSchema),
    },
    listLocalFiles: {
      inputSchema: z.object({
        folderPath: z
          .string()
          .min(1, { message: 'folderPathを入力してください' }),
        regex: z.string().min(1, { message: 'regexを入力してください' }),
      }),
      outputSchema: z.array(
        z.object({
          folderPath: z.string(),
          fileInfo: z.object({
            birthtime: z.string().nullable(),
            mtime: z.string().nullable(),
          }),
          regexMatches: z.array(z.string()).nullable(),
          relativePath: z.string(),
          name: z.string(),
        }),
      ),
    },
  }) as const;
};

export const validationSchema = (z: typeof Zod) =>
  ({
    'dev-function': devFunctionSchema(z),
  }) as const;

// Infer the schema types
type DevFunctionSchema = ReturnType<typeof devFunctionSchema>;
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
type DevFunctionSchemaReturnType = {
  [K in keyof DevFunctionSchema]: Zod.infer<
    DevFunctionSchema[K]['outputSchema']
  >;
};

export type DevFunctionPaths = keyof DevFunctionSchemaReturnType;
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
