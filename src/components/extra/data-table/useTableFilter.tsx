import type { Table as TableType } from '@tanstack/react-table';
import type { FC } from 'react';
import { useState } from 'react';
import type { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAllSearchParams } from '@/hooks/useAllSearchParams';
import { cn } from '@/lib/utils';

const downloadAsCsv = <F extends z.ZodRawShape>(
  table: TableType<{
    [K in keyof z.objectUtil.addQuestionMarks<
      z.baseObjectOutputType<F>
    >]: z.objectUtil.addQuestionMarks<z.baseObjectOutputType<F>>[K];
  }>,
) => {
  return () => {
    const headers = table.getAllLeafColumns();
    const csvContent = [
      headers.map(header => header.columnDef.header ?? header.id).join(','),
      ...table.getRowModel().rows.map(row =>
        headers
          .map((header) => {
            const cellValue = row.getValue(header.id);
            return typeof cellValue === 'string'
              ? `"${cellValue.replace(/"/g, '""')}"`
              : cellValue;
          })
          .join(','),
      ),
    ].join('\n');
    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'download.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
};

const hasTruthyValues = <T extends z.ZodRawShape>({
  params,
  filterSchema,
}: {
  params: Record<string, string>;
  filterSchema: z.ZodObject<T>;
}) => {
  const schemaKeys = Object.keys(filterSchema.shape);
  // Get schema keys dynamically from Zod schema

  // Filter the params to only include keys that are in the schema

  const filteredParams = Object.keys(params)
    .filter(key => schemaKeys.includes(key)) // Keep only valid keys
    .reduce((obj, key) => {
      // @ts-expect-error any
      obj[key] = params[key];
      return obj;
    }, {});

  // Check if any value in the filtered params is truthy
  return Object.values(filteredParams).some(value => Boolean(value));
};
export const useTableFilter = <
  T extends z.ZodRawShape,
  F extends z.ZodRawShape,
>({
  FilterDialogUI,
  schema: _schema,
  filterSchema,
  noFilter,
  showDownloadButton,
}: {
  FilterDialogUI: FC<{ open: boolean; setOpen: (open: boolean) => void }>;
  filterSchema: z.ZodObject<T>;
  schema: z.ZodObject<F>;
  noFilter?: boolean;
  showDownloadButton?: true;
}) => {
  const { changeSearchParam, params } = useAllSearchParams();
  const [searchText, setSearchText] = useState(params.search ?? '');
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const renderTableTop = ({
    table,
  }: {
    table: TableType<z.infer<typeof _schema>>;
  }) => {
    const currentPageIndex = table.getState().pagination.pageIndex;
    const currentPageNumber = currentPageIndex + 1;
    const currentPageFirstDataIndex
      = currentPageIndex * table.getState().pagination.pageSize + 1;
    const currentPageLastDataIndex
      = (currentPageIndex + 1) * table.getState().pagination.pageSize;
    const totalDataCount
      = table.getPageCount() * table.getState().pagination.pageSize;
    return (
      <div className="mx-6 flex flex-1 items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="検索..."
            className="w-36"
            value={searchText}
            onChange={(event) => {
              setSearchText(event.target.value);
            }}
          />

          <Button
            type="button"
            onClick={() => {
              changeSearchParam({ search: searchText }, { overwrite: true });
              window.location.reload();
            }}
            variant="outline"
          >
            検索
          </Button>
          {!noFilter && (
            <Button
              type="button"
              variant="outline"
              className={
                hasTruthyValues({
                  filterSchema,
                  params,
                })
                  ? 'bg-orange-400 text-destructive-foreground shadow-sm hover:bg-orange-200'
                  : ''
              }
              onClick={() => {
                setFilterDialogOpen(true);
              }}
            >
              絞り込み
            </Button>
          )}
          {showDownloadButton && (
            <Button
              type="button"
              variant="outline"
              onClick={downloadAsCsv<F>(table)}
            >
              ダウンロード
            </Button>
          )}
        </div>
        <div className="flex items-center ">
          <Select
            value={params.size ?? '10'}
            onValueChange={(value) => {
              changeSearchParam({ size: value }, { overwrite: true });
              window.location.reload();
            }}
          >
            <SelectTrigger className="h-8 w-12 p-0">
              <SelectValue placeholder={params.size ?? '10'} />
            </SelectTrigger>
            <SelectContent side="top">
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
              <SelectItem value="500">500</SelectItem>
            </SelectContent>
          </Select>
          <span className="no-wrap pr-4 text-xs">行</span>
          <div className=" whitespace-nowrap text-xs">{`${currentPageFirstDataIndex}-${currentPageLastDataIndex}/${totalDataCount}`}</div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => {
                    table.previousPage();
                  }}
                  className={cn([
                    ...(table.getCanPreviousPage()
                      ? []
                      : [
                          'pointer-events-none cursor-not-allowed text-gray-400',
                        ]),
                  ])}
                />
              </PaginationItem>
              {currentPageNumber - 1 > 1 && (
                <PaginationItem>
                  <PaginationLink
                    onClick={() => {
                      table.setPageIndex(0);
                    }}
                  >
                    1
                  </PaginationLink>
                </PaginationItem>
              )}
              {currentPageNumber - 2 > 1 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              {currentPageNumber > 1 && (
                <PaginationItem>
                  <PaginationLink
                    onClick={() => {
                      table.previousPage();
                    }}
                  >
                    {currentPageNumber - 1}
                  </PaginationLink>
                </PaginationItem>
              )}
              <PaginationItem>
                <PaginationLink isActive>{currentPageNumber}</PaginationLink>
              </PaginationItem>
              {currentPageNumber < table.getPageCount() && (
                <PaginationItem>
                  <PaginationLink
                    onClick={() => {
                      table.nextPage();
                    }}
                  >
                    {currentPageNumber + 1}
                  </PaginationLink>
                </PaginationItem>
              )}
              {currentPageNumber + 2 < table.getPageCount() && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              {currentPageNumber + 1 < table.getPageCount() && (
                <PaginationItem>
                  <PaginationLink
                    onClick={() => {
                      table.setPageIndex(table.getPageCount());
                    }}
                  >
                    {table.getPageCount()}
                  </PaginationLink>
                </PaginationItem>
              )}
              <PaginationItem>
                <PaginationNext
                  href=""
                  onClick={() => {
                    table.nextPage();
                  }}
                  className={cn([
                    ...(table.getCanNextPage()
                      ? []
                      : [
                          'pointer-events-none cursor-not-allowed text-gray-400',
                        ]),
                  ])}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    );
  };
  const FilterDialog = () => (
    <FilterDialogUI open={filterDialogOpen} setOpen={setFilterDialogOpen} />
  );

  return {
    FilterDialog,
    renderTableTop,
  };
};
