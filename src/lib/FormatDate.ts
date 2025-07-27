import dayjs from 'dayjs';

export const FormatDate = (
  date?: Date,
  { format }: { format: string } = { format: 'YYYY-MM-DD' },
) => {
  if (!date || Number.isNaN(date.getTime())) {
    return '';
  }
  const currentDate = date ?? new Date();
  const formattedDate = dayjs(currentDate).format(format);

  return formattedDate;
};
