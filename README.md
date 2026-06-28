<div align="center">

<img src="android-chrome-192x192.png" alt="Skycast Logo" width="100" height="100" style="border-radius: 22px"/>

# 🌤️ Skycast – Weather Forecast App

**A beautiful, real-time weather forecast web app with live AQI, auto-location detection, animated sky backgrounds, and a 7-day outlook.**

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![OpenWeatherMap](https://img.shields.io/badge/API-OpenWeatherMap-orange?style=flat-square)](https://openweathermap.org/api)

[🌐 Live Demo](#)

</div>

---

## ✨ Features

- 📍 **Auto Location Detection** — Automatically fetches weather for your current location on page load using the browser Geolocation API
- 🌡️ **Real-Time Weather** — Current temperature, feels-like, humidity, wind speed, visibility, and pressure
- ⏰ **24-Hour Hourly Forecast** — Scrollable strip with weather icons and temperatures
- 📅 **7-Day Outlook** — Daily high/low with animated temperature range bars
- 🌬️ **Air Quality Index (AQI)** — Color-coded gauge with pollutant breakdown (PM2.5, PM10, O₃, NO₂, SO₂, CO) and health advice
- 🌅 **Weather Details** — Sunrise/sunset times, UV index with visual bar, precipitation chance, and dew point
- 🎨 **Dynamic Animated Backgrounds** — Sky gradient shifts based on weather condition (sunny, cloudy, rainy, snowy, night)
- 🌧️ **Weather Particles** — Animated rain drops, falling snowflakes, and twinkling stars
- 🌡️ **°C / °F Toggle** — Instantly converts all temperatures across every section
- 🔍 **City Search** — Search any city worldwide with keyboard support (Enter key)
- 📱 **Mobile-Friendly** — Fully responsive design built for all screen sizes

---

## 📸 Preview

| Sunny Day | Rainy Night | AQI Card |
|-----------|------------|----------|
| ☀️ Golden sky gradient with floating sun icon | 🌧️ Dark animated rain with falling drops | 🌬️ Color-coded gauge with pollutant grid |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Structure | HTML5 |
| Styling | CSS3 (custom properties, animations, backdrop-filter) |
| Logic | Vanilla JavaScript (ES2020+) |
| Weather Data | [OpenWeatherMap API](https://openweathermap.org/api) |
| Air Quality | [OpenWeatherMap Air Pollution API](https://openweathermap.org/api/air-pollution) |
| Geocoding | [OpenWeatherMap Geo API](https://openweathermap.org/api/geocoding-api) |
| Location | Browser Geolocation API |
| Icons | Emoji-based (no icon library required) |
| Fonts | Google Fonts — DM Sans |

---

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Edge, Safari)
- A free [OpenWeatherMap API key](https://home.openweathermap.org/users/sign_up)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/skycast-weather.git
   cd skycast-weather
   ```

2. **Add your API key**

   Open `app.js` and replace the placeholder with your key:
   ```js
   const API_KEY = 'YOUR_API_KEY_HERE';
   ```

3. **Run the app**

   Simply open `index.html` in your browser — no build tools or dependencies needed!
   ```bash
   # Or use a local server (recommended for geolocation to work)
   npx serve .
   # or
   python -m http.server 8080
   ```

> ⚠️ **Note:** Browser geolocation requires either `localhost` or an `https://` origin. It will not work when opening the file directly as `file://` in some browsers.

---

## 📁 Project Structure

```
skycast-weather/
│
├── index.html                  # App markup & layout
├── style.css                   # All styles, animations, themes
├── app.js                      # Weather logic, API calls, rendering
│
├── favicon.ico                 # Browser tab icon
├── favicon-16x16.png
├── favicon-32x32.png
├── apple-touch-icon.png        # iOS home screen icon
├── android-chrome-192x192.png  # Android icon
├── android-chrome-512x512.png  # Android splash icon
├── site.webmanifest            # PWA manifest
│
└── README.md
```

---

## 🔑 API Endpoints Used

| Endpoint | Purpose |
|----------|---------|
| `geo/1.0/direct` | Convert city name → coordinates |
| `geo/1.0/reverse` | Convert coordinates → city name |
| `data/3.0/onecall` | Full weather (current + hourly + daily) |
| `data/2.5/weather` | Current weather (free tier fallback) |
| `data/2.5/forecast` | 5-day/3-hour forecast (free tier fallback) |
| `data/2.5/air_pollution` | Real-time AQI & pollutant data |

> The app automatically falls back to the free `data/2.5` endpoints if the One Call 3.0 subscription is unavailable.

---

## 🌍 How Location Detection Works

1. On page load, the app calls `navigator.geolocation.getCurrentPosition()`
2. The browser prompts the user to **Allow** or **Block** location access
3. If **allowed** → coordinates are reverse-geocoded to a city name → weather loads instantly
4. If **denied** → a friendly error is shown and the app falls back to a default city (Gurugram)
5. The 📍 button lets users re-trigger location detection at any time

---

## 🎨 AQI Scale Reference

| AQI Level | Index | Color | Health Implication |
|-----------|-------|-------|-------------------|
| Good | 1 | 🟢 Green | No health risk |
| Fair | 2 | 🟡 Yellow-Green | Acceptable |
| Moderate | 3 | 🟠 Orange | Sensitive groups affected |
| Poor | 4 | 🔴 Red | Health effects for all |
| Very Poor | 5 | ⬛ Dark Red | Health emergency |

---

## 📜 License

This project is licensed under the **MIT License** — feel free to use, modify, and distribute it.

---

## 🙌 Acknowledgements

- Weather data powered by [OpenWeatherMap](https://openweathermap.org/)
- Fonts by [Google Fonts](https://fonts.google.com/)
- App icon designed as a fluffy plush weather widget

---

<div align="center">

Made with ❤️ by **Jatin Kr. Koli**

© 2026 | All Rights Reserved by Jatin Kr. Koli

</div>
