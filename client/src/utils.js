export const fmtDate = (d) =>
  new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

export const fmtShort = (d) =>
  new Date(d).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });

export const toInputDate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');

export const tripDays = (start, end) =>
  Math.max(1, Math.round((new Date(end) - new Date(start)) / 86400000) + 1);

export const money = (n, cur) =>
  `${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })} ${cur || ''}`.trim();

// Country code (e.g. "TR") -> flag emoji
export const flagEmoji = (code) =>
  code && code.length === 2
    ? String.fromCodePoint(...code.toUpperCase().split('').map((c) => 127397 + c.charCodeAt(0)))
    : '🌍';

// Three-letter code for the boarding pass, e.g. "Istanbul" -> "IST"
export const cityCode = (name = '') =>
  name.replace(/[^a-z]/gi, '').slice(0, 3).toUpperCase() || 'TRP';

export function tripStatus(start, end) {
  const now = new Date();
  const s = new Date(start);
  const e = new Date(end);
  e.setHours(23, 59, 59, 999);
  if (now < s) {
    const days = Math.ceil((s - now) / 86400000);
    return { key: 'upcoming', days, label: days === 1 ? 'Departs tomorrow' : `Departs in ${days} days` };
  }
  if (now <= e) return { key: 'ongoing', days: 0, label: 'Happening now' };
  return { key: 'past', days: 0, label: 'Completed' };
}

// Open-Meteo WMO weather codes -> label + emoji
export function describeWeather(code) {
  if (code === 0) return { label: 'Clear sky', icon: '☀️' };
  if (code <= 2) return { label: 'Partly cloudy', icon: '⛅' };
  if (code === 3) return { label: 'Overcast', icon: '☁️' };
  if (code <= 48) return { label: 'Fog', icon: '🌫️' };
  if (code <= 57) return { label: 'Drizzle', icon: '🌦️' };
  if (code <= 67) return { label: 'Rain', icon: '🌧️' };
  if (code <= 77) return { label: 'Snow', icon: '❄️' };
  if (code <= 82) return { label: 'Rain showers', icon: '🌧️' };
  if (code <= 86) return { label: 'Snow showers', icon: '🌨️' };
  return { label: 'Thunderstorm', icon: '⛈️' };
}
