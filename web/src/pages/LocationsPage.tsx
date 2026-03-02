import { useState, useCallback } from 'react';
import { Card, Table, Button, Space, Typography, Modal, Form, Input, InputNumber, ColorPicker, Popconfirm, Tag, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { ColumnsType } from 'antd/es/table';
import { Location } from '../types/Warehouse';
import {
  useLocations,
  useCreateLocation,
  useUpdateLocation,
  useDeleteLocation,
} from '../hooks/useWarehouse';
import styles from './LocationsPage.module.css';

const { Text, Title } = Typography;

export function LocationsPage() {
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [form] = Form.useForm();

  const { data: locations = [], isLoading, refetch } = useLocations();
  const createMutation = useCreateLocation();
  const updateMutation = useUpdateLocation();
  const deleteMutation = useDeleteLocation();

  const handleCreate = useCallback(() => {
    setEditingLocation(null);
    form.resetFields();
    form.setFieldsValue({
      x: 50,
      y: 50,
      width: 200,
      height: 150,
      color: '#e6f7ff',
      borderColor: '#1890ff',
      capacity: 100,
    });
    setModalOpen(true);
  }, [form]);

  const handleEdit = useCallback((location: Location) => {
    setEditingLocation(location);
    form.setFieldsValue({
      name: location.name,
      description: location.description,
      x: location.x,
      y: location.y,
      width: location.width,
      height: location.height,
      color: location.color,
      borderColor: location.borderColor,
      capacity: location.capacity,
    });
    setModalOpen(true);
  }, [form]);

  const handleDelete = useCallback((id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => message.success(t('locations.deleteSuccess')),
    });
  }, [deleteMutation, t]);

  const handleSubmit = useCallback(async () => {
    try {
      const values = await form.validateFields();
      // Convert color picker values to hex strings
      const locationData = {
        ...values,
        color: typeof values.color === 'string' ? values.color : values.color?.toHexString?.() || '#e6f7ff',
        borderColor: typeof values.borderColor === 'string' ? values.borderColor : values.borderColor?.toHexString?.() || '#1890ff',
      };

      if (editingLocation) {
        updateMutation.mutate(
          { id: editingLocation.id, location: locationData },
          {
            onSuccess: () => {
              message.success(t('locations.updateSuccess'));
              setModalOpen(false);
            },
          }
        );
      } else {
        createMutation.mutate(locationData, {
          onSuccess: () => {
            message.success(t('locations.createSuccess'));
            setModalOpen(false);
          },
        });
      }
    } catch {
      // Validation failed
    }
  }, [form, editingLocation, createMutation, updateMutation, t]);

  const columns: ColumnsType<Location> = [
    {
      title: t('locations.color'),
      dataIndex: 'color',
      key: 'color',
      width: 80,
      render: (color: string, record) => (
        <div
          style={{
            width: 40,
            height: 30,
            backgroundColor: color,
            border: `2px solid ${record.borderColor}`,
            borderRadius: 4,
          }}
        />
      ),
    },
    {
      title: t('locations.name'),
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: t('locations.description'),
      dataIndex: 'description',
      key: 'description',
      render: (desc: string) => <Text type="secondary">{desc || '-'}</Text>,
    },
    {
      title: `${t('locations.position')} (X, Y)`,
      key: 'position',
      render: (_, record) => (
        <Tag color="blue">{record.x}, {record.y}</Tag>
      ),
    },
    {
      title: `${t('locations.size')} (W × H)`,
      key: 'size',
      render: (_, record) => (
        <Tag color="purple">{record.width} × {record.height}</Tag>
      ),
    },
    {
      title: t('locations.capacity'),
      dataIndex: 'capacity',
      key: 'capacity',
      render: (capacity: number) => <Tag color="green">{capacity} {t('locations.capacityUnits')}</Tag>,
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title={t('locations.deleteConfirm')}
            description={t('locations.deleteDescription')}
            onConfirm={() => handleDelete(record.id)}
            okText={t('common.delete')}
            cancelText={t('common.cancel')}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Space>
          <EnvironmentOutlined style={{ fontSize: 24, color: '#1890ff' }} />
          <Title level={4} style={{ margin: 0 }}>{t('locations.management')}</Title>
          <Tag color="blue">{locations.length} {t('locations.title').toLowerCase()}</Tag>
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
          >
            {t('locations.newLocation')}
          </Button>
        </Space>
      </div>

      <Card className={styles.tableCard}>
        <Table
          dataSource={locations}
          columns={columns}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingLocation ? t('locations.editLocation') : t('locations.newLocation')}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        okText={editingLocation ? t('common.save') : t('common.create')}
        cancelText={t('common.cancel')}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        width={600}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item
            name="name"
            label={t('locations.name')}
            rules={[{ required: true, message: t('locations.nameRequired') }]}
          >
            <Input placeholder={t('locations.zonePlaceholder')} />
          </Form.Item>

          <Form.Item name="description" label={t('locations.description')}>
            <Input.TextArea placeholder={t('locations.zoneDescPlaceholder')} rows={2} />
          </Form.Item>

          <Space size="large" style={{ width: '100%' }}>
            <Form.Item
              name="x"
              label={t('locations.positionX')}
              rules={[{ required: true }]}
              style={{ flex: 1 }}
            >
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
            <Form.Item
              name="y"
              label={t('locations.positionY')}
              rules={[{ required: true }]}
              style={{ flex: 1 }}
            >
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
            <Form.Item
              name="width"
              label={t('locations.width')}
              rules={[{ required: true }]}
              style={{ flex: 1 }}
            >
              <InputNumber style={{ width: '100%' }} min={50} />
            </Form.Item>
            <Form.Item
              name="height"
              label={t('locations.height')}
              rules={[{ required: true }]}
              style={{ flex: 1 }}
            >
              <InputNumber style={{ width: '100%' }} min={50} />
            </Form.Item>
          </Space>

          <Space size="large" style={{ width: '100%' }}>
            <Form.Item name="color" label={t('locations.color')} style={{ flex: 1 }}>
              <ColorPicker format="hex" showText />
            </Form.Item>
            <Form.Item name="borderColor" label={t('locations.borderColor')} style={{ flex: 1 }}>
              <ColorPicker format="hex" showText />
            </Form.Item>
            <Form.Item
              name="capacity"
              label={t('locations.capacity')}
              rules={[{ required: true }]}
              style={{ flex: 1 }}
            >
              <InputNumber style={{ width: '100%' }} min={1} />
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </div>
  );
}
