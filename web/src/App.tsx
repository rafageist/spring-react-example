import { BrowserRouter, Routes, Route, Navigate, NavLink, Outlet, useLocation } from 'react-router-dom';
import { ConfigProvider, Layout, Menu, Button, Space, Typography, Avatar, Dropdown, Select } from 'antd';
import {
  HomeOutlined,
  ShoppingOutlined,
  UserOutlined,
  LogoutOutlined,
  EnvironmentOutlined,
  AppstoreOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './components/LoginPage';
import { WarehouseCanvas } from './components/WarehouseCanvas';
import { ProductsPage } from './pages/ProductsPage';
import { LocationsPage } from './pages/LocationsPage';
import enUS from 'antd/locale/en_US';
import esES from 'antd/locale/es_ES';
import styles from './App.module.css';

const { Header, Content, Sider } = Layout;
const { Text } = Typography;

const antdLocales = {
  en: enUS,
  es: esES,
};

// Protected Route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const { t } = useTranslation();

  if (isLoading) {
    return <div className={styles.loading}>{t('common.loading')}</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Main Layout with sidebar
function MainLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: user?.fullName,
      disabled: true,
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t('auth.logout'),
      danger: true,
      onClick: logout,
    },
  ];

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: <NavLink to="/">{t('nav.warehouse')}</NavLink>,
    },
    {
      key: '/products',
      icon: <ShoppingOutlined />,
      label: <NavLink to="/products">{t('nav.products')}</NavLink>,
    },
    {
      key: '/locations',
      icon: <AppstoreOutlined />,
      label: <NavLink to="/locations">{t('nav.locations')}</NavLink>,
    },
  ];

  return (
    <Layout className={styles.mainLayout}>
      <Sider
        theme="light"
        breakpoint="lg"
        collapsedWidth={80}
        className={styles.sider}
      >
        <div className={styles.logo}>
          <EnvironmentOutlined style={{ fontSize: 24, color: '#1890ff' }} />
          <span className={styles.logoText}>Warehouse</span>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          className={styles.menu}
        />
      </Sider>

      <Layout>
        <Header className={styles.header}>
          <div className={styles.headerContent}>
            <Space>
              <Text strong style={{ fontSize: 18 }}>
                {t('nav.systemTitle')}
              </Text>
            </Space>

            <Space>
              <Select
                value={i18n.language.split('-')[0]}
                onChange={handleLanguageChange}
                style={{ width: 110 }}
                suffixIcon={<GlobalOutlined />}
                options={[
                  { value: 'en', label: '🇺🇸 English' },
                  { value: 'es', label: '🇪🇸 Español' },
                ]}
              />
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <Button type="text" className={styles.userButton}>
                  <Space>
                    <Avatar size="small" icon={<UserOutlined />} />
                    <Text>{user?.username}</Text>
                  </Space>
                </Button>
              </Dropdown>
            </Space>
          </div>
        </Header>

        <Content className={styles.content}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}

// App Router
function AppRouter() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
        }
      />
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<WarehouseCanvas />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/locations" element={<LocationsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Main App Component
function App() {
  const { i18n } = useTranslation();
  const currentLang = i18n.language.split('-')[0] as keyof typeof antdLocales;
  const antdLocale = antdLocales[currentLang] || antdLocales.en;

  return (
    <ConfigProvider
      locale={antdLocale}
      theme={{
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 8,
        },
      }}
    >
      <BrowserRouter>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
