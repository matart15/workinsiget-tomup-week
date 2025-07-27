import { zodResolver } from '@hookform/resolvers/zod';
import type { DefaultValues } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { TypeOf, z } from 'zod';

import { sendErrorMessage } from '@/lib/logger';

export const useSpecForm = <ItemType extends z.ZodObject<z.ZodRawShape>>({
  onSubmit,
  schema,
  defaultValues,
}: {
  onSubmit: (v: z.infer<typeof schema>) => Promise<void> | void;
  schema: ItemType;
  defaultValues?: DefaultValues<TypeOf<ItemType>>;
}) => {
  const handleSubmit = async (values: z.infer<typeof schema>) => {
    try {
      await onSubmit(values);
      toast.success('成功');
    } catch (error) {
      sendErrorMessage('🚀 ~ error:', error);
      toast.error('リクエストが失敗しました');
    }
  };
  const form = useForm<z.infer<typeof schema>>({
    defaultValues,
    resolver: zodResolver(schema),
  });
  return {
    form,
    handleSubmit,
  };
};
