export const paginationToDbRange = ({
  page,
  size,
}: {
  page: number;
  size: number;
}) => {
  // page is 1-indexed
  // from is 0-indexed
  // to is 0-indexed
  // size is total number of items per page
  // to is inclusive

  // if size is decimal, think it as Math.floor(size)
  let calculatedPage = Math.floor(page);
  // if page is less than 1, think it as 1
  if (calculatedPage < 1) {
    calculatedPage = 1;
  }
  // if size is less than 1, think it as 0
  let calculatedSize = Math.floor(size);
  // if page is decimal, think it as Math.floor(page)
  if (calculatedSize < 1) {
    calculatedSize = 0;
  }

  const from = Math.max(0, (calculatedPage - 1) * calculatedSize);
  const to = Math.max(0, from + calculatedSize - 1);

  console.log('🚀 ~ paginationToDbRange ~ input:', { page, size });
  console.log('🚀 ~ paginationToDbRange ~ calculated:', { calculatedPage, calculatedSize });
  console.log('🚀 ~ paginationToDbRange ~ output:', { from, to });

  return { from, to };
};
