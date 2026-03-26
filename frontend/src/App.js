import { useState } from 'react';
import {
  Layout, Menu, Button, Typography, Alert, Spin
} from 'antd';
import {
  CloudOutlined, HistoryOutlined, SearchOutlined
} from '@ant-design/icons';
import './App.css';
import LocationModal from './components/LocationModal';
import CurrentWeather from './components/CurrentWeather';
import ForecastSection from './components/ForecastSection';
import HistorySection from './components/HistorySection';
import { searchWeather } from './utils/weatherApi';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

export default function App() {
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [error, setError] = useState(null);
  const [activeNav, setActiveNav] = useState('check-weather');

  const handleSearch = async (locationInput, startDate, endDate) => {
    setLoading(true);
    setError(null);
    setWeatherData(null);
    setForecastData(null);

    try {
      const { current, forecast } = await searchWeather(locationInput.trim(), startDate, endDate);
      setWeatherData(current);
      setForecastData(forecast);
      setModalOpen(false);
    } catch (err) {
      setError(err.message || 'Failed to fetch weather data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const navItems = [
    { key: 'check-weather', icon: <CloudOutlined />, label: 'Check Weather' },
    { key: 'weather-history', icon: <HistoryOutlined />, label: 'Weather History' },
  ];

  return (
    <Layout className="app-layout">
      <Header className="app-header">
        <Title className="app-title" level={4}>
          <CloudOutlined style={{ marginRight: 8, color: '#40a9ff' }} />
          Tom's Weather App
        </Title>
        <Menu
          className="app-nav"
          mode="horizontal"
          selectedKeys={[activeNav]}
          onClick={({ key }) => setActiveNav(key)}
          items={navItems}
          style={{ background: 'transparent', border: 'none', minWidth: 280 }}
          theme="dark"
        />
      </Header>

      <Content className="app-content">
        {activeNav === 'check-weather' && (
          <>
            {!weatherData && !loading && (
              <div className="hero-section">
                <Title className="hero-title">What's the weather like?</Title>
                <p className="hero-subtitle">
                  Get real-time weather data for any location worldwide
                </p>
                <Button
                  type="primary"
                  className="check-weather-btn"
                  icon={<SearchOutlined />}
                  onClick={() => setModalOpen(true)}
                >
                  Check Weather
                </Button>
              </div>
            )}

            {loading && (
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <Spin size="large" />
                <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: 16 }}>
                  Fetching weather data...
                </p>
              </div>
            )}

            {error && (
              <Alert
                className="error-alert"
                type="error"
                showIcon
                description={error}
                action={
                  <Button size="small" onClick={() => setModalOpen(true)}>
                    Try Again
                  </Button>
                }
              />
            )}

            {weatherData && !loading && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
                    Last updated: {new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </Text>
                  <Button
                    type="default"
                    ghost
                    icon={<SearchOutlined />}
                    onClick={() => setModalOpen(true)}
                    style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.8)' }}
                  >
                    Search Again
                  </Button>
                </div>
                <CurrentWeather data={weatherData} />
                <ForecastSection data={forecastData} />
              </>
            )}
          </>
        )}

        {activeNav === 'weather-history' && <HistorySection />}
      </Content>

      <Footer className="app-footer">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
            Built by <strong style={{ color: 'rgba(255,255,255,0.5)' }}>Tom</strong> &nbsp;|&nbsp; PM Accelerator Technical Assessment
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12 }}>
            PM Accelerator — Accelerating the careers of aspiring and seasoned product managers through hands-on training and real-world experience.
          </Text>
        </div>
      </Footer>

      <LocationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSearch={handleSearch}
        loading={loading}
      />
    </Layout>
  );
}
