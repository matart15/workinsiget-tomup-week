import type { ComponentProps } from 'react';
import type { FieldPath, FieldValues, UseFormReturn } from 'react-hook-form';

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

type OptionString
  = | { label: string; value: string }
    | { group: string; values: { label: string; value: string }[] };

type OptionNumber
  = | { label: string; value: number }
    | { group: string; values: { label: string; value: number }[] };

type OptionBoolean = {
  label: string;
  value: boolean;
};

type Options = OptionString[] | OptionNumber[] | OptionBoolean[];
type CustomSelectProps = {
  options: Options;
  useEmptyOption?: boolean;
  SelectProps?: ComponentProps<typeof Select> & {
    onValueChange?: (value: string | number) => void;
  };
  SelectTriggerProps?: ComponentProps<typeof SelectTrigger>;
  SelectContentProps?: ComponentProps<typeof SelectContent>;
  SelectGroupProps?: ComponentProps<typeof SelectGroup>;
  SelectLabelProps?: ComponentProps<typeof SelectLabel>;
  SelectItemProps?: ComponentProps<typeof SelectItem>;
  SelectValueProps?: ComponentProps<typeof SelectValue>;
};
const isNumber = ({ options }: { options: Options }) => {
  const firstOption = options[0];

  if (!firstOption) {
    // If options array is empty, return false (or handle it as needed)
    return false;
  }

  if ('value' in firstOption) {
    // If the first option has a value, check if it's a number
    return typeof firstOption.value === 'number';
  } else if ('values' in firstOption && firstOption.values.length > 0) {
    // If it's a group, check if the first group's value is a number
    return typeof firstOption.values[0]?.value === 'number';
  }

  return false;
};

const isBoolean = ({ options }: { options: Options }) => {
  const firstOption = options[0];
  if (!firstOption) {
    return false;
  }

  if ('value' in firstOption) {
    return typeof firstOption.value === 'boolean';
  }
  return false;
};

export const SpecSelect = <F extends FieldValues>(
  props:
    | CustomSelectProps
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
    } & CustomSelectProps),
) => {
  const {
    SelectProps,
    SelectTriggerProps,
    SelectContentProps,
    SelectGroupProps,
    SelectLabelProps,
    SelectItemProps,
    SelectValueProps,
  } = props;
  if (!('formProps' in props)) {
    return (
      <Select
        onValueChange={(value) => {
          const onValueChange = SelectProps?.onValueChange;
          if (!onValueChange) {
            return;
          }
          const isNumberOption = isNumber({ options: props.options });
          if (isNumberOption) {
            if (value === '' || value === '-' || value === '.') {
              onValueChange(value);
              return;
            }
            const numericValue = Number(value);
            if (!Number.isNaN(numericValue)) {
              onValueChange(numericValue);
            }
            return;
          }
          onValueChange(value);
        }}
        {...SelectProps}
      >
        <SelectTrigger className="w-[180px]" {...SelectTriggerProps}>
          <SelectValue {...SelectValueProps} />
        </SelectTrigger>
        <SelectContent {...SelectContentProps}>
          {props.options.map((option) => {
            if (!('group' in option)) {
              return (
                <SelectItem
                  key={option.value.toString()}
                  value={
                    typeof option.value !== 'string'
                      ? option.value.toString()
                      : option.value
                  }
                  {...SelectItemProps}
                >
                  {option.label}
                </SelectItem>
              );
            }
            const group = option;
            return (
              <SelectGroup key={group.group} {...SelectGroupProps}>
                <SelectLabel {...SelectLabelProps}>{group.group}</SelectLabel>
                {group.values.map(groupOption => (
                  <SelectItem
                    key={groupOption.value}
                    value={
                      typeof groupOption.value === 'number'
                        ? groupOption.value.toString()
                        : groupOption.value
                    }
                    {...SelectItemProps}
                  >
                    {groupOption.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            );
          })}
        </SelectContent>
      </Select>
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
            className={cn(
              'text-gray-600',
              formProps.isHorizontal ? 'w-[210px] self-center' : '',
            )}
            {...FormLabelProps}
          >
            {label}
            {isRequired && (
              <Label className="ml-2 text-[12px] font-normal leading-4 text-gray-600 text-red-600">
                必須
              </Label>
            )}
          </FormLabel>
          <div className="h-[44px] flex-1 bg-white">
            <Select
              onValueChange={(value) => {
                const isNumberOption = isNumber({ options: props.options });
                if (isNumberOption) {
                  if (value === '') {
                    field.onChange(undefined); // we allow clear option
                    return;
                  }
                  const numericValue = Number(value);
                  if (!isNaN(numericValue)) {
                    field.onChange(numericValue);
                  }
                  return;
                }
                const isBooleanOption = isBoolean({ options: props.options });
                if (isBooleanOption) {
                  field.onChange(value === 'true');
                  return;
                }
                field.onChange(value);
              }}
              defaultValue={
                typeof field.value === 'number'
                  ? field.value.toString()
                  : typeof field.value === 'boolean'
                    ? field.value.toString()
                    : field.value
              }
              {...SelectProps}
            >
              <FormControl
                className="h-[44px] flex-1 bg-white"
                {...FormControlProps}
              >
                <SelectTrigger className="w-full" {...SelectTriggerProps}>
                  <SelectValue {...SelectValueProps} />
                </SelectTrigger>
              </FormControl>
              <SelectContent {...SelectContentProps}>
                {props.useEmptyOption && (
                  <SelectItem
                    // @ts-expect-error ts thinks field.value is always string
                    value={null}
                    className="w-full"
                    {...SelectItemProps}
                  >
                    None
                  </SelectItem>
                )}
                {props.options.map((option) => {
                  if (!('group' in option)) {
                    return (
                      <SelectItem
                        key={option.value.toString()}
                        value={
                          typeof option.value !== 'string'
                            ? option.value.toString()
                            : option.value
                        }
                        {...SelectItemProps}
                      >
                        {option.label}
                      </SelectItem>
                    );
                  }
                  const group = option;
                  return (
                    <SelectGroup key={group.group} {...SelectGroupProps}>
                      <SelectLabel {...SelectLabelProps}>
                        {group.group}
                      </SelectLabel>
                      {group.values.map(groupOption => (
                        <SelectItem
                          key={groupOption.value}
                          value={
                            typeof groupOption.value === 'number'
                              ? groupOption.value.toString()
                              : groupOption.value
                          }
                          {...SelectItemProps}
                        >
                          {groupOption.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  );
                })}
              </SelectContent>
            </Select>
            <FormDescription {...FormDescriptionProps}>
              {description}
            </FormDescription>
            <FormMessage {...FormMessageProps} />
          </div>
        </FormItem>
      )}
    />
  );
};
