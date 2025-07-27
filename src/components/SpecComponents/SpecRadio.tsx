import type { ComponentProps } from 'react';
import type { FieldPath, UseFormReturn } from 'react-hook-form';

import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';

type RadioOption = {
  label: string;
  value: string;
  description?: string;
};

type CustomRadioProps = {
  options: RadioOption[];
  RadioGroupProps?: ComponentProps<typeof RadioGroup>;
  RadioGroupItemProps?: ComponentProps<typeof RadioGroupItem>;
};

export const SpecRadio = <F extends Record<string, string | undefined>>(
  props:
    | (CustomRadioProps & { selectedValue?: string })
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
    } & CustomRadioProps),
) => {
  const { RadioGroupProps, RadioGroupItemProps } = props;

  if (!('formProps' in props)) {
    return (
      <RadioGroup {...RadioGroupProps}>
        {props.options.map(option => (
          <div
            key={option.value}
            className={cn([
              'mb-4 flex items-center justify-between rounded-md  p-3',
              ...(option.value === props.selectedValue
                ? [' border-orange bg-orange/30 border']
                : []),
            ])}
          >
            <Label htmlFor={option.value} className={cn('font-bold')}>
              {option.label}
              {option.description && (
                <p className={cn('text-sm font-normal text-gray-500')}>
                  {option.description}
                </p>
              )}
            </Label>
            <RadioGroupItem
              value={option.value}
              id={option.value}
              className={cn([
                'text-orange',
                ...(option.value === props.selectedValue
                  ? ['border-orange']
                  : ['border-black']),
              ])}
              {...RadioGroupItemProps}
            />
          </div>
        ))}
      </RadioGroup>
    );
  }

  const { formProps } = props;
  const {
    form,
    fieldName,
    label,
    isRequired,
    description,
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
          {...(formProps.isHorizontal
            ? {
                className: 'flex flex-row space-y-0',
              }
            : {})}
          {...FormItemProps}
        >
          <FormLabel
            {...(formProps.isHorizontal
              ? {
                  className: 'w-[210px] self-center',
                }
              : {})}
            {...FormLabelProps}
          >
            {label}
            {isRequired && (
              <Label className="text-gray text-require ml-2 text-[12px] font-normal leading-4">
                必須
              </Label>
            )}
          </FormLabel>
          <FormControl {...FormControlProps}>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="space-y-1"
              {...RadioGroupProps}
            >
              {props.options.map(option => (
                <div
                  key={option.value}
                  className={cn([
                    'mb-4 flex items-center justify-between rounded-md  p-3',
                    ...(option.value === field.value
                      ? [' border-orange bg-orange/30 border']
                      : []),
                  ])}
                >
                  <Label htmlFor={option.value} className={cn('font-bold')}>
                    {option.label}
                    {option.description && (
                      <p className={cn('text-gray text-sm font-normal')}>
                        {option.description}
                      </p>
                    )}
                  </Label>
                  <RadioGroupItem
                    value={option.value}
                    id={option.value}
                    className={cn([
                      'text-orange',
                      ...(option.value === field.value
                        ? ['border-orange']
                        : ['border-black']),
                    ])}
                    {...RadioGroupItemProps}
                  />
                </div>
              ))}
            </RadioGroup>
          </FormControl>
          <FormDescription {...FormDescriptionProps}>
            {description}
          </FormDescription>
          <FormMessage {...FormMessageProps} />
        </FormItem>
      )}
    />
  );
};
