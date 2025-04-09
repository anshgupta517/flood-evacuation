import React, { useState, useEffect } from 'react';
// You can remove './App.css' import from here as it's likely for the main App layout, not this component's styling.
// import './App.css';

// Weather Icons (You can replace these with actual icon components or image paths)
const WeatherIcons = {
  "01d": "☀️",    // Clear sky day
  "01n": "🌙",    // Clear sky night
  "02d": "🌤️",   // Few clouds day
  "02n": "☁️🌙",  // Few clouds night
  "03d": "☁️",    // Scattered clouds day
  "03n": "☁️",    // Scattered clouds night
  "04d": "☁️☁️",  // Broken clouds day
  "04n": "☁️☁️",  // Broken clouds night
  "09d": "🌧️",    // Shower rain day
  "09n": "🌧️",    // Shower rain night
  "10d": "🌦️",   // Rain day
  "10n": "🌧️🌙",  // Rain night
  "11d": "⛈️",   // Thunderstorm day
  "11n": "⛈️",   // Thunderstorm night
  "13d": "❄️",    // Snow day
  "13n": "❄️",    // Snow night
  "50d": "🌫️",    // Mist day
  "50n": "🌫️"     // Mist night
};

const CurrentWeatherCard = () => {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const lat = 19.0760; // Mumbai coordinates
  const lon = 72.8777;

  const fetchCurrentWeather = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}¤t_weather=true`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCurrentWeather(data.current_weather);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching current weather:', error);
      setError('Failed to load current weather data.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentWeather();
  }, []);

  if (loading) {
    return <div className="current-weather-loading">Loading current weather...</div>;
  }

  if (error) {
    return <div className="current-weather-error">Error: {error}</div>;
  }

  if (!currentWeather) {
    return null; // Or a message like "No weather data available"
  }

  const temperatureUnit = "°C"; // You can customize units if needed
  const windSpeedUnit = "km/h";

  // Dummy weather condition code for demonstration (replace with actual API response if available)
  const weatherConditionCode = "01d"; // Example: Clear sky day, you'd get this from an actual weather API

  return (
    <div className="current-weather-card">
      <div className="weather-icon">
        {WeatherIcons[weatherConditionCode] || "❓"} {/* Display icon or question mark if not found */}
      </div>
      <div className="temperature-display">
        {currentWeather.temperature}{temperatureUnit}
      </div>
      <div className="weather-details">
        <div className="detail-item">
          <span className="detail-label">Wind:</span>
          <span className="detail-value">{currentWeather.windspeed} {windSpeedUnit}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Direction:</span>
          <span className="detail-value">{currentWeather.winddirection}°</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Time:</span>
          <span className="detail-value">
            {new Date(currentWeather.time).toLocaleTimeString()}
          </span>
        </div>
      </div>

      <style>{`
        .current-weather-card {
          background-color: #f0f4f8; /* Light gray background */
          border-radius: 15px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          box-shadow: 0 4px 8px rgba(0,0,0,0.08);
          font-family: sans-serif; /* Or your preferred font */
          text-align: center;
          width: 280px; /* Adjust as needed */
          margin: 20px auto; /* Center the card */
        }

        .weather-icon {
          font-size: 3em; /* Large weather icon */
          margin-bottom: 10px;
        }

        .temperature-display {
          font-size: 2.5em;
          font-weight: bold;
          margin-bottom: 15px;
          color: #333; /* Dark text color */
        }

        .weather-details {
          display: flex;
          flex-direction: column;
          gap: 8px; /* Spacing between detail items */
          width: 100%;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          padding: 5px 0;
          border-bottom: 1px solid #e0e0e0; /* Light border */
        }

        .detail-item:last-child {
          border-bottom: none; /* Remove border from last item */
        }

        .detail-label {
          font-weight: 600;
          color: #555; /* Medium dark text */
        }

        .detail-value {
          color: #444;
        }

        .current-weather-loading, .current-weather-error {
          text-align: center;
          padding: 15px;
          font-style: italic;
          color: #777;
        }

        .current-weather-error {
          color: #d32f2f; /* Red error color */
        }
      `}</style>
    </div>
  );
};

export default CurrentWeatherCard;