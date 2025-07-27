'use client';

import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import * as React from 'react';
import type { DayPickerSingleProps } from 'react-day-picker';

import { cn } from '@/lib/utils';

import { Button } from '../ui/button';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

export const DatePicker = ({
  date,
  setDate,
  calendarProps,

  formatDate = date1 =>
    date1
      ? (
          <span>{format(date1, 'PPP', { locale: ja })}</span>
        )
      : (
          <span>日付を選んでください</span>
        ),
}: {
  date?: Date;
  setDate: (date?: Date) => void;
  calendarProps?: DayPickerSingleProps;
  formatDate?: (date?: Date) => React.ReactNode;
}) => {
  const [open, setOpen] = React.useState<boolean>();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !date && 'text-muted-foreground',
            calendarProps?.className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatDate(date)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          initialFocus
          selected={date}
          locale={ja}
          onSelect={(date1) => {
            setDate(date1);
            setOpen(false);
          }}
          {...calendarProps}
        />
      </PopoverContent>
    </Popover>
  );
};
