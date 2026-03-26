import { useState, useEffect } from 'react';
import { List, Card, Button, Input, Space, Typography, Popconfirm, Spin, Alert, Dropdown, Row, Col, Divider } from 'antd';
import { DeleteOutlined, EditOutlined, CheckOutlined, CloseOutlined, DownloadOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
import { fetchHistory, updateHistoryTitle, deleteHistoryRecord, getExportUrl } from '../utils/weatherApi';
import { getWeatherEmoji, getWindDirection } from '../utils/weatherIcons';

const { Text, Title } = Typography;

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const todayStr = new Date().toISOString().split('T')[0];

const EXPORT_FORMATS = [
  { key: 'json',     label: 'JSON' },
  { key: 'csv',      label: 'CSV' },
  { key: 'xml',      label: 'XML' },
  { key: 'markdown', label: 'Markdown' },
];

function handleExport({ key }) {
  const url = getExportUrl(key);
  const link = document.createElement('a');
  link.href = url;
  link.download = `weather_history.${key === 'markdown' ? 'md' : key}`;
  link.click();
}

function ForecastRow({ forecast }) {
  if (!forecast || !forecast.length) return null;
  return (
    <Row gutter={[10, 10]} style={{ marginTop: 16 }}>
      {forecast.map((day, idx) => {
        const date = new Date(day.date + 'T12:00:00');
        const isToday = day.date === todayStr;
        const dayName = isToday ? 'Today' : DAY_NAMES[date.getDay()];
        const emoji = getWeatherEmoji(day.condition_code, day.description);
        return (
          <Col key={day.date || idx} xs={12} sm={8} md={6} lg={4} style={{ flex: '1 1 0' }}>
            <div style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 10,
              padding: '10px 8px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {dayName}
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginBottom: 4 }}>
                {date.toLocaleDateString([], { month: 'short', day: 'numeric' })}
              </div>
              <div style={{ fontSize: 26, margin: '4px 0' }}>{emoji}</div>
              <div>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{Math.round(day.temp_max)}°</span>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginLeft: 5 }}>{Math.round(day.temp_min)}°</span>
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', textTransform: 'capitalize', marginTop: 2 }}>
                {day.description}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>💧 {day.humidity}%</div>
            </div>
          </Col>
        );
      })}
    </Row>
  );
}

function CurrentWeatherDetails({ cw }) {
  const windDir = cw.wind_deg != null ? getWindDirection(cw.wind_deg) : '';
  const details = [
    { label: 'Feels Like', value: `${Math.round(cw.feels_like)}°F` },
    { label: 'Humidity',   value: `${cw.humidity}%` },
    { label: 'Wind',       value: `${Math.round(cw.wind_speed)} mph ${windDir}` },
    { label: 'Pressure',   value: `${cw.pressure} hPa` },
    { label: 'Visibility', value: cw.visibility != null ? `${(cw.visibility / 1000).toFixed(1)} km` : 'N/A' },
  ];
  return (
    <Row gutter={[12, 8]} style={{ marginTop: 12 }}>
      {details.map(d => (
        <Col key={d.label} xs={12} sm={8} md={6}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{d.label}</div>
          <div style={{ fontSize: 14, color: '#fff', fontWeight: 500 }}>{d.value}</div>
        </Col>
      ))}
    </Row>
  );
}

export default function HistorySection() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingHid, setEditingHid] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [expandedHid, setExpandedHid] = useState(null);

  useEffect(() => {
    fetchHistory()
      .then(setRecords)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleRename = async (hid) => {
    try {
      const updated = await updateHistoryTitle(hid, editingTitle);
      setRecords(prev => prev.map(r => r.hid === hid ? updated : r));
      setEditingHid(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (hid) => {
    try {
      await deleteHistoryRecord(hid);
      setRecords(prev => prev.filter(r => r.hid !== hid));
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleExpand = (hid) => setExpandedHid(prev => prev === hid ? null : hid);

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '80px 0' }}>
      <Spin size="large" />
    </div>
  );

  if (error) return <Alert type="error" description={error} showIcon />;

  if (!records.length) return (
    <div style={{ textAlign: 'center', padding: '80px 0', color: 'rgba(255,255,255,0.4)' }}>
      <p style={{ fontSize: 18 }}>No search history yet</p>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ color: 'rgba(255,255,255,0.85)', margin: 0 }}>
          Search History
        </Title>
        <Dropdown menu={{ items: EXPORT_FORMATS, onClick: handleExport }} placement="bottomRight">
          <Button ghost icon={<DownloadOutlined />} style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.8)' }}>
            Export
          </Button>
        </Dropdown>
      </div>

      <List
        dataSource={records}
        renderItem={record => {
          const cw = record.current_weather;
          const emoji = getWeatherEmoji(cw.condition_code, cw.description);
          const isEditing = editingHid === record.hid;
          const isExpanded = expandedHid === record.hid;

          return (
            <List.Item style={{ padding: 0, marginBottom: 12, border: 'none' }}>
              <Card className="weather-card" style={{ width: '100%' }} styles={{ body: { padding: '16px 20px' } }}>

                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>

                  {/* Left: title + meta */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {isEditing ? (
                      <Space>
                        <Input
                          value={editingTitle}
                          onChange={e => setEditingTitle(e.target.value)}
                          onPressEnter={() => handleRename(record.hid)}
                          style={{ width: 220 }}
                          autoFocus
                        />
                        <Button size="small" type="primary" icon={<CheckOutlined />} onClick={() => handleRename(record.hid)} />
                        <Button size="small" icon={<CloseOutlined />} onClick={() => setEditingHid(null)} />
                      </Space>
                    ) : (
                      <Text strong style={{ color: '#fff', fontSize: 16 }}>{record.title}</Text>
                    )}
                    <div style={{ marginTop: 4 }}>
                      <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
                        {new Date(record.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                        &nbsp;·&nbsp;{record.query}
                        {record.start_date && <span style={{ color: '#40a9ff' }}> · {record.start_date} → {record.end_date}</span>}
                      </Text>
                    </div>
                  </div>

                  {/* Right: weather snapshot + actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 28 }}>{emoji}</div>
                      <div style={{ color: '#fff', fontWeight: 600 }}>{Math.round(cw.temperature)}°F</div>
                      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, textTransform: 'capitalize' }}>{cw.description}</div>
                    </div>

                    <Space vertical size={6}>
                      <Button
                        size="small" ghost icon={<EditOutlined />}
                        onClick={() => { setEditingHid(record.hid); setEditingTitle(record.title); }}
                        style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.7)' }}
                      />
                      <Popconfirm title="Delete this record?" onConfirm={() => handleDelete(record.hid)} okText="Delete" cancelText="Cancel">
                        <Button size="small" danger ghost icon={<DeleteOutlined />} />
                      </Popconfirm>
                    </Space>
                  </div>
                </div>

                {/* Expand toggle */}
                <Divider style={{ borderColor: 'rgba(255,255,255,0.08)', margin: '12px 0 0' }} />
                <div
                  onClick={() => toggleExpand(record.hid)}
                  style={{ textAlign: 'center', cursor: 'pointer', paddingTop: 6, color: 'rgba(255,255,255,0.35)', fontSize: 12 }}
                >
                  {isExpanded ? <><UpOutlined /> Hide details</> : <><DownOutlined /> Show details</>}
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div style={{ marginTop: 16 }}>
                    <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Current Conditions
                    </Text>
                    <CurrentWeatherDetails cw={cw} />

                    {record.forecast && record.forecast.length > 0 && (
                      <>
                        <Divider style={{ borderColor: 'rgba(255,255,255,0.08)', margin: '16px 0 8px' }} />
                        <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          {record.start_date ? `Forecast · ${record.start_date} → ${record.end_date}` : '5-Day Forecast'}
                        </Text>
                        <ForecastRow forecast={record.forecast} />
                      </>
                    )}
                  </div>
                )}

              </Card>
            </List.Item>
          );
        }}
      />
    </div>
  );
}
