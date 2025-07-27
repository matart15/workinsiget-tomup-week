import { expect, it, vi } from 'vitest';

import { usePaginationRouter } from './usePaginationRouter';

const mockSearchParams = {
  get: vi.fn(),
};

vi.mock('react-router-dom', () => ({
  useSearchParams: vi.fn(() => [mockSearchParams]),
}));

it('should return default values if page and size are not provided', () => {
  mockSearchParams.get.mockReturnValueOnce(null);
  mockSearchParams.get.mockReturnValueOnce(null);
  const result = usePaginationRouter();

  expect(result).toEqual({ page: 1, size: 10 });
});

it('should return default size if size is not a string', () => {
  mockSearchParams.get.mockReturnValueOnce('2');
  mockSearchParams.get.mockReturnValueOnce(null);
  const result = usePaginationRouter();

  expect(result).toEqual({ page: 2, size: 10 });
});

it('should return default page if page is not a string', () => {
  mockSearchParams.get.mockReturnValueOnce(null);
  mockSearchParams.get.mockReturnValueOnce('20');
  const result = usePaginationRouter();

  expect(result).toEqual({ page: 1, size: 20 });
});

it('should return parsed values if page and size are provided', () => {
  mockSearchParams.get.mockReturnValueOnce('3');
  mockSearchParams.get.mockReturnValueOnce('30');
  const result = usePaginationRouter();

  expect(result).toEqual({ page: 3, size: 30 });
});

it('should return default values if page and size are invalid', () => {
  mockSearchParams.get.mockReturnValueOnce('invalid');
  mockSearchParams.get.mockReturnValueOnce('-1');
  const result = usePaginationRouter();

  expect(result).toEqual({ page: 1, size: 10 });
});
