import type { ComponentProps, ReactElement } from 'react';
import type {
  FieldPath,
  FieldValues,
  PathValue,
  UseFormReturn,
} from 'react-hook-form';

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export const SpecInput = <F extends FieldValues>(
  props:
    | ComponentProps<typeof Input>
    | ({
      formProps: {
        isHorizontal?: boolean;
        form: UseFormReturn<F>;
        fieldName: FieldPath<F>;
        isRequired?: boolean;
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
        emptyStringTo?: 'undefined' | 'null' | 'empty';
      };
    } & ComponentProps<typeof Input>),
) => {
  if (!('formProps' in props)) {
    return <Input {...props} className={props.className} />;
  }
  const { formProps, ...inputProps } = props;
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
    emptyStringTo = 'empty',
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
            {label && (
              <FormLabel
                className={cn(
                  'text-gray-600',
                  formProps.isHorizontal ? 'w-[210px] self-center' : '',
                )}
                {...FormLabelProps}
              >
                {typeof label === 'function' ? label(field.value) : label}
                {isRequired && (
                  <Label
                    className={cn([
                      'text-require ml-2 text-[12px] font-normal leading-4 text-red-600',
                    ])}
                  >
                    必須
                  </Label>
                )}
              </FormLabel>
            )}
            <div className="h-[44px]  flex-1 ">
              <FormControl {...FormControlProps}>
                <Input
                  {...field}
                  className="h-[44px] max-w-[400px] flex-1 bg-white"
                  {...inputProps}
                  value={field.value ?? ''}
                  onChange={(event) => {
                    if (event.target.value === '') {
                      if (emptyStringTo === 'undefined') {
                        field.onChange(undefined);
                        return;
                      }
                      if (emptyStringTo === 'null') {
                        field.onChange(null);
                        return;
                      }
                      if (emptyStringTo === 'empty') {
                        field.onChange('');
                        return;
                      }
                    }
                    if (props.type === 'number') {
                      const value = event.target.value;
                      if (value === '' || value === '-' || value === '.') {
                        field.onChange(value);
                        return;
                      }
                      const numericValue = Number(value);
                      if (!Number.isNaN(numericValue)) {
                        field.onChange(numericValue);
                      }
                      return;
                    }
                    field.onChange(event.target.value);
                  }}
                />
              </FormControl>
              <FormDescription {...FormDescriptionProps}>
                {typeof description === 'function'
                  ? description(field.value)
                  : description}
              </FormDescription>
              <FormMessage {...FormMessageProps} />
            </div>
          </FormItem>
        );
      }}
    />
  );
};
