import { ChevronDownIcon } from '@radix-ui/react-icons';
import type {
  ColumnDef,
  PaginationState,
  Row,
  TableOptions,
  Table as TableType,
} from '@tanstack/react-table';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import type { ReactElement } from 'react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type IdType = {
  id: number | string;
};
type Selectable<TData> = {
  defaultSelections?: TData[];
  onRowSelectionChange: (a: TData[]) => void;
};
export type UseDataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  selectable?: Selectable<TData>;
  tableOptions?: Partial<TableOptions<TData>>;
  pagination?: {
    pageCount: number;
    pageIndex: number;
    pageSize: number;
    onPageChange: (fn: PaginationState) => void; // OnChangeFn<PaginationState>;
  };
};
export type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  renderTableTop?: (a: { table: TableType<TData> }) => ReactElement;
  selectable?: Selectable<TData>;
  table: TableType<TData>;
  rows?: {
    onRowClick: (a: { row: Row<TData> }) => void;
  };
};
export const ColumnHider = <TData,>({ table }: { table: TableType<TData> }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button type="button" variant="outline" className="ml-auto">
        Columns
        {' '}
        <ChevronDownIcon className="ml-2 size-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      {table
        .getAllColumns()
        .filter(column => column.getCanHide())
        .map(column => (
          <DropdownMenuCheckboxItem
            key={column.id}
            className="capitalize"
            checked={column.getIsVisible()}
            onCheckedChange={(value) => {
              column.toggleVisibility(!!value);
            }}
          >
            {column.id}
          </DropdownMenuCheckboxItem>
        ))}
    </DropdownMenuContent>
  </DropdownMenu>
);

export const DataTable = <TData extends IdType, TValue>({
  columns,
  renderTableTop,
  table,
  rows,
}: DataTableProps<TData, TValue>) => (
  <div className="w-full">
    <div className="flex items-center ">
      {renderTableTop ? renderTableTop({ table }) : null}
    </div>
    <Table>
      <TableHeader className=" bg-neutral-200">
        {table.getHeaderGroups().map(headerGroup => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map(header => (
              <TableHead
                key={header.id}
                style={{
                  width:
                    header.getSize() === Number.MAX_SAFE_INTEGER
                      ? 'auto'
                      : header.getSize(),
                }}
                className="text-xs text-neutral-500 "
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.length > 0
          ? (
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  onClick={() => {
                    rows?.onRowClick({ row });
                  }}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )
          : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
      </TableBody>
    </Table>
  </div>
);

const getSelectColumn = <TData, TValue>(
  columns: ColumnDef<TData, TValue>[],
): ColumnDef<TData, TValue>[] => [
  {
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => {
          row.toggleSelected(!!value);
        }}
        aria-label="Select row"
      />
    ),

    enableHiding: false,
    enableSorting: false,
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected()
          || (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => {
          table.toggleAllPageRowsSelected(!!value);
        }}
        aria-label="Select all"
      />
    ),

    id: 'select',
  },
  ...columns,
];

export const usePredefinedTableProps = <TData extends IdType, TValue>({
  columns,
  data,
  selectable,
  tableOptions,
  pagination,
}: UseDataTableProps<TData, TValue>) => {
  const defaultSelectionObject: Record<string, boolean> = {};
  for (const d of selectable?.defaultSelections ?? []) {
    const arrayIndex = data.findIndex(a => a.id === d.id);
    if (arrayIndex === -1) {
      continue;
    }
    defaultSelectionObject[arrayIndex] = true;
  }
  const [rowSelection, setRowSelection] = useState(defaultSelectionObject);

  if (selectable) {
    columns = getSelectColumn(columns);
  }
  const table = useReactTable({
    columns,
    data,
    defaultColumn: {
      maxSize: Number.MAX_SAFE_INTEGER,
      minSize: 0,
      size: Number.MAX_SAFE_INTEGER,
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    // onColumnFiltersChange: setColumnFilters,
    // onColumnVisibilityChange: setColumnVisibility,
    manualPagination: true,

    onPaginationChange: (paginationUpdateFn) => {
      if (!pagination) {
        return;
      }
      const updateFn
        = typeof paginationUpdateFn === 'function'
          ? paginationUpdateFn
          : (_a: PaginationState) => pagination;
      const newPaginationState = updateFn(pagination);
      pagination.onPageChange(newPaginationState);
    },
    onRowSelectionChange: (updateFn) => {
      if (!selectable) {
        return rowSelection;
      }

      const newRowSelection
        = typeof updateFn === 'function' ? updateFn(rowSelection) : updateFn;
      const selectedIndexes = Object.keys(newRowSelection);
      const selectedPages = selectedIndexes
        .map(indexStr => data[Number.parseInt(indexStr, 10)])
        .filter((value): value is TData => value !== undefined);
      selectable.onRowSelectionChange(selectedPages);
      setRowSelection(newRowSelection);
    },
    pageCount: pagination?.pageCount ?? 0,
    state: {
      //   sorting,
      pagination: {
        pageIndex: pagination?.pageIndex ?? 0,
        pageSize: pagination?.pageSize ?? 10,
      },

      //   columnFilters,
      //   columnVisibility,
      rowSelection,
    },
    ...tableOptions,
  });
  return {
    columns,
    selectable,
    table,
  };
};
