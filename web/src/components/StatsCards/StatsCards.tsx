import { Card, Statistic, Row, Col } from 'antd';
import {
  ShoppingOutlined,
  DollarOutlined,
  InboxOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { Product } from '../../types/Product';

interface StatsCardsProps {
  products: Product[];
  loading: boolean;
}

export function StatsCards({ products, loading }: StatsCardsProps) {
  const { t } = useTranslation();
  const totalProducts = products.length;
  const totalStock = products.reduce((acc, p) => acc + p.stock, 0);
  const totalValue = products.reduce((acc, p) => acc + p.price * p.stock, 0);
  const lowStockCount = products.filter((p) => p.stock < 20).length;

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} lg={6}>
        <Card bordered={false} loading={loading}>
          <Statistic
            title={t('stats.totalProducts')}
            value={totalProducts}
            prefix={<ShoppingOutlined />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card bordered={false} loading={loading}>
          <Statistic
            title={t('stats.unitsInStock')}
            value={totalStock}
            prefix={<InboxOutlined />}
            valueStyle={{ color: '#722ed1' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card bordered={false} loading={loading}>
          <Statistic
            title={t('stats.inventoryValue')}
            value={totalValue}
            prefix={<DollarOutlined />}
            precision={2}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card bordered={false} loading={loading}>
          <Statistic
            title={t('stats.lowStockThreshold')}
            value={lowStockCount}
            prefix={<WarningOutlined />}
            valueStyle={{ color: lowStockCount > 0 ? '#faad14' : '#52c41a' }}
          />
        </Card>
      </Col>
    </Row>
  );
}
