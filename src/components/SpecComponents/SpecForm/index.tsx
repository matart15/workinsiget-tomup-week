import type { ComponentProps, ReactNode } from 'react';
import type { FieldValues, UseFormReturn } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';

export const SpecForm = <F extends FieldValues>({
  onSubmit,
  form,
  children,
  htmlFormProps,
  buttonProps,
}: {
  onSubmit: (v: F) => Promise<void> | void;
  form: UseFormReturn<F>;
  children?: ReactNode;
  htmlFormProps?: ComponentProps<'form'>;
  buttonProps?: ComponentProps<typeof Button> & {
    noSubmitButton?: boolean;
    text?: string;
  };
}) => {
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
        {...htmlFormProps}
      >
        {children}
        {!buttonProps?.noSubmitButton && (
          <Button type="submit" {...buttonProps}>
            {buttonProps?.text ?? '保存'}
          </Button>
        )}
      </form>
    </Form>
  );
};
