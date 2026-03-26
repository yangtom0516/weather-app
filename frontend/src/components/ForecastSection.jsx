import { Row, Col, Card, Typography } from 'antd';
import { getWeatherEmoji } from '../utils/weatherIcons';

const { Title } = Typography;

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const todayStr = new Date().toISOString().split('T')[0];

export default function ForecastSection({ data }) {
  if (!data || !data.length) return null;

  return (
    <div>
      <Title level={4} style={{ color: 'rgba(255,255,255,0.85)', marginBottom: 16 }}>
        5-Day Forecast
      </Title>
      <Row gutter={[12, 12]}>
        {data.map((day, idx) => {
          const date = new Date(day.date + 'T12:00:00');
          const isToday = day.date === todayStr;
          const dayName = isToday ? 'Today' : DAY_NAMES[date.getDay()];
          const emoji = getWeatherEmoji(day.condition_code, day.description);

          return (
            <Col key={day.date || idx} xs={12} sm={8} md={6} lg={4} style={{ flex: '1 1 0' }}>
              <Card className="forecast-card">
                <div className="forecast-day">{dayName}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
                  {date.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </div>
                <div className="forecast-icon">{emoji}</div>
                <div>
                  <span className="forecast-temp-high">{Math.round(day.temp_max)}°</span>
                  <span className="forecast-temp-low">{Math.round(day.temp_min)}°</span>
                </div>
                <div className="forecast-desc">{day.description}</div>
                <div style={{ marginTop: 8, fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
                  💧 {day.humidity}%
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
}
