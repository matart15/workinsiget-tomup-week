import type { ComponentProps } from 'react';
import { useEffect, useRef } from 'react';
import type { FieldPath, FieldValues, UseFormReturn } from 'react-hook-form';

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

// Helper function to adjust textarea height
const adjustHeight = (textarea: HTMLTextAreaElement | null) => {
  if (!textarea) {
    return;
  }
  textarea.style.height = '0';
  textarea.style.height = `${textarea.scrollHeight}px`;
};

export const SpecTextarea = <F extends FieldValues>(
  props:
    | ComponentProps<typeof Textarea>
    | ({
      formProps: {
        isHorizontal?: boolean;
        form: UseFormReturn<F>;
        fieldName: FieldPath<F>;
        label?: string;
        isRequired?: boolean;
        description?: string;
        FormItemProps?: ComponentProps<typeof FormItem>;
        FormLabelProps?: ComponentProps<typeof FormLabel>;
        FormControlProps?: ComponentProps<typeof FormControl>;
        FormDescriptionProps?: ComponentProps<typeof FormDescription>;
        FormMessageProps?: ComponentProps<typeof FormMessage>;
      };
    } & ComponentProps<typeof Textarea>),
) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    adjustHeight(textareaRef.current);
  }, []); // Initial adjustment

  if (!('formProps' in props)) {
    return (
      <Textarea {...props} ref={textareaRef} className={props.className} />
    );
  }

  const { formProps, ...inputProps } = props;
  const {
    form,
    fieldName,
    label,
    description,
    FormItemProps,
    isRequired,
    FormLabelProps,
    FormControlProps,
    FormDescriptionProps,
    FormMessageProps,
  } = formProps;

  return (
    <FormField
      control={form.control}
      name={fieldName}
      render={({ field }) => {
        return (
          <FormItem
            {...(formProps.isHorizontal
              ? {
                  className: 'flex flex-row space-y-0',
                }
              : {})}
            {...FormItemProps}
          >
            <FormLabel
              className={cn(
                'text-gray-500',
                formProps.isHorizontal ? 'w-[210px] self-center' : '',
              )}
              {...FormLabelProps}
            >
              {label}
              {isRequired && (
                <Label className="ml-2 text-[12px] font-normal leading-4 text-red-600">
                  必須
                </Label>
              )}
            </FormLabel>
            <FormControl {...FormControlProps}>
              <Textarea
                {...field}
                ref={textareaRef}
                className={cn(
                  'max-w-[400px] flex-1 overflow-hidden bg-white',
                  typeof props.rows === 'number' && {
                    'min-height': `${props.rows * 1.5}rem`,
                  },
                  props.className,
                )}
                {...inputProps}
                onInput={(e) => {
                  adjustHeight(e.currentTarget);
                  field.onChange(e);
                }}
                value={
                  typeof field.value === 'string' || field.value === null
                    ? field.value
                    : JSON.stringify(field.value)
                }
              />
            </FormControl>
            <FormDescription {...FormDescriptionProps}>
              {description}
            </FormDescription>
            <FormMessage {...FormMessageProps} />
          </FormItem>
        );
      }}
    />
  );
};
