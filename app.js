const API_KEY = '13d46daaf6dbf7c0981e0c84f12d3e81';
const BASE = 'https://api.openweathermap.org/data/2.5';
const GEO  = 'https://api.openweathermap.org/geo/1.0';
const ONE_CALL = 'https://api.openweathermap.org/data/3.0/onecall';

let isCelsius = true;
let weatherData = null;
let currentTempC = null;

// ─── Helpers ─────────────────────────────────────────────
const $ = id => document.getElementById(id);
const toF = c => Math.round(c * 9/5 + 32);
const fmt = c => isCelsius ? Math.round(c) : toF(c);
const unit = () => isCelsius ? '°C' : '°F';

function weatherIcon(id, isDay = true) {
  if (id >= 200 && id < 300) return '⛈️';
  if (id >= 300 && id < 400) return '🌦️';
  if (id >= 500 && id < 600) {
    if (id === 511) return '🌨️';
    return id < 502 ? '🌧️' : '⛈️';
  }
  if (id >= 600 && id < 700) return id === 611 || id === 612 ? '🌨️' : '❄️';
  if (id >= 700 && id < 800) return id === 781 ? '🌪️' : '🌫️';
  if (id === 800) return isDay ? '☀️' : '🌙';
  if (id === 801) return isDay ? '🌤️' : '🌙';
  if (id === 802) return '⛅';
  if (id >= 803) return '☁️';
  return '🌡️';
}

function skyClass(id, isDay) {
  if (!isDay) return 'night';
  if (id >= 200 && id < 600) return 'rainy';
  if (id >= 600 && id < 700) return 'snowy';
  if (id >= 700 && id < 800) return 'cloudy';
  if (id === 800) return 'sunny';
  if (id <= 802) return 'cloudy';
  return 'cloudy';
}

function fmtTime(unix, offset) {
  const d = new Date((unix + offset) * 1000);
  let h = d.getUTCHours(), m = d.getUTCMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m.toString().padStart(2,'0')} ${ampm}`;
}

function dayName(unix, offset, short = true) {
  const d = new Date((unix + offset) * 1000);
  return d.toLocaleDateString('en-US', { weekday: short ? 'short' : 'long', timeZone: 'UTC' });
}

const uvLabel = uv => uv <= 2 ? 'Low' : uv <= 5 ? 'Moderate' : uv <= 7 ? 'High' : uv <= 10 ? 'Very High' : 'Extreme';

// ─── AQI helpers ─────────────────────────────────────────
const AQI_META = [
  { cls: 'aqi-good',      label: 'Good',      advice: '😊 Air quality is excellent. Great day for outdoor activities!' },
  { cls: 'aqi-fair',      label: 'Fair',       advice: '🙂 Air quality is acceptable. Unusually sensitive people should consider limiting prolonged outdoor exertion.' },
  { cls: 'aqi-moderate',  label: 'Moderate',   advice: '😐 Sensitive groups may experience health effects. General public unlikely to be affected.' },
  { cls: 'aqi-poor',      label: 'Poor',       advice: '😷 Everyone may begin to experience health effects. Sensitive groups should avoid prolonged outdoor exertion.' },
  { cls: 'aqi-very-poor', label: 'Very Poor',  advice: '🚨 Health alert! Everyone should avoid outdoor activities. Keep windows closed.' },
];
 
function renderAQI(aqiData) {
  const { main, components } = aqiData.list[0];
  const idx = main.aqi - 1; // 1–5 → 0–4
  const meta = AQI_META[idx] || AQI_META[2];
 
  const card = $('aqiCard');
  card.className = 'aqi-card ' + meta.cls;
  $('aqiNumber').textContent = main.aqi;
  $('aqiStatus').textContent = meta.label;
  $('aqiAdvice').textContent = meta.advice;
 
  // Gauge marker: position within 5 bands (each 20%)
  const pct = ((main.aqi - 1) / 4 * 88 + 6).toFixed(1);
  $('aqiMarker').style.left = pct + '%';
 
  // Pollutants
  const pollutants = [
    { name: 'PM2.5', val: components.pm2_5?.toFixed(1) ?? '--', unit: 'μg/m³' },
    { name: 'PM10',  val: components.pm10?.toFixed(1)  ?? '--', unit: 'μg/m³' },
    { name: 'O₃',    val: components.o3?.toFixed(1)    ?? '--', unit: 'μg/m³' },
    { name: 'NO₂',   val: components.no2?.toFixed(1)   ?? '--', unit: 'μg/m³' },
    { name: 'SO₂',   val: components.so2?.toFixed(1)   ?? '--', unit: 'μg/m³' },
    { name: 'CO',    val: components.co?.toFixed(0)    ?? '--', unit: 'μg/m³' },
  ];
  $('aqiPollutants').innerHTML = pollutants.map(p => `
    <div class="pollutant">
      <span class="pollutant-name">${p.name}</span>
      <span class="pollutant-val">${p.val}</span>
      <span class="pollutant-unit">${p.unit}</span>
    </div>`).join('');
}
 
async function fetchAQI(lat, lon) {
  try {
    const res = await fetch(`${BASE}/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
    if (!res.ok) return;
    const data = await res.json();
    renderAQI(data);
  } catch(e) {
    // silently skip if AQI unavailable
  }
}

// ─── Weather particles ─────────────────────────────────────
function clearParticles() {
  $('rain').innerHTML = ''; $('rain').classList.remove('active');
  $('snow').innerHTML = ''; $('snow').classList.remove('active');
  $('stars').innerHTML = ''; $('stars').classList.remove('visible');
}

function makeRain() {
  clearParticles();
  const c = $('rain');
  for (let i = 0; i < 80; i++) {
    const d = document.createElement('div');
    d.className = 'raindrop';
    d.style.cssText = `left:${Math.random()*100}%;height:${12+Math.random()*20}px;animation-duration:${0.5+Math.random()*0.5}s;animation-delay:${Math.random()*2}s;opacity:${0.3+Math.random()*0.5}`;
    c.appendChild(d);
  }
  c.classList.add('active');
}

function makeSnow() {
  clearParticles();
  const c = $('snow');
  const flakes = ['❄','❅','❆','·','•'];
  for (let i = 0; i < 40; i++) {
    const d = document.createElement('div');
    d.className = 'snowflake';
    d.textContent = flakes[Math.floor(Math.random()*flakes.length)];
    d.style.cssText = `left:${Math.random()*100}%;font-size:${8+Math.random()*14}px;animation-duration:${3+Math.random()*4}s;animation-delay:${Math.random()*5}s;opacity:${0.4+Math.random()*0.6}`;
    c.appendChild(d);
  }
  c.classList.add('active');
}

function makeStars() {
  clearParticles();
  const c = $('stars');
  for (let i = 0; i < 80; i++) {
    const d = document.createElement('div');
    d.className = 'star';
    const s = 1 + Math.random() * 2;
    d.style.cssText = `left:${Math.random()*100}%;top:${Math.random()*60}%;width:${s}px;height:${s}px;animation-delay:${Math.random()*3}s;animation-duration:${2+Math.random()*2}s`;
    c.appendChild(d);
  }
  c.classList.add('visible');
}

// ─── Render ───────────────────────────────────────────────
function renderWeather(data, cityName, countryCode) {
  weatherData = data;
  const { current, hourly, daily, timezone_offset } = data;
  const id = current.weather[0].id;
  const isDay = current.dt > current.sunrise && current.dt < current.sunset;

  // Sky
  const sc = skyClass(id, isDay);
  $('sky').className = sc;
  clearParticles();
  if (sc === 'rainy') makeRain();
  else if (sc === 'snowy') makeSnow();
  else if (sc === 'night') makeStars();

  // Hero
  currentTempC = current.temp;
  const feelsC = current.feels_like;
  $('heroRegion').textContent = countryCode;
  $('heroCity').textContent = cityName;
  $('heroDate').textContent = new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' });
  $('heroIcon').textContent = weatherIcon(id, isDay);
  $('heroDesc').textContent = current.weather[0].description;
  $('heroFeels').textContent = `Feels like ${fmt(feelsC)}${unit()}`;
  updateTempDisplay();

  // Stats
  $('statHumidity').textContent = current.humidity + '%';
  $('statWind').textContent = Math.round(current.wind_speed * 3.6) + ' km/h';
  $('statVisibility').textContent = (current.visibility / 1000).toFixed(1) + ' km';
  $('statPressure').textContent = current.pressure + ' hPa';

  // Hourly
  const strip = $('hourlyStrip');
  strip.innerHTML = '';
  const nowH = new Date().getHours();
  hourly.slice(0, 24).forEach((h, i) => {
    const hDate = new Date((h.dt + timezone_offset) * 1000);
    const hh = hDate.getUTCHours();
    const label = i === 0 ? 'Now' : (hh === 0 ? '12 AM' : hh < 12 ? hh + ' AM' : hh === 12 ? '12 PM' : (hh-12) + ' PM');
    const card = document.createElement('div');
    card.className = 'hour-card' + (i === 0 ? ' active' : '');
    card.innerHTML = `<span class="hour-time">${label}</span><span class="hour-icon">${weatherIcon(h.weather[0].id, hh >= 6 && hh < 20)}</span><span class="hour-temp">${fmt(h.temp)}°</span>`;
    strip.appendChild(card);
  });

  // 7-day
  const list = $('forecastList');
  list.innerHTML = '';
  const allTemps = daily.slice(0,7).map(d => [d.temp.min, d.temp.max]).flat();
  const globalMin = Math.min(...allTemps), globalMax = Math.max(...allTemps);
  daily.slice(0, 7).forEach((d, i) => {
    const name = i === 0 ? 'Today' : dayName(d.dt, timezone_offset);
    const pct = range => ((range - globalMin) / (globalMax - globalMin) * 100).toFixed(0);
    const lowPct = pct(d.temp.min), highPct = pct(d.temp.max);
    const card = document.createElement('div');
    card.className = 'day-card';
    card.innerHTML = `
      <div class="day-name">${name}</div>
      <div class="day-icon">${weatherIcon(d.weather[0].id, true)}</div>
      <div class="day-desc">${d.weather[0].description}</div>
      <div class="day-bar"><div class="day-bar-fill" style="margin-left:${lowPct}%;width:${highPct-lowPct}%"></div></div>
      <div class="day-temps">
        <span class="day-low">${fmt(d.temp.min)}°</span>
        <span class="day-high">${fmt(d.temp.max)}°</span>
      </div>`;
    list.appendChild(card);
  });

  // Extra cards
  $('cardSunrise').textContent = fmtTime(current.sunrise, timezone_offset);
  $('cardSunset').textContent = 'Sunset ' + fmtTime(current.sunset, timezone_offset);
  const uv = Math.round(current.uvi);
  $('cardUV').textContent = uv;
  $('cardUVLabel').textContent = uvLabel(uv);
  $('uvMarker').style.left = Math.min(100, uv / 11 * 100) + '%';
  const precip = daily[0]?.pop ? Math.round(daily[0].pop * 100) : 0;
  $('cardPrecip').textContent = precip + '%';
  const dew = current.dew_point;
  $('cardDew').textContent = fmt(dew) + unit();
  $('cardDewLabel').textContent = dew < 10 ? 'Dry & comfortable' : dew < 16 ? 'Comfortable' : dew < 21 ? 'Humid' : 'Very humid';
}

function updateTempDisplay() {
  if (currentTempC === null) return;
  $('heroTemp').innerHTML = `${fmt(currentTempC)}<sup>${unit()}</sup>`;
  $('heroFeels').textContent = `Feels like ${fmt(weatherData.current.feels_like)}${unit()}`;

  // Update hourly
  document.querySelectorAll('.hour-temp').forEach((el, i) => {
    if (weatherData?.hourly[i]) el.textContent = fmt(weatherData.hourly[i].temp) + '°';
  });

  // Update daily
  document.querySelectorAll('.day-card').forEach((card, i) => {
    if (!weatherData?.daily[i]) return;
    const d = weatherData.daily[i];
    card.querySelector('.day-low').textContent = fmt(d.temp.min) + '°';
    card.querySelector('.day-high').textContent = fmt(d.temp.max) + '°';
  });

  $('cardDew').textContent = fmt(weatherData.current.dew_point) + unit();
}

// ─── Fetch ────────────────────────────────────────────────
async function fetchWeather(city) {
  showLoading(true);
  hideError();

  try {
    // Geocode
    const geoRes = await fetch(`${GEO}/direct?q=${encodeURIComponent(city)}&limit=1&appid=${API_KEY}`);
    const geoData = await geoRes.json();
    
    // Check for API errors (like 401 Unauthorized)
    if (!geoRes.ok) {
      throw new Error(`API Error: ${geoData.message || 'Could not connect to OpenWeatherMap'}`);
    }

    // Check if the city actually wasn't found
    if (!geoData || geoData.length === 0) {
      throw new Error(`City "${city}" not found. Try a different spelling.`);
    }

    const { lat, lon, name, country, state } = geoData[0];
    const regionLabel = [state, country].filter(Boolean).join(', ');

    // One Call API
    const wcRes = await fetch(`${ONE_CALL}?lat=${lat}&lon=${lon}&exclude=minutely,alerts&units=metric&appid=${API_KEY}`);
    if (!wcRes.ok) {
      // Fallback to free endpoints
      await fetchWeatherFree(lat, lon, name, regionLabel);
      return;
    }
    const wcData = await wcRes.json();
    
    fetchAQI(lat, lon); 
    renderWeather(wcData, name, regionLabel);

  } catch(e) {
    showError(e.message || 'Could not fetch weather. Please try again.');
  } finally {
    showLoading(false);
  }
}

async function fetchWeatherFree(lat, lon, name, regionLabel) {
  // Current weather
  const cRes = await fetch(`${BASE}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);
  const cData = await cRes.json();
  
  // Throw error if fallback fails
  if (!cRes.ok) throw new Error(`API Error: ${cData.message}`);

  // 5-day/3-hour forecast
  const fRes = await fetch(`${BASE}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);
  const fData = await fRes.json();
  
  // Throw error if fallback fails
  if (!fRes.ok) throw new Error(`API Error: ${fData.message}`);

  // Build pseudo one-call format
  const tz_offset = cData.timezone * 1;

  const hourly = fData.list.slice(0, 24).map(f => ({
    dt: f.dt, temp: f.main.temp,
    weather: f.weather
  }));

  // Aggregate daily from 3h forecast
  const dayMap = {};
  fData.list.forEach(f => {
    const d = new Date(f.dt * 1000);
    const key = d.toDateString();
    if (!dayMap[key]) dayMap[key] = { dt: f.dt, temps: [], mins: [], maxs: [], weather: f.weather, pop: [] };
    dayMap[key].temps.push(f.main.temp);
    dayMap[key].mins.push(f.main.temp_min);
    dayMap[key].maxs.push(f.main.temp_max);
    if (f.pop !== undefined) dayMap[key].pop.push(f.pop);
  });

  const daily = Object.values(dayMap).slice(0, 7).map(d => ({
    dt: d.dt,
    sunrise: cData.sys.sunrise,
    sunset: cData.sys.sunset,
    temp: {
      min: Math.min(...d.mins),
      max: Math.max(...d.maxs)
    },
    weather: d.weather,
    pop: d.pop.length ? d.pop.reduce((a,b)=>a+b,0)/d.pop.length : 0
  }));

  // Ensure today is in daily
  if (daily.length === 0) {
    daily.unshift({
      dt: cData.dt, sunrise: cData.sys.sunrise, sunset: cData.sys.sunset,
      temp: { min: cData.main.temp_min, max: cData.main.temp_max },
      weather: cData.weather, pop: 0
    });
  }

  const pseudo = {
    current: {
      dt: cData.dt,
      sunrise: cData.sys.sunrise,
      sunset: cData.sys.sunset,
      temp: cData.main.temp,
      feels_like: cData.main.feels_like,
      pressure: cData.main.pressure,
      humidity: cData.main.humidity,
      dew_point: cData.main.temp - ((100 - cData.main.humidity) / 5),
      uvi: 3,
      visibility: cData.visibility || 10000,
      wind_speed: cData.wind.speed,
      weather: cData.weather
    },
    hourly,
    daily,
    timezone_offset: tz_offset
  };

  fetchAQI(lat, lon);
  renderWeather(pseudo, name, regionLabel);
}

// ─── UI helpers ───────────────────────────────────────────
function showLoading(v) {
  $('loading').classList.toggle('visible', v);
  $('welcome').style.display = v ? 'none' : '';
}
function showError(msg) {
  const el = $('errorMsg');
  el.textContent = msg;
  el.classList.add('visible');
}
function hideError() { $('errorMsg').classList.remove('visible'); }
function showContent() { $('weather-content').classList.add('visible'); $('welcome').style.display = 'none'; }

// ─── Events ───────────────────────────────────────────────
$('searchBtn').addEventListener('click', () => {
  const city = $('cityInput').value.trim();
  if (!city) return;
  showContent();
  fetchWeather(city);
});

$('cityInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') $('searchBtn').click();
});

$('btnC').addEventListener('click', () => {
  isCelsius = true;
  $('btnC').classList.add('active');
  $('btnF').classList.remove('active');
  updateTempDisplay();
});

$('btnF').addEventListener('click', () => {
  isCelsius = false;
  $('btnF').classList.add('active');
  $('btnC').classList.remove('active');
  updateTempDisplay();
});

// ─── Geolocation ─────────────────────────────────────────
async function fetchWeatherByCoords(lat, lon) {
  showLoading(true);
  hideError();
  showContent();
  try {
    // Reverse geocode to get city name
    const revRes = await fetch(`${GEO}/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`);
    const revData = await revRes.json();
    const name = revData[0]?.name || 'Your Location';
    const state = revData[0]?.state || '';
    const country = revData[0]?.country || '';
    const regionLabel = [state, country].filter(Boolean).join(', ');
    $('cityInput').value = name;
 
    // AQI
    fetchAQI(lat, lon);
 
    // One Call API
    const wcRes = await fetch(`${ONE_CALL}?lat=${lat}&lon=${lon}&exclude=minutely,alerts&units=metric&appid=${API_KEY}`);
    if (!wcRes.ok) {
      await fetchWeatherFree(lat, lon, name, regionLabel);
      return;
    }
    const wcData = await wcRes.json();
    renderWeather(wcData, name, regionLabel);
  } catch(e) {
    showError('Could not fetch weather for your location.');
  } finally {
    showLoading(false);
    setLocateStatus('');
    $('locateBtn').classList.remove('locating');
  }
}
 
function setLocateStatus(msg, isError = false) {
  const el = $('locateStatus');
  el.textContent = msg;
  el.className = 'locate-status' + (isError ? ' error' : '');
}
 
function startGeolocation() {
  if (!navigator.geolocation) {
    setLocateStatus('Geolocation not supported by your browser.', true);
    return;
  }
  $('locateBtn').classList.add('locating');
  setLocateStatus('📡 Detecting your location…');
 
  navigator.geolocation.getCurrentPosition(
    pos => {
      setLocateStatus('✅ Location found!');
      setTimeout(() => setLocateStatus(''), 2000);
      fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
    },
    err => {
      $('locateBtn').classList.remove('locating');
      const msgs = {
        1: '🔒 Location access denied. Please allow it in browser settings.',
        2: '📡 Location unavailable. Try searching manually.',
        3: '⏱️ Location request timed out. Try again.',
      };
      setLocateStatus(msgs[err.code] || 'Could not get location.', true);
      // Fallback: load Gurugram
      showContent();
      fetchWeather('Gurugram');
    },
    { timeout: 10000, maximumAge: 300000 }
  );
}
 
$('locateBtn').addEventListener('click', startGeolocation);
 
// Auto-detect location on page load
window.addEventListener('load', () => {
  startGeolocation();
});