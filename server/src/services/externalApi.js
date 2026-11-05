// All third-party API calls live here (separation of concerns).
// Every API used is free and needs no API key.

async function fetchJson(url, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`External API error ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

// Open-Meteo Geocoding: city name -> coordinates + country
export async function geocodeCity(name) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=en&format=json`;
  const data = await fetchJson(url);
  const hit = data.results?.[0];
  if (!hit) return null;
  return {
    name: hit.name,
    country: hit.country || '',
    countryCode: hit.country_code || '',
    latitude: hit.latitude,
    longitude: hit.longitude,
  };
}

// Open-Meteo Forecast: 7-day daily forecast
export async function getWeather(latitude, longitude) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
    `&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto&forecast_days=7`;
  const data = await fetchJson(url);
  const d = data.daily;
  return d.time.map((date, i) => ({
    date,
    code: d.weathercode[i],
    max: d.temperature_2m_max[i],
    min: d.temperature_2m_min[i],
    rain: d.precipitation_sum[i],
  }));
}

// Country info: open dataset (mledoze/countries via jsDelivr CDN) + World Bank API for population.
// Both are free and need no API key. The dataset is downloaded once, then kept in memory.
let countryCache = null;

async function loadCountries() {
  if (!countryCache) {
    const list = await fetchJson(
      'https://cdn.jsdelivr.net/gh/mledoze/countries@master/countries.json',
      20000
    );
    countryCache = new Map(list.map((c) => [c.cca2, c]));
  }
  return countryCache;
}

async function getPopulation(code) {
  const data = await fetchJson(
    `https://api.worldbank.org/v2/country/${encodeURIComponent(code)}/indicator/SP.POP.TOTL?format=json&mrnev=1`
  );
  return data?.[1]?.[0]?.value ?? null;
}

export async function getCountry(code) {
  const countries = await loadCountries();
  const c = countries.get(code.toUpperCase());
  if (!c) throw new Error(`No country data for code "${code}"`);

  let population = null;
  try {
    population = await getPopulation(code);
  } catch {
    /* population is optional */
  }

  const currencyCode = Object.keys(c.currencies || {})[0] || null;
  return {
    name: c.name?.common,
    capital: c.capital?.[0] || '',
    population,
    languages: Object.values(c.languages || {}),
    flag: `https://flagcdn.com/w160/${code.toLowerCase()}.png`,
    currencyCode,
    currencyName: currencyCode ? c.currencies[currencyCode].name : '',
    currencySymbol: currencyCode ? c.currencies[currencyCode].symbol : '',
  };
}

// ExchangeRate-API open endpoint: rates relative to a base currency
export async function getRates(base) {
  const data = await fetchJson(`https://open.er-api.com/v6/latest/${encodeURIComponent(base)}`);
  if (data.result !== 'success') throw new Error('Exchange rate lookup failed');
  return data.rates;
}
