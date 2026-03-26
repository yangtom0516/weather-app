import React from 'react';
import { Card, Row, Col, Typography, Divider } from 'antd';
import {
  EnvironmentOutlined, EyeOutlined
} from '@ant-design/icons';
import { getWeatherEmoji, getWindDirection } from '../utils/weatherIcons';

const { Title, Text } = Typography;

export default function CurrentWeather({ data }) {
  if (!data) return null;

  const {
    location,
    temperature,
    feels_like,
    humidity,
    wind_speed,
    wind_deg,
    visibility,
    pressure,
    description,
    condition_code,
    sunrise,
    sunset,
  } = data;

  const emoji = getWeatherEmoji(condition_code, description);
  const windDir = wind_deg != null ? getWindDirection(wind_deg) : '';

  const formatTime = (unixTs) => {
    if (!unixTs) return 'N/A';
    return new Date(unixTs * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const details = [
    { label: 'Feels Like', value: `${Math.round(feels_like)}°F` },
    { label: 'Humidity', value: `${humidity}%` },
    { label: 'Wind', value: `${Math.round(wind_speed)} mph ${windDir}` },
    { label: 'Pressure', value: `${pressure} hPa` },
    { label: 'Visibility', value: visibility != null ? `${(visibility / 1000).toFixed(1)} km` : 'N/A' },
    { label: 'Sunrise', value: formatTime(sunrise) },
    { label: 'Sunset', value: formatTime(sunset) },
  ];

  return (
    <Card className="weather-card" style={{ marginBottom: 24 }}>
      <Row align="middle" justify="space-between" wrap>
        <Col>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <EnvironmentOutlined style={{ color: '#40a9ff', fontSize: 16 }} />
            <Title level={3} style={{ color: '#fff', margin: 0 }}>
              {location}
            </Title>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
            <div className="current-temp">{Math.round(temperature)}°F</div>
            <div>
              <div className="weather-desc">{description}</div>
            </div>
          </div>
        </Col>

        <Col>
          <div className="weather-icon-large" style={{ textAlign: 'center' }}>
            {emoji}
          </div>
        </Col>
      </Row>

      <Divider style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '16px 0' }} />

      <Row gutter={[16, 16]}>
        {details.map(d => (
          <Col key={d.label} xs={12} sm={8} md={6}>
            <div className="weather-detail-label">{d.label}</div>
            <div className="weather-detail-value">{d.value}</div>
          </Col>
        ))}
      </Row>
    </Card>
  );
}
