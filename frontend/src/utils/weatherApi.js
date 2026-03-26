const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000';

async function request(url, options = {}) {
  const response = await fetch(`${API_BASE}${url}`, options);
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(err.detail || `Request failed with status ${response.status}`);
  }
  if (response.status === 204) return null;
  return response.json();
}

// Weather
export function searchWeather(q, startDate = null, endDate = null) {
  const params = new URLSearchParams({ q });
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);
  return request(`/weather/search?${params}`);
}

// History
export function fetchHistory() {
  return request('/history/');
}

export function updateHistoryTitle(hid, title) {
  return request(`/history/${hid}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
}

export function deleteHistoryRecord(hid) {
  return request(`/history/${hid}`, { method: 'DELETE' });
}

export function getExportUrl(format) {
  return `${API_BASE}/history/export?format=${format}`;
}

// YouTube
export function fetchVideos(location) {
  return request(`/youtube/videos?${new URLSearchParams({ q: location })}`);
}
