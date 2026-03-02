import { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Button, Space, Select } from 'antd';
import { SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { Product, ProductCreate } from '../../types/Product';
import { useCategories, useLocations } from '../../hooks/useWarehouse';

interface ProductFormModalProps {
  open: boolean;
  product: Product | null;
  loading: boolean;
  onSubmit: (values: ProductCreate) => void;
  onCancel: () => void;
}

export function ProductFormModal({
  open,
  product,
  loading,
  onSubmit,
  onCancel,
}: ProductFormModalProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm<ProductCreate>();
  const isEditing = !!product;
  
  const { data: categories = [] } = useCategories();
  const { data: locations = [] } = useLocations();

  useEffect(() => {
    if (open) {
      if (product) {
        form.setFieldsValue({
          name: product.name,
          description: product.description || '',
          price: product.price,
          stock: product.stock,
          imageUrl: product.imageUrl || '',
          categoryId: product.category?.id,
          locationId: product.location?.id,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, product, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
    } catch {
      // Validation failed
    }
  };

  return (
    <Modal
      title={isEditing ? t('products.editProduct') : t('products.newProduct')}
      open={open}
      onCancel={onCancel}
      width={520}
      footer={
        <Space>
          <Button onClick={onCancel} icon={<CloseOutlined />}>
            {t('common.cancel')}
          </Button>
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={loading}
            icon={<SaveOutlined />}
          >
            {isEditing ? t('products.update') : t('common.create')}
          </Button>
        </Space>
      }
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          name: '',
          description: '',
          price: 0,
          stock: 0,
          imageUrl: '',
          categoryId: undefined,
          locationId: undefined,
        }}
        style={{ marginTop: 24 }}
      >
        <Form.Item
          name="name"
          label={t('products.productName')}
          rules={[
            { required: true, message: t('products.nameRequired') },
            { min: 3, message: t('products.minChars', { count: 3 }) },
            { max: 255, message: t('products.maxChars', { count: 255 }) },
          ]}
        >
          <Input placeholder={t('products.namePlaceholder')} size="large" />
        </Form.Item>

        <Form.Item
          name="description"
          label={t('products.description')}
          rules={[{ max: 1000, message: t('products.maxChars', { count: 1000 }) }]}
        >
          <Input.TextArea
            placeholder={t('products.descriptionPlaceholder')}
            rows={3}
            showCount
            maxLength={1000}
          />
        </Form.Item>

        <Space size="large" style={{ width: '100%' }}>
          <Form.Item
            name="price"
            label={t('products.priceLabel')}
            rules={[
              { required: true, message: t('products.priceRequired') },
              {
                type: 'number',
                min: 0,
                message: t('products.priceMustBePositive'),
              },
            ]}
            style={{ flex: 1 }}
          >
            <InputNumber
              style={{ width: '100%' }}
              size="large"
              min={0}
              step={0.01}
              precision={2}
              prefix="$"
              placeholder="0.00"
            />
          </Form.Item>

          <Form.Item
            name="stock"
            label={t('products.stockLabel')}
            rules={[
              { required: true, message: t('products.stockRequired') },
              {
                type: 'number',
                min: 0,
                message: t('products.stockMustBePositive'),
              },
            ]}
            style={{ flex: 1 }}
          >
            <InputNumber
              style={{ width: '100%' }}
              size="large"
              min={0}
              step={1}
              precision={0}
              placeholder="0"
            />
          </Form.Item>
        </Space>

        <Space size="large" style={{ width: '100%' }}>
          <Form.Item
            name="categoryId"
            label={t('products.category')}
            style={{ flex: 1 }}
          >
            <Select
              placeholder={t('products.selectCategory')}
              allowClear
              size="large"
              options={categories.map(cat => ({
                value: cat.id,
                label: (
                  <Space>
                    <span style={{ 
                      display: 'inline-block', 
                      width: 12, 
                      height: 12, 
                      borderRadius: 2,
                      backgroundColor: cat.color 
                    }} />
                    {cat.name}
                  </Space>
                ),
              }))}
            />
          </Form.Item>

          <Form.Item
            name="locationId"
            label={t('products.warehouseLocation')}
            style={{ flex: 1 }}
          >
            <Select
              placeholder={t('products.selectLocation')}
              allowClear
              size="large"
              options={locations.map(loc => ({
                value: loc.id,
                label: (
                  <Space>
                    <span style={{ 
                      display: 'inline-block', 
                      width: 12, 
                      height: 12, 
                      borderRadius: 2,
                      backgroundColor: loc.color,
                      border: `1px solid ${loc.borderColor}`
                    }} />
                    {loc.name}
                  </Space>
                ),
              }))}
            />
          </Form.Item>
        </Space>

        <Form.Item
          name="imageUrl"
          label={t('products.image')}
        >
          <Input placeholder={t('products.imageUrlPlaceholder')} size="large" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
