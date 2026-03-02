import { useState } from 'react';
import { Card, Form, Input, Button, Typography, message, Tabs, Space, Select } from 'antd';
import { UserOutlined, LockOutlined, IdcardOutlined, GlobalOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import styles from './LoginPage.module.css';

const { Title, Text } = Typography;

export function LoginPage() {
  const { login, register, isLoading } = useAuth();
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('login');
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const handleLogin = async (values: { username: string; password: string }) => {
    try {
      await login(values);
      message.success(t('auth.welcomeBack'));
    } catch (error) {
      message.error(error instanceof Error ? error.message : t('auth.loginError'));
    }
  };

  const handleRegister = async (values: { username: string; password: string; fullName: string }) => {
    try {
      await register(values);
      message.success(t('auth.accountCreated'));
    } catch (error) {
      message.error(error instanceof Error ? error.message : t('auth.registerError'));
    }
  };

  const items = [
    {
      key: 'login',
      label: t('auth.login'),
      children: (
        <Form
          form={loginForm}
          name="login"
          onFinish={handleLogin}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: t('auth.usernameRequired') }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder={t('auth.username')}
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: t('auth.passwordRequired') }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder={t('auth.password')}
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={isLoading}>
              {t('auth.loginButton')}
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: 'register',
      label: t('auth.register'),
      children: (
        <Form
          form={registerForm}
          name="register"
          onFinish={handleRegister}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: t('auth.usernameRequired') },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder={t('auth.username')}
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            name="fullName"
            rules={[{ required: true, message: t('auth.fullNameRequired') }]}
          >
            <Input
              prefix={<IdcardOutlined />}
              placeholder={t('auth.fullName')}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: t('auth.passwordRequired') },
              { min: 6, message: t('auth.passwordMinLength') },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder={t('auth.password')}
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: t('auth.confirmPasswordRequired') },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error(t('auth.passwordsMustMatch')));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder={t('auth.confirmPassword')}
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={isLoading}>
              {t('auth.registerButton')}
            </Button>
          </Form.Item>
        </Form>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div className={styles.header}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Select
                value={i18n.language.split('-')[0]}
                onChange={handleLanguageChange}
                style={{ width: 110 }}
                size="small"
                suffixIcon={<GlobalOutlined />}
                options={[
                  { value: 'en', label: '🇺🇸 English' },
                  { value: 'es', label: '🇪🇸 Español' },
                ]}
              />
            </Space>
            <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
              📦 Warehouse Manager
            </Title>
            <Text type="secondary">{t('auth.welcomeSubtitle')}</Text>
          </div>

          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={items}
            centered
          />

          <div className={styles.demo}>
            <Text type="secondary">
              Demo: <strong>demo</strong> / <strong>demo123</strong>
            </Text>
          </div>
        </Space>
      </Card>
    </div>
  );
}
