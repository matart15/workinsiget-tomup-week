import type { ComponentProps, ReactElement } from 'react';
import type {
  FieldPath,
  FieldValues,
  PathValue,
  UseFormReturn,
} from 'react-hook-form';

import { cn } from '@/lib/utils';

import { DatePicker } from '../extra/DatePicker';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Label } from '../ui/label';

export const SpecDatePicker = <F extends FieldValues>(
  props:
    | ComponentProps<typeof DatePicker>
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
    } & Omit<ComponentProps<typeof DatePicker>, 'setDate'> & {
      useStringValue?: boolean;
    }),
) => {
  if (!('formProps' in props)) {
    return <DatePicker {...props} />;
  }
  const { formProps, useStringValue, ...inputProps } = props;
  const {
    form,
    fieldName,
    label,
    description,
    FormItemProps,
    FormLabelProps,
    isRequired,
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
            <FormControl {...FormControlProps}>
              <DatePicker
                {...field}
                calendarProps={{
                  className: 'max-w-[400px] flex-1',
                  mode: 'single',
                }}
                {...inputProps}
                date={field.value}
                setDate={(a) => {
                  if (useStringValue) {
                    field.onChange(a?.toISOString());
                  } else {
                    field.onChange(a);
                  }
                }}
              />
            </FormControl>
            <FormDescription {...FormDescriptionProps}>
              {typeof description === 'function'
                ? description(field.value)
                : description}
            </FormDescription>
            <FormMessage {...FormMessageProps} />
          </FormItem>
        );
      }}
    />
  );
};
