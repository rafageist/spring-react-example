import { useRef, useState, useEffect, useCallback } from 'react';
import { Stage, Layer, Rect, Text, Group, Circle, Transformer } from 'react-konva';
import { Card, Spin, Typography, Space, Tag, Button, Empty, Modal, Form, Input, InputNumber, ColorPicker } from 'antd';
import { ZoomInOutlined, ZoomOutOutlined, ReloadOutlined, PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import Konva from 'konva';
import { useProducts } from '../../hooks/useProducts';
import { useLocations, useUpdateProductPosition, useCreateLocation, useUpdateLocation } from '../../hooks/useWarehouse';
import { Product } from '../../types/Product';
import { Location } from '../../types/Warehouse';
import styles from './WarehouseCanvas.module.css';

const { Title, Text: AntText } = Typography;

const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 600;
const MIN_SCALE = 0.5;
const MAX_SCALE = 2;

interface ProductNode {
  product: Product;
  x: number;
  y: number;
}

export function WarehouseCanvas() {
  const { t } = useTranslation();
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [stageSize, setStageSize] = useState({ width: CANVAS_WIDTH, height: CANVAS_HEIGHT });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [locationForm] = Form.useForm();

  const { data: products = [], isLoading: productsLoading, refetch: refetchProducts } = useProducts();
  const { data: locations = [], isLoading: locationsLoading, refetch: refetchLocations } = useLocations();
  const updatePositionMutation = useUpdateProductPosition();
  const createLocationMutation = useCreateLocation();
  const updateLocationMutation = useUpdateLocation();

  // Resize handler
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        setStageSize({
          width: Math.max(width - 48, 800),
          height: CANVAS_HEIGHT,
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = scale;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const newScale = e.evt.deltaY > 0
      ? Math.max(oldScale - 0.1, MIN_SCALE)
      : Math.min(oldScale + 0.1, MAX_SCALE);

    setScale(newScale);
  }, [scale]);

  const handleProductDragEnd = useCallback(
    (product: Product, e: Konva.KonvaEventObject<DragEvent>) => {
      const node = e.target;
      const newX = node.x();
      const newY = node.y();

      // Find if dropped on a location
      let droppedLocationId: string | undefined;
      for (const location of locations) {
        if (
          newX >= location.x &&
          newX <= location.x + location.width &&
          newY >= location.y &&
          newY <= location.y + location.height
        ) {
          droppedLocationId = location.id;
          break;
        }
      }

      updatePositionMutation.mutate({
        productId: product.id,
        position: {
          posX: newX,
          posY: newY,
          locationId: droppedLocationId ?? null, // Explicitly set null to remove location
        },
      });
    },
    [locations, updatePositionMutation]
  );

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.2, MAX_SCALE));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.2, MIN_SCALE));
  const handleReset = () => {
    setScale(1);
    refetchProducts();
    refetchLocations();
  };

  // Handle location drag - move location and all products inside
  const handleLocationDragEnd = useCallback(
    (location: Location, e: Konva.KonvaEventObject<DragEvent>) => {
      const node = e.target;
      const newX = node.x();
      const newY = node.y();
      const deltaX = newX - location.x;
      const deltaY = newY - location.y;

      // Update location position
      updateLocationMutation.mutate(
        { id: location.id, location: { x: newX, y: newY } },
        {
          onSuccess: () => {
            // Update only products that have saved positions (not auto-arranged)
            const productsInLocation = products.filter(p => p.location?.id === location.id);
            productsInLocation.forEach(product => {
              // Only update products that have explicit positions saved
              if (product.posX !== null && product.posX !== undefined &&
                  product.posY !== null && product.posY !== undefined) {
                const newPosX = product.posX + deltaX;
                const newPosY = product.posY + deltaY;
                updatePositionMutation.mutate({
                  productId: product.id,
                  position: { posX: newPosX, posY: newPosY, locationId: location.id },
                });
              }
            });
          },
        }
      );
    },
    [products, updateLocationMutation, updatePositionMutation]
  );

  // Handle location resize
  const handleLocationTransform = useCallback(
    (location: Location, node: Konva.Node) => {
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();
      const newX = node.x();
      const newY = node.y();
      const newWidth = Math.max(100, Math.round(location.width * scaleX));
      const newHeight = Math.max(80, Math.round(location.height * scaleY));
      
      // Reset scale to 1 (we're converting scale to actual dimensions)
      node.scaleX(1);
      node.scaleY(1);

      console.log('Transform location:', { newX, newY, newWidth, newHeight, scaleX, scaleY });

      updateLocationMutation.mutate({
        id: location.id,
        location: {
          x: newX,
          y: newY,
          width: newWidth,
          height: newHeight,
        },
      });
    },
    [updateLocationMutation]
  );

  // Create new location
  const handleCreateLocation = () => {
    locationForm.resetFields();
    locationForm.setFieldsValue({
      x: 50,
      y: 50,
      width: 200,
      height: 150,
      capacity: 50,
      color: '#e6f7ff',
      borderColor: '#1890ff',
    });
    setIsLocationModalOpen(true);
  };

  const handleLocationModalOk = async () => {
    try {
      const values = await locationForm.validateFields();
      const colorValue = typeof values.color === 'string' ? values.color : values.color?.toHexString?.() || '#e6f7ff';
      const borderColorValue = typeof values.borderColor === 'string' ? values.borderColor : values.borderColor?.toHexString?.() || '#1890ff';
      
      createLocationMutation.mutate(
        {
          name: values.name,
          description: values.description || '',
          x: values.x,
          y: values.y,
          width: values.width,
          height: values.height,
          capacity: values.capacity,
          color: colorValue,
          borderColor: borderColorValue,
        },
        {
          onSuccess: () => {
            setIsLocationModalOpen(false);
            locationForm.resetFields();
          },
        }
      );
    } catch (error) {
      // Validation failed
    }
  };

  // Deselect when clicking on stage background
  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target === e.target.getStage()) {
      setSelectedLocation(null);
      setSelectedProduct(null);
    }
  };

  const isLoading = productsLoading || locationsLoading;

  // Calculate product positions - products with a location are placed inside that location
  const productNodes: ProductNode[] = products.map((product) => {
    // If product has a location assigned, calculate position within that location
    if (product.location) {
      const location = locations.find(loc => loc.id === product.location?.id);
      if (location) {
        // If product has saved position inside the location, use it
        if (product.posX !== null && product.posX !== undefined && 
            product.posY !== null && product.posY !== undefined) {
          return { product, x: product.posX, y: product.posY };
        }
        // Otherwise, auto-arrange products within the location
        const productsInLocation = products.filter(p => p.location?.id === location.id);
        const productIndex = productsInLocation.findIndex(p => p.id === product.id);
        const cols = Math.floor(location.width / 80);
        const col = productIndex % cols;
        const row = Math.floor(productIndex / cols);
        return {
          product,
          x: location.x + 10 + col * 75,
          y: location.y + 40 + row * 60,
        };
      }
    }
    // Products without location go to the "unassigned" area at the bottom
    const unassignedProducts = products.filter(p => !p.location);
    const unassignedIndex = unassignedProducts.findIndex(p => p.id === product.id);
    return {
      product,
      x: product.posX ?? 50 + (unassignedIndex % 10) * 80,
      y: product.posY ?? 480 + Math.floor(unassignedIndex / 10) * 60,
    };
  });

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <Spin size="large" tip={t('warehouse.loading')} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <div className={styles.header}>
          <Space>
            <Title level={4} style={{ margin: 0 }}>{t('warehouse.title')}</Title>
            <Tag color="blue">{locations.length} {t('warehouse.zones')}</Tag>
            <Tag color="green">{products.length} {t('warehouse.products')}</Tag>
          </Space>
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateLocation}>
              {t('warehouse.newZone')}
            </Button>
            <Button icon={<ZoomOutOutlined />} onClick={handleZoomOut} disabled={scale <= MIN_SCALE} />
            <AntText>{Math.round(scale * 100)}%</AntText>
            <Button icon={<ZoomInOutlined />} onClick={handleZoomIn} disabled={scale >= MAX_SCALE} />
            <Button icon={<ReloadOutlined />} onClick={handleReset}>{t('warehouse.resetView')}</Button>
          </Space>
        </div>

        <div ref={containerRef} className={styles.canvasContainer}>
          {locations.length === 0 && products.length === 0 ? (
            <Empty
              description={t('warehouse.noZonesOrProducts')}
              style={{ padding: 60 }}
            />
          ) : (
            <Stage
              ref={stageRef}
              width={stageSize.width}
              height={stageSize.height}
              scaleX={scale}
              scaleY={scale}
              onWheel={handleWheel}
              onClick={handleStageClick}
              onTap={handleStageClick}
              draggable
              className={styles.stage}
            >
              {/* Grid background */}
              <Layer>
                <Rect
                  x={0}
                  y={0}
                  width={CANVAS_WIDTH}
                  height={CANVAS_HEIGHT}
                  fill="#f8f9fa"
                />
              </Layer>

              {/* Locations Layer */}
              <Layer>
                {locations.map((location) => (
                  <LocationZone
                    key={location.id}
                    location={location}
                    isSelected={selectedLocation?.id === location.id}
                    onSelect={() => {
                      setSelectedLocation(location);
                      setSelectedProduct(null);
                    }}
                    onDragEnd={(e) => handleLocationDragEnd(location, e)}
                    onTransformEnd={(node) => handleLocationTransform(location, node)}
                  />
                ))}
              </Layer>

              {/* Products Layer */}
              <Layer>
                {productNodes.map(({ product, x, y }) => (
                  <ProductItem
                    key={product.id}
                    product={product}
                    x={x}
                    y={y}
                    isSelected={selectedProduct?.id === product.id}
                    onClick={() => {
                      setSelectedProduct(product);
                      setSelectedLocation(null);
                    }}
                    onDragEnd={(e) => handleProductDragEnd(product, e)}
                  />
                ))}
              </Layer>
            </Stage>
          )}
        </div>

        {selectedProduct && (
          <div className={styles.infoPanel}>
            <Card size="small" title={selectedProduct.name}>
              <Space direction="vertical" size="small">
                <AntText type="secondary">{selectedProduct.description}</AntText>
                <Space>
                  <Tag color="blue">${selectedProduct.price.toFixed(2)}</Tag>
                  <Tag color={selectedProduct.stock > 10 ? 'green' : 'red'}>
                    Stock: {selectedProduct.stock}
                  </Tag>
                </Space>
              </Space>
            </Card>
          </div>
        )}
      </Card>

      <div className={styles.legend}>
        <Title level={5}>{t('warehouse.legendTitle')}</Title>
        <Space wrap>
          {locations.map((location) => (
            <Tag
              key={location.id}
              color={location.color}
              style={{ borderColor: location.borderColor }}
            >
              {location.name}
            </Tag>
          ))}
        </Space>
      </div>

      {/* Modal for creating new location */}
      <Modal
        title={t('locations.newZoneTitle')}
        open={isLocationModalOpen}
        onOk={handleLocationModalOk}
        onCancel={() => setIsLocationModalOpen(false)}
        confirmLoading={createLocationMutation.isPending}
        okText={t('common.create')}
        cancelText={t('common.cancel')}
      >
        <Form form={locationForm} layout="vertical">
          <Form.Item
            name="name"
            label={t('locations.name')}
            rules={[{ required: true, message: t('locations.nameRequired') }]}
          >
            <Input placeholder={t('warehouse.zoneNamePlaceholder')} />
          </Form.Item>
          <Form.Item name="description" label={t('locations.description')}>
            <Input.TextArea rows={2} placeholder={t('warehouse.zoneDescriptionPlaceholder')} />
          </Form.Item>
          <Space style={{ display: 'flex' }} align="baseline">
            <Form.Item name="x" label={t('locations.positionX')} rules={[{ required: true }]}>
              <InputNumber min={0} max={CANVAS_WIDTH - 100} />
            </Form.Item>
            <Form.Item name="y" label={t('locations.positionY')} rules={[{ required: true }]}>
              <InputNumber min={0} max={CANVAS_HEIGHT - 80} />
            </Form.Item>
          </Space>
          <Space style={{ display: 'flex' }} align="baseline">
            <Form.Item name="width" label={t('locations.width')} rules={[{ required: true }]}>
              <InputNumber min={100} max={500} />
            </Form.Item>
            <Form.Item name="height" label={t('locations.height')} rules={[{ required: true }]}>
              <InputNumber min={80} max={400} />
            </Form.Item>
          </Space>
          <Form.Item name="capacity" label={t('locations.capacity')} rules={[{ required: true }]}>
            <InputNumber min={1} max={1000} />
          </Form.Item>
          <Space style={{ display: 'flex' }} align="baseline">
            <Form.Item name="color" label={t('locations.color')}>
              <ColorPicker />
            </Form.Item>
            <Form.Item name="borderColor" label={t('locations.borderColor')}>
              <ColorPicker />
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </div>
  );
}

// Location Zone Component - Draggable and Resizable
interface LocationZoneProps {
  location: Location;
  isSelected: boolean;
  onSelect: () => void;
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onTransformEnd: (node: Konva.Node) => void;
}

function LocationZone({ location, isSelected, onSelect, onDragEnd, onTransformEnd }: LocationZoneProps) {
  const [isHovered, setIsHovered] = useState(false);
  const groupRef = useRef<Konva.Group>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (isSelected && transformerRef.current && groupRef.current) {
      transformerRef.current.nodes([groupRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const handleTransformEnd = () => {
    const node = groupRef.current;
    if (node) {
      onTransformEnd(node);
    }
  };

  return (
    <>
      <Group
        ref={groupRef}
        x={location.x}
        y={location.y}
        width={location.width}
        height={location.height}
        draggable
        onDragEnd={onDragEnd}
        onTransformEnd={handleTransformEnd}
        onClick={(e) => {
          e.cancelBubble = true;
          onSelect();
        }}
        onTap={(e) => {
          e.cancelBubble = true;
          onSelect();
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Rect
          width={location.width}
          height={location.height}
          fill={location.color}
          stroke={isSelected ? '#1890ff' : location.borderColor}
          strokeWidth={isSelected ? 3 : isHovered ? 3 : 2}
          cornerRadius={8}
          shadowColor={isHovered || isSelected ? location.borderColor : undefined}
          shadowBlur={isHovered || isSelected ? 10 : 0}
          shadowOpacity={0.3}
        />
        <Text
          x={8}
          y={8}
          text={location.name}
          fontSize={14}
          fontStyle="bold"
          fill={location.borderColor}
          listening={false}
        />
        {location.description && (
          <Text
            x={8}
            y={26}
            text={location.description}
            fontSize={10}
            fill="#666"
            width={location.width - 16}
            listening={false}
          />
        )}
        <Text
          x={location.width - 50}
          y={location.height - 20}
          text={`Cap: ${location.capacity}`}
          fontSize={10}
          fill="#999"
          listening={false}
        />
      </Group>
      {isSelected && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            // Limit resize
            if (newBox.width < 100 || newBox.height < 80) {
              return oldBox;
            }
            return newBox;
          }}
          anchorSize={8}
          anchorCornerRadius={2}
          borderStroke="#1890ff"
          anchorFill="#fff"
          anchorStroke="#1890ff"
          rotateEnabled={false}
        />
      )}
    </>
  );
}

// Product Item Component
interface ProductItemProps {
  product: Product;
  x: number;
  y: number;
  isSelected: boolean;
  onClick: () => void;
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => void;
}

function ProductItem({ product, x, y, isSelected, onClick, onDragEnd }: ProductItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const stockColor = product.stock > 20 ? '#52c41a' : product.stock > 5 ? '#faad14' : '#ff4d4f';

  return (
    <Group
      x={x}
      y={y}
      draggable
      onClick={onClick}
      onTap={onClick}
      onDragEnd={onDragEnd}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product box */}
      <Rect
        width={70}
        height={50}
        fill={isSelected ? '#1890ff' : isHovered ? '#40a9ff' : '#fff'}
        stroke={isSelected ? '#096dd9' : '#d9d9d9'}
        strokeWidth={isSelected ? 2 : 1}
        cornerRadius={6}
        shadowColor={isHovered ? '#1890ff' : '#000'}
        shadowBlur={isHovered ? 8 : 3}
        shadowOpacity={isHovered ? 0.3 : 0.1}
        shadowOffsetY={2}
      />

      {/* Product icon */}
      <Text
        x={25}
        y={5}
        text="📦"
        fontSize={16}
      />

      {/* Product name (truncated) */}
      <Text
        x={5}
        y={25}
        text={product.name.length > 10 ? product.name.substring(0, 10) + '...' : product.name}
        fontSize={9}
        fill={isSelected ? '#fff' : '#333'}
        width={60}
        align="center"
      />

      {/* Stock indicator */}
      <Circle
        x={62}
        y={8}
        radius={6}
        fill={stockColor}
      />
      <Text
        x={56}
        y={3}
        text={product.stock.toString()}
        fontSize={8}
        fill="#fff"
        width={12}
        align="center"
      />
    </Group>
  );
}
