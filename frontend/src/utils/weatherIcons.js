// Map OpenWeatherMap condition codes to emoji icons
export function getWeatherEmoji(conditionCode, description = '') {
  if (!conditionCode) return '🌡️';
  const code = parseInt(conditionCode, 10);
  const desc = description.toLowerCase();

  if (code >= 200 && code < 300) return '⛈️';  // Thunderstorm
  if (code >= 300 && code < 400) return '🌦️';  // Drizzle
  if (code >= 500 && code < 600) {
    if (code === 511) return '🌨️';             // Freezing rain
    return '🌧️';                               // Rain
  }
  if (code >= 600 && code < 700) return '❄️';  // Snow
  if (code === 701 || code === 741) return '🌫️'; // Mist/Fog
  if (code >= 700 && code < 800) return '🌁';   // Atmosphere
  if (code === 800) return '☀️';               // Clear
  if (code === 801) return '🌤️';              // Few clouds
  if (code === 802) return '⛅';              // Scattered clouds
  if (code >= 803) return '☁️';              // Overcast
  return '🌡️';
}

export function getWindDirection(degrees) {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return dirs[Math.round(degrees / 22.5) % 16];
}
