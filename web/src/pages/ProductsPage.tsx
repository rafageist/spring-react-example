import { useState, useCallback } from 'react';
import { Card, Button, Space, Typography, Spin, Result } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { ProductsTable } from '../components/ProductsTable';
import { ProductFormModal } from '../components/ProductFormModal';
import { StatsCards } from '../components/StatsCards';
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useBulkDeleteProducts,
} from '../hooks/useProducts';
import { Product, ProductCreate } from '../types/Product';
import styles from './ProductsPage.module.css';

const { Text } = Typography;

export function ProductsPage() {
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);

  const { data: products = [], isLoading, isError, refetch } = useProducts();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();
  const bulkDeleteMutation = useBulkDeleteProducts();

  const handleCreate = useCallback(() => {
    setEditingProduct(null);
    setModalOpen(true);
  }, []);

  const handleEdit = useCallback((product: Product) => {
    setEditingProduct(product);
    setModalOpen(true);
  }, []);

  const handleDelete = useCallback(
    (id: string) => {
      deleteMutation.mutate(id);
    },
    [deleteMutation]
  );

  const handleBulkDelete = useCallback(
    (ids: string[]) => {
      bulkDeleteMutation.mutate(ids, {
        onSuccess: () => setSelectedRowKeys([]),
      });
    },
    [bulkDeleteMutation]
  );

  const handleSubmit = useCallback(
    (values: ProductCreate) => {
      if (editingProduct) {
        updateMutation.mutate(
          { id: editingProduct.id, product: values },
          {
            onSuccess: () => {
              setModalOpen(false);
              setEditingProduct(null);
            },
          }
        );
      } else {
        createMutation.mutate(values, {
          onSuccess: () => {
            setModalOpen(false);
          },
        });
      }
    },
    [editingProduct, createMutation, updateMutation]
  );

  const handleCancel = useCallback(() => {
    setModalOpen(false);
    setEditingProduct(null);
  }, []);

  if (isError) {
    return (
      <div className={styles.container}>
        <Result
          status="error"
          title={t('errors.loadingProductsFailed')}
          subTitle={t('errors.connectionError')}
          extra={[
            <Button
              key="retry"
              type="primary"
              onClick={() => refetch()}
              icon={<ReloadOutlined />}
            >
              {t('common.retry')}
            </Button>,
          ]}
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Space>
          <Text strong style={{ fontSize: 20 }}>
            {t('products.management')}
          </Text>
        </Space>
        <Space>
          <Button
            icon={<ReloadOutlined spin={isLoading} />}
            onClick={() => refetch()}
          >
            {t('common.refresh')}
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
            size="large"
          >
            {t('products.newProduct')}
          </Button>
        </Space>
      </div>

      <Spin spinning={isLoading && products.length === 0} size="large">
        <StatsCards products={products} loading={isLoading} />

        <Card
          title={
            <Space>
              <Text strong style={{ fontSize: 16 }}>
                {t('products.productsList')}
              </Text>
              <Text type="secondary">({products.length} {t('common.records')})</Text>
            </Space>
          }
          className={styles.tableCard}
          bordered={false}
        >
          <ProductsTable
            data={products}
            loading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onBulkDelete={handleBulkDelete}
            selectedRowKeys={selectedRowKeys}
            onSelectionChange={setSelectedRowKeys}
          />
        </Card>
      </Spin>

      <ProductFormModal
        open={modalOpen}
        product={editingProduct}
        loading={createMutation.isPending || updateMutation.isPending}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}
