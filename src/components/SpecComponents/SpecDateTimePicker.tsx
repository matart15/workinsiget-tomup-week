import type { ComponentProps, ReactElement } from 'react';
import type {
  FieldPath,
  FieldValues,
  PathValue,
  UseFormReturn,
} from 'react-hook-form';

import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

import { DateTimePicker } from '../extra/DateTimePicker';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';

export const SpecDateTimePicker = <F extends FieldValues>(
  props:
    | ComponentProps<typeof DateTimePicker>
    | ({
      formProps: {
        isHorizontal?: boolean;
        isRequired?: boolean;
        form: UseFormReturn<F>;
        fieldName: FieldPath<F>;
        label?:
          | string
          | ((value: PathValue<F, FieldPath<F>>) => string | ReactElement);
        description?:
          | string
          | ((value: PathValue<F, FieldPath<F>>) => string | ReactElement);
        FormItemProps?: ComponentProps<typeof FormItem>;
        FormLabelProps?: ComponentProps<typeof FormLabel>;
        FormControlProps?: ComponentProps<typeof FormControl>;
        FormDescriptionProps?: ComponentProps<typeof FormDescription>;
        FormMessageProps?: ComponentProps<typeof FormMessage>;
      };
    } & Omit<ComponentProps<typeof DateTimePicker>, 'onChange'> & {
      useStringValue?: boolean;
    }),
) => {
  if (!('formProps' in props)) {
    return <DateTimePicker {...props} />;
  }

  const { formProps, useStringValue, ...inputProps } = props;
  const {
    form,
    fieldName,
    label,
    description,
    isHorizontal,
    isRequired,
    FormItemProps,
    FormLabelProps,
    FormControlProps,
    FormDescriptionProps,
    FormMessageProps,
  } = formProps;

  return (
    <FormField
      control={form.control}
      name={fieldName}
      render={({ field }) => (
        <FormItem
          className={cn(
            isHorizontal && 'flex flex-row space-y-0',
            FormItemProps?.className,
          )}
          {...FormItemProps}
        >
          {label && (
            <FormLabel
              className={cn(
                isRequired && 'required',
                formProps.isHorizontal ? 'w-[210px] self-center' : '',
                FormLabelProps?.className,
              )}
              {...FormLabelProps}
            >
              {typeof label === 'function' ? label(field.value) : label}
              {isRequired && (
                <Label
                  className={cn([
                    'text-gray text-require ml-2 text-[12px] font-normal leading-4',
                  ])}
                >
                  必須
                </Label>
              )}
            </FormLabel>
          )}
          <FormControl
            className={cn(
              isHorizontal && 'col-span-3',
              'text-gray text-require text-[12px] font-normal leading-4',
              FormControlProps?.className,
            )}
            {...FormControlProps}
          >
            <DateTimePicker
              {...inputProps}
              value={field.value ? new Date(field.value) : undefined}
              className="max-w-[400px] flex-1"
              onChange={(date) => {
                if (useStringValue) {
                  field.onChange(date?.toISOString());
                } else {
                  field.onChange(date);
                }
              }}
              granularity="minute"
            />
          </FormControl>
          {description && (
            <FormDescription
              className={cn(
                isHorizontal && 'col-span-3 col-start-2',
                FormDescriptionProps?.className,
              )}
              {...FormDescriptionProps}
            >
              {typeof description === 'function'
                ? description(field.value)
                : description}
            </FormDescription>
          )}
          <FormMessage
            className={cn(
              isHorizontal && 'col-span-3 col-start-2',
              FormMessageProps?.className,
            )}
            {...FormMessageProps}
          />
        </FormItem>
      )}
    />
  );
};
