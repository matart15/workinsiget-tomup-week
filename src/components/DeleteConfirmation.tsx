import { TrashIcon } from '@radix-ui/react-icons';
import type { PostgrestSingleResponse } from '@supabase/supabase-js';
import type { ReactNode } from 'react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

export const DeleteConfirmation = ({
  onOk,
  buttonClassName,
  trigger,
}: {
  onOk: () => Promise<void | PostgrestSingleResponse<null>>;
  buttonClassName?: string;
  trigger?: ReactNode;
}) => (
  <AlertDialog>
    <AlertDialogTrigger asChild>
      {trigger ?? (
        <TrashIcon
          className={cn(['h-4 w-4 text-primary text-red-600', buttonClassName])}
        />
      )}
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>確認</AlertDialogTitle>
        <AlertDialogDescription>
          データがサーバーから削除されます。
          こちらのアクションは戻すことができません。 よろしいですか？
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>いいえ</AlertDialogCancel>
        <AlertDialogAction
          onClick={async () => {
            const result = await onOk();
            if (result?.error) {
              if (result.error.code === '23503') {
                toast.error('データは使用されているため削除できません');
                return;
              }
              toast.error('削除に失敗しました');
            } else {
              toast.success('成功');
            }
          }}
        >
          はい
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);
