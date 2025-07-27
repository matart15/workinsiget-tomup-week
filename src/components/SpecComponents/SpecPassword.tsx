import { EyeIcon, EyeOffIcon } from 'lucide-react';
import type { ComponentProps, ReactElement } from 'react';
import { useState } from 'react';
import type {
  FieldPath,
  FieldValues,
  PathValue,
  UseFormReturn,
} from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const useShowButton = () => {
  const [showPassword, setShowPassword] = useState(false);

  const ShowButton = () => (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="absolute bottom-0 right-0 top-0 h-full px-3 hover:bg-transparent"
      onClick={() => {
        setShowPassword(prev => !prev);
      }}
    >
      {!showPassword
        ? (
            <EyeIcon className="text-gray h-4 w-4" aria-hidden="true" />
          )
        : (
            <EyeOffIcon className="text-gray h-4 w-4" aria-hidden="true" />
          )}
      <span className="sr-only">
        {showPassword ? 'Hide password' : 'Show password'}
      </span>
    </Button>
  );

  return { ShowButton, showPassword };
};

export const SpecPassword = <F extends FieldValues>(
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
      };
    } & ComponentProps<typeof Input>),
) => {
  const { ShowButton, showPassword } = useShowButton();
  if (!('formProps' in props)) {
    return (
      <div className="relative">
        <Input
          {...props}
          className={props.className}
          type={showPassword ? 'text' : 'password'}
        />

        <ShowButton />
      </div>
    );
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
            <FormControl {...FormControlProps}>
              <div className="relative">
                <Input
                  {...field}
                  className="h-[44px] max-w-[400px] rounded bg-white"
                  {...inputProps}
                  value={field.value ?? ''}
                  onChange={(event) => {
                    if (props.type === 'number') {
                      const value = event.target.value;
                      if (value === '' || value === '-' || value === '.') {
                        field.onChange(value);
                        return;
                      }
                      const numericValue = Number(value);
                      if (!isNaN(numericValue)) {
                        field.onChange(numericValue);
                      }
                      return;
                    }
                    field.onChange(event.target.value);
                  }}
                  type={showPassword ? 'text' : 'password'}
                />

                <ShowButton />
              </div>
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
