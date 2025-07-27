import { AlertTriangle } from 'lucide-react';
import type { ComponentProps } from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

'use client';

type Props = Omit<ComponentProps<typeof Button>, 'formAction'> & {
  pendingText?: string;
  formAction: (
    prevState: any,
    formData: FormData,
  ) => Promise<any>;
  errorMessage?: string;
};

const initialState = {
  message: '',
};

export const SubmitButton = ({
  children,
  formAction,
  errorMessage,
  pendingText = 'Submitting...',
  ...props
}: Props) => {
  const { pending, action } = useFormStatus();
  const [state, internalFormAction] = useActionState<
    { message: string },
    FormData
  >(formAction, initialState);

  const isPending = pending && action === internalFormAction;

  return (
    <div className="flex w-full flex-col gap-y-4">
      {Boolean(errorMessage ?? state?.message) && (
        <Alert variant="destructive" className="w-full">
          <AlertTriangle className="size-4" />
          <AlertDescription>{errorMessage ?? state?.message ?? ''}</AlertDescription>
        </Alert>
      )}
      <div>
        <Button
          {...props}
          type="submit"
          aria-disabled={pending}
          formAction={internalFormAction}
        >
          {isPending ? pendingText : children}
        </Button>
      </div>
    </div>
  );
};
