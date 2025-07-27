import dayjs from 'dayjs';
import { useState } from 'react';
import type {
  ControllerRenderProps,
  FieldPath,
  FieldValues,
  UseFormReturn,
} from 'react-hook-form';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

type DateSelectorType = {
  year?: boolean;
  month?: boolean;
  day?: boolean;
};

const FormFieldRender = <F extends FieldValues, TName extends FieldPath<F>>({
  field,
  isHorizontal,
  isRequired,
  type = { day: true, month: true, year: true },
  label,
}: {
  field: ControllerRenderProps<F, TName>;
  isHorizontal?: boolean;
  isRequired?: boolean;
  type?: DateSelectorType;
  label: string;
}) => {
  const [initYear = '', initMonth = '', initDay = ''] = (
    field.value ?? ''
  ).split('-');

  const finalYear = type.year ? initYear : dayjs().format('YYYY');
  const finalMonth = type.month ? initMonth : '01';
  const finalDay = type.day ? initDay : '01';

  const [selectedYear, setSelectedYear] = useState<string>(finalYear);
  const [selectedMonth, setSelectedMonth] = useState<string>(finalMonth);
  const [selectedDay, setSelectedDay] = useState<string>(finalDay);

  // Set initial value if not provided
  if (!field.value) {
    field.onChange(undefined);
  }

  // Update date field with current selections
  const updateDateField = (year: string, month: string, day: string) => {
    const updatedYear = type.year ? year : dayjs().format('YYYY');
    const updatedMonth = type.month ? month : '01';
    const updatedDay = type.day ? day : '01';

    // Only set a value if all required fields are selected
    if ((type.year && !year) || (type.month && !month) || (type.day && !day)) {
      field.onChange(undefined);
      return;
    }

    field.onChange(`${updatedYear}-${updatedMonth}-${updatedDay}`);
  };

  const handleYearChange = (value: string) => {
    setSelectedYear(value);
    updateDateField(value, selectedMonth, selectedDay);
  };

  const handleMonthChange = (value: string) => {
    setSelectedMonth(value);
    updateDateField(selectedYear, value, selectedDay);
  };

  const handleDayChange = (value: string) => {
    setSelectedDay(value);
    updateDateField(selectedYear, selectedMonth, value);
  };

  // Generate options for years from current year to 1900
  const generateYearOptions = () => {
    const currentYear = dayjs().year();
    const years = [];
    for (let year = currentYear; year >= 1900; year -= 1) {
      years.push(year.toString());
    }
    return years;
  };

  // Generate options for months from 1 to 12
  const generateMonthOptions = () => {
    const months = [];
    for (let month = 1; month <= 12; month += 1) {
      months.push(month.toString().padStart(2, '0')); // Zero-padding month
    }
    return months;
  };

  // Generate options for days based on selected year and month
  const generateDayOptions = () => {
    if (selectedYear === '' || selectedMonth === '') {
      return [];
    }
    const year = Number.parseInt(selectedYear, 10);
    const month = Number.parseInt(selectedMonth, 10);
    const daysInMonth = dayjs(`${year}-${month}`, 'YYYY-MM').daysInMonth();
    const days = Array.from({ length: daysInMonth }, (_, index) =>
      (index + 1).toString().padStart(2, '0'));
    return days;
  };

  const years = generateYearOptions();
  const months = generateMonthOptions();
  const days = generateDayOptions();

  return (
    <FormItem
      className={cn('flex-1', isHorizontal ? 'flex flex-row space-y-0' : '')}
    >
      <FormLabel
        className={cn(
          'block text-sm leading-4 text-gray-600',
          isHorizontal ? 'w-[210px] self-center' : '',
        )}
      >
        {label}
        {isRequired && (
          <Label className="ml-2 text-[12px] font-normal leading-4 text-red-600">
            必須
          </Label>
        )}
      </FormLabel>
      <FormControl>
        <div className=" flex max-w-[400px] flex-1 items-center justify-start space-x-4 ">
          {type.year
            ? (
                <Select onValueChange={handleYearChange} value={selectedYear}>
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {years.map(year => (
                        <SelectItem key={year} value={year}>
                          {year}
                          年
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )
            : null}
          {type.month
            ? (
                <Select onValueChange={handleMonthChange} value={selectedMonth}>
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {months.map(month => (
                        <SelectItem key={month} value={month}>
                          {month}
                          月
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )
            : null}
          {type.day
            ? (
                <Select onValueChange={handleDayChange} value={selectedDay}>
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {days.map(day => (
                        <SelectItem key={day} value={day}>
                          {day}
                          日
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )
            : null}
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
};

export const SpecDateSelector = <F extends FieldValues>({
  formProps,
}: {
  formProps: {
    form: UseFormReturn<F>;
    fieldName: FieldPath<F>;
    isHorizontal?: boolean;
    isRequired?: boolean;
    type?: DateSelectorType;
    label: string;
  };
}) => {
  const {
    form,
    fieldName,
    isHorizontal,
    isRequired,
    type = { day: true, month: true, year: true },
    label,
  } = formProps;
  return (
    <FormField
      control={form.control}
      name={fieldName}
      render={({ field }) => (
        <FormFieldRender
          field={field}
          isHorizontal={isHorizontal}
          isRequired={isRequired}
          type={type}
          label={label}
        />
      )}
    />
  );
};
