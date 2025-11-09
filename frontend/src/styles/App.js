import React, { useState, useEffect } from 'react';
import { Globe, Cloud, Droplets, TrendingUp, MapPin, AlertTriangle } from 'lucide-react';
import { getWeather, getWeatherByCoords } from './services/api';
import WeatherCard from './components/WeatherCard';
import CitySearch from './components/CitySearch';
import MapComponent from './components/MapComponent';
import TemperatureChart from './components/TemperatureChart';
import ClimateMetricsChart from './components/ClimateMetricsChart';
import RealTimeSeaLevel from './components/RealTimeSeaLevel';
import CitySeaLevelPredictor from './components/CitySeaLevelPredictor';
import DisasterRiskAssessment from './components/DisasterRiskAssessment';
import DataSection from './components/DataSection';

const getCityTimezone = (cityName) => {
  const timezoneMap = {
    'london': 'Europe/London',
    'new york': 'America/New_York',
    'tokyo': 'Asia/Tokyo',
    'paris': 'Europe/Paris',
    'dubai': 'Asia/Dubai',
    'sydney': 'Australia/Sydney',
    'mumbai': 'Asia/Kolkata',
    'delhi': 'Asia/Kolkata',
    'singapore': 'Asia/Singapore',
    'los angeles': 'America/Los_Angeles',
    'miami': 'America/New_York',
    'chicago': 'America/Chicago',
    'beijing': 'Asia/Shanghai',
    'moscow': 'Europe/Moscow'
  };
  return timezoneMap[(cityName || '').toLowerCase().trim()] || 'Asia/Kolkata';
};

const App = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState(null);
  const [cityTimezone, setCityTimezone] = useState('Asia/Kolkata');
  const [displayCity, setDisplayCity] = useState('Delhi');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    handleSearchCity('Delhi');
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZone: cityTimezone
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: cityTimezone
    });
  };

  const handleSearchCity = async (cityName) => {
    try {
      setWeatherLoading(true);
      setWeatherError(null);

      const timezone = getCityTimezone(cityName);
      setCityTimezone(timezone);
      setDisplayCity(cityName);

      const result = await getWeather(cityName);
      if (result.success) {
        setWeatherData(result.data);
      } else {
        setWeatherError(result.error || 'Failed to fetch weather data');
      }
    } catch (err) {
      setWeatherError('An unexpected error occurred');
    } finally {
      setWeatherLoading(false);
    }
  };

  const handleCitySelect = async (cityName, lat, lon) => {
    try {
      setWeatherLoading(true);
      setWeatherError(null);

      const timezone = getCityTimezone(cityName);
      setCityTimezone(timezone);
      setDisplayCity(cityName);

      const result = await getWeatherByCoords(lat, lon);
      if (result.success) {
        setWeatherData(result.data);
        if (result.data.city) {
          setDisplayCity(result.data.city);
        }
      } else {
        setWeatherError(result.error || 'Failed to fetch weather data');
      }
    } catch (err) {
      setWeatherError('An unexpected error occurred');
    } finally {
      setWeatherLoading(false);
    }
  };

  return (
    <div className="app">
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          overflow-x: hidden;
        }

        .app {
          min-height: 100vh;
          transition: all 0.3s ease;
          background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%);
          color: #eaeaea;
        }

        .navbar {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 1000;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .nav-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.5rem;
          font-weight: bold;
          color: #fff;
        }

        .nav-brand-icon {
          animation: rotate 20s linear infinite;
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .hero {
          text-align: center;
          padding: 3rem 2rem;
          background: rgba(0, 0, 0, 0.2);
          margin: 2rem;
          border-radius: 20px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .hero-title {
          font-size: 3rem;
          font-weight: bold;
          margin-bottom: 1rem;
          background: linear-gradient(90deg, #00d4ff, #00ff88);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: glow 2s ease-in-out infinite;
        }

        @keyframes glow {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.3); }
        }

        .hero-subtitle {
          font-size: 1.25rem;
          color: #b0b0b0;
          margin-bottom: 2rem;
        }

        .time-display {
          display: flex;
          justify-content: center;
          gap: 2rem;
          flex-wrap: wrap;
          margin-top: 2rem;
        }

        .time-card {
          background: rgba(255, 255, 255, 0.1);
          padding: 1.5rem 2rem;
          border-radius: 12px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          min-width: 200px;
        }

        .time-label {
          font-size: 0.875rem;
          color: #888;
          margin-bottom: 0.5rem;
        }

        .time-value {
          font-size: 2rem;
          font-weight: bold;
          color: #00d4ff;
        }

        .main-content {
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .weather-section {
          margin-bottom: 3rem;
        }

        .section-title {
          font-size: 2rem;
          font-weight: bold;
          margin-bottom: 1.5rem;
          color: #fff;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .live-badge {
          display: inline-block;
          background: linear-gradient(135deg, #00ff88 0%, #00d4ff 100%);
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: bold;
          margin-left: 0.5rem;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 2rem;
          }
          
          .time-display {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>

      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="nav-brand">
          <Globe className="nav-brand-icon" size={32} />
          <span>SEA LEVEL RISE PREDICTION SYSTEM </span>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <h1 className="hero-title">🌍 Global Climate Monitoring</h1>
        <p className="hero-subtitle">
          Real-Time Weather Data & Climate Predictions
        </p>

        <div className="time-display">
          <div className="time-card">
            <div className="time-label">📅 Current Date</div>
            <div className="time-value" style={{ fontSize: '1.25rem' }}>
              {formatDate(currentTime)}
            </div>
          </div>
          <div className="time-card">
            <div className="time-label">🕐 Current Time</div>
            <div className="time-value">
              {formatTime(currentTime)}
            </div>
          </div>
          <div className="time-card">
            <div className="time-label">📍 Viewing</div>
            <div className="time-value" style={{ fontSize: '1.25rem' }}>
              {displayCity}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="main-content">
        {/* Weather Section */}
        <section className="weather-section">
          <h2 className="section-title">
            <Cloud size={32} />
            Real-Time Weather
            <span className="live-badge">LIVE</span>
          </h2>

          <CitySearch
            onCitySelect={handleCitySelect}
            onSearch={handleSearchCity}
          />

          <WeatherCard
            weatherData={weatherData}
            loading={weatherLoading}
            error={weatherError}
          />
        </section>

        {/* Map Section */}
        <section className="weather-section">
          <h2 className="section-title">
            <MapPin size={32} />
            Interactive Global Map
            <span className="live-badge">3D GLOBE</span>
          </h2>

          <MapComponent
            onLocationSelect={async (lat, lon) => {
              const result = await getWeatherByCoords(lat, lon);
              if (result.success) {
                setWeatherData(result.data);
              }
            }}
            currentWeatherData={weatherData}
          />
        </section>

        {/* Hidden Data Section */}
        <DataSection>
          <section className="weather-section">
            <h2 className="section-title">
              <TrendingUp size={32} />
              Historical Climate Data
              <span className="live-badge">1950-2024</span>
            </h2>
            <TemperatureChart />
          </section>

          <section className="weather-section">
            <RealTimeSeaLevel />
          </section>

          <section className="weather-section">
            <ClimateMetricsChart />
          </section>
        </DataSection>

        {/* City Sea Level Predictions */}
        <section className="weather-section">
          <h2 className="section-title">
            <Droplets size={32} />
            City Sea Level Predictions
            <span className="live-badge">🤖 ML POWERED</span>
          </h2>

          <CitySeaLevelPredictor />
        </section>

        {/* Disaster Risk Assessment */}
        <section className="weather-section">
          <h2 className="section-title">
            <AlertTriangle size={32} />
            Flood & Landslide Risk Assessment
            <span className="live-badge">REAL-TIME</span>
          </h2>

          <DisasterRiskAssessment />
        </section>
      </div>
    </div>
  );
};

export default App;