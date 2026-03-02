import { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
  ColumnFiltersState,
  RowSelectionState,
} from '@tanstack/react-table';
import { Button, Space, Tag, Tooltip, Popconfirm, Input, Typography } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { Product } from '../../types/Product';
import styles from './ProductsTable.module.css';

const { Text } = Typography;

interface ProductsTableProps {
  data: Product[];
  loading: boolean;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onBulkDelete: (ids: string[]) => void;
  selectedRowKeys: string[];
  onSelectionChange: (keys: string[]) => void;
}

const columnHelper = createColumnHelper<Product>();

export function ProductsTable({
  data,
  loading,
  onEdit,
  onDelete,
  onBulkDelete,
  selectedRowKeys,
  onSelectionChange,
}: ProductsTableProps) {
  const { t } = useTranslation();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
            className={styles.checkbox}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            className={styles.checkbox}
          />
        ),
        size: 40,
      }),
      columnHelper.accessor('name', {
        header: t('products.name'),
        cell: (info) => (
          <Text strong ellipsis={{ tooltip: info.getValue() }}>
            {info.getValue()}
          </Text>
        ),
        size: 200,
      }),
      columnHelper.accessor('description', {
        header: t('products.description'),
        cell: (info) => (
          <Text ellipsis={{ tooltip: info.getValue() || '-' }}>
            {info.getValue() || '-'}
          </Text>
        ),
        size: 300,
      }),
      columnHelper.accessor('price', {
        header: t('products.price'),
        cell: (info) => (
          <Text strong style={{ color: '#52c41a' }}>
            ${info.getValue().toFixed(2)}
          </Text>
        ),
        size: 100,
      }),
      columnHelper.accessor('stock', {
        header: t('products.stock'),
        cell: (info) => {
          const stock = info.getValue();
          let color = 'green';
          if (stock === 0) color = 'red';
          else if (stock < 20) color = 'orange';
          return (
            <Tag color={color}>
              {stock} {t('products.units')}
            </Tag>
          );
        },
        size: 120,
      }),
      columnHelper.display({
        id: 'actions',
        header: t('common.actions'),
        cell: ({ row }) => (
          <Space size="small">
            <Tooltip title={t('common.edit')}>
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => onEdit(row.original)}
              />
            </Tooltip>
            <Popconfirm
              title={t('products.deleteConfirm')}
              description={t('products.deleteDescription')}
              onConfirm={() => onDelete(row.original.id)}
              okText={t('common.yes')}
              cancelText={t('common.no')}
              okButtonProps={{ danger: true }}
            >
              <Tooltip title={t('common.delete')}>
                <Button type="text" danger icon={<DeleteOutlined />} />
              </Tooltip>
            </Popconfirm>
          </Space>
        ),
        size: 100,
      }),
    ],
    [onEdit, onDelete, t]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      rowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (row) => row.id,
  });

  // Sync selection with parent
  useMemo(() => {
    const selectedIds = Object.keys(rowSelection).filter(
      (key) => rowSelection[key]
    );
    if (JSON.stringify(selectedIds) !== JSON.stringify(selectedRowKeys)) {
      onSelectionChange(selectedIds);
    }
  }, [rowSelection, selectedRowKeys, onSelectionChange]);

  const selectedCount = Object.keys(rowSelection).filter(
    (k) => rowSelection[k]
  ).length;

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <Input
          prefix={<SearchOutlined />}
          placeholder={t('products.searchPlaceholder')}
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          style={{ width: 300 }}
          allowClear
        />
        {selectedCount > 0 && (
          <Popconfirm
            title={t('products.deleteConfirmBulk', { count: selectedCount })}
            description={t('products.deleteDescription')}
            onConfirm={() => {
              onBulkDelete(Object.keys(rowSelection).filter((k) => rowSelection[k]));
              setRowSelection({});
            }}
            okText={t('common.yes')}
            cancelText={t('common.no')}
            okButtonProps={{ danger: true }}
          >
            <Button danger icon={<DeleteOutlined />}>
              {t('products.deleteSelected')} ({selectedCount})
            </Button>
          </Popconfirm>
        )}
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    style={{ width: header.getSize() }}
                    className={
                      header.column.getCanSort() ? styles.sortable : ''
                    }
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className={styles.headerContent}>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {header.column.getCanSort() && (
                        <span className={styles.sortIcon}>
                          {{
                            asc: <SortAscendingOutlined />,
                            desc: <SortDescendingOutlined />,
                          }[header.column.getIsSorted() as string] ?? null}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className={styles.loading}>
                  {t('products.loading')}
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className={styles.empty}>
                  {t('products.noProducts')}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={row.getIsSelected() ? styles.selected : ''}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className={styles.pagination}>
        <Space>
          <Text type="secondary">
            {t('products.showing', { shown: table.getRowModel().rows.length, total: data.length })}
          </Text>
        </Space>
        <Space>
          <Button
            size="small"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            {'<<'}
          </Button>
          <Button
            size="small"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {'<'}
          </Button>
          <Text>
            {t('products.page')} {table.getState().pagination.pageIndex + 1} {t('products.of')}{' '}
            {table.getPageCount()}
          </Text>
          <Button
            size="small"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {'>'}
          </Button>
          <Button
            size="small"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            {'>>'}
          </Button>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className={styles.pageSize}
          >
            {[10, 20, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size} {t('products.perPage')}
              </option>
            ))}
          </select>
        </Space>
      </div>
    </div>
  );
}
