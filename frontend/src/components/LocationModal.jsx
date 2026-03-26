import { useState } from 'react';
import {
  Modal, Tabs, Input, Button, Form, Space, Typography, DatePicker, Divider
} from 'antd';
import {
  EnvironmentOutlined, AimOutlined, SearchOutlined, HomeOutlined, CalendarOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text } = Typography;
const { RangePicker } = DatePicker;

const LOCATION_TYPES = [
  {
    key: 'city',
    label: 'City',
    icon: <HomeOutlined />,
    placeholder: 'e.g. New York, Tokyo, London',
    hint: 'Enter a city name, optionally with country code (e.g. "Paris, FR")',
  },
  {
    key: 'zip',
    label: 'Zip / Postal Code',
    icon: <EnvironmentOutlined />,
    placeholder: 'e.g. 10001, SW1A 1AA',
    hint: 'Enter a zip or postal code, optionally with country code (e.g. "10001,US")',
  },
  {
    key: 'gps',
    label: 'GPS Coordinates',
    icon: <AimOutlined />,
    placeholder: 'e.g. 40.7128,-74.0060',
    hint: 'Enter coordinates as "lat,lon" (e.g. "40.7128,-74.0060")',
  },
  {
    key: 'town',
    label: 'Town',
    icon: <SearchOutlined />,
    placeholder: 'e.g. Sleepy Hollow, Mystic',
    hint: 'Enter a town or village name',
  },
];

const today = dayjs().startOf('day');
const maxDate = today.add(4, 'day');

function disabledDate(current) {
  return current < today || current > maxDate;
}

export default function LocationModal({ open, onClose, onSearch, loading }) {
  const [activeTab, setActiveTab] = useState('city');
  const [form] = Form.useForm();

  const currentType = LOCATION_TYPES.find(t => t.key === activeTab);

  const handleSubmit = () => {
    form.validateFields().then(values => {
      const range = values.dateRange;
      const startDate = range ? range[0].format('YYYY-MM-DD') : null;
      const endDate = range ? range[1].format('YYYY-MM-DD') : null;
      onSearch(values.location, startDate, endDate);
    });
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    form.resetFields();
  };

  return (
    <Modal
      className="location-modal"
      title={
        <Space>
          <SearchOutlined style={{ color: '#40a9ff' }} />
          <span style={{ color: '#fff' }}>Check Weather</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
      destroyOnHidden
    >
      <div style={{ marginTop: 16 }}>
        <Tabs
          className="location-tabs"
          activeKey={activeTab}
          onChange={handleTabChange}
          items={LOCATION_TYPES.map(t => ({
            key: t.key,
            label: (
              <Space>
                {t.icon}
                <span>{t.label}</span>
              </Space>
            ),
          }))}
        />

        <div style={{ marginTop: 20 }}>
          <Text className="hint-text" style={{ fontSize: 13, display: 'block', marginBottom: 12 }}>
            {currentType?.hint}
          </Text>

          <Form form={form} onFinish={handleSubmit}>
            <Form.Item
              name="location"
              rules={[{ required: true, message: `Please enter a ${currentType?.label.toLowerCase()}` }]}
            >
              <Input
                size="large"
                prefix={currentType?.icon}
                placeholder={currentType?.placeholder}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#fff',
                  borderRadius: 8,
                }}
              />
            </Form.Item>

            <Divider style={{ borderColor: 'rgba(255,255,255,0.15)', margin: '8px 0 16px' }}>
              <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
                <CalendarOutlined style={{ marginRight: 6 }} />
                Date Range (optional)
              </Text>
            </Divider>

            <Text className="hint-text" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
              Filter forecast to a specific range — today through the next 5 days.
            </Text>

            <Form.Item
              name="dateRange"
              rules={[
                {
                  validator(_, value) {
                    if (!value) return Promise.resolve();
                    const [start, end] = value;
                    if (start.isAfter(end)) return Promise.reject('Start date must be before end date');
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <RangePicker
                disabledDate={disabledDate}
                style={{ width: '100%' }}
                size="large"
              />
            </Form.Item>

            <Button
              type="primary"
              size="large"
              block
              loading={loading}
              onClick={handleSubmit}
              icon={<SearchOutlined />}
              style={{
                background: 'linear-gradient(135deg, #1890ff, #096dd9)',
                border: 'none',
                borderRadius: 8,
                height: 44,
                fontWeight: 600,
              }}
            >
              Get Weather
            </Button>
          </Form>
        </div>
      </div>
    </Modal>
  );
}
