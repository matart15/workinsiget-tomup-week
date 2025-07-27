import { useSearchParams } from 'react-router-dom';

export const usePaginationRouter = () => {
  const [searchParams] = useSearchParams();
  const page = searchParams.get('page');
  const size = searchParams.get('size');

  let pageResult = 1;
  if (typeof page === 'string') {
    const parsedPage = Number.parseInt(page, 10);
    if (!Number.isNaN(parsedPage) && parsedPage > 1) {
      pageResult = parsedPage;
    }
  }
  let sizeResult = 10;
  if (typeof size === 'string') {
    const parsedSize = Number.parseInt(size, 10);
    if (!Number.isNaN(parsedSize) && parsedSize > 0) {
      sizeResult = parsedSize;
    }
  }
  return {
    page: pageResult,
    size: sizeResult,
  };
};
