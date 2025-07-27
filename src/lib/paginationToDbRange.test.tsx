import { expect } from 'vitest';

import { paginationToDbRange } from './paginationToDbRange';

it('should return correct values when page and size are provided', () => {
  const result = paginationToDbRange({ page: 2, size: 5 });

  expect(result).toEqual({ from: 5, to: 9 });
});

it('should return correct values when page is zero', () => {
  const result = paginationToDbRange({ page: 0, size: 5 });

  expect(result).toEqual({ from: 0, to: 4 });
});

it('should return correct values when size is zero', () => {
  const result = paginationToDbRange({ page: 2, size: 0 });

  expect(result).toEqual({ from: 0, to: 0 });
});

it('should return correct values when page and size are negative', () => {
  const result = paginationToDbRange({ page: -2, size: -5 });

  expect(result).toEqual({ from: 0, to: 0 });
});

it('should return correct values when page and size are decimal', () => {
  const result = paginationToDbRange({ page: 2.5, size: 5.5 });

  expect(result).toEqual({ from: 5, to: 9 });
});
