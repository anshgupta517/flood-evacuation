import { useState, useEffect } from 'react';
import './App.css';
import MapComponent from './components/MapComponent';
import WeatherGraphs from './components/weather.jsx';


function App() {
  const [weather, setWeather] = useState(null);
  const lat = 19.0760; // Mumbai coordinates
  const lon = 72.8777;

  // const lat = 21.15000000; //Durg
  // const lon = 81.40000000;



  const calculateFloodRisk = (precipitation, humidity) => {
    if (precipitation > 80 && humidity > 90) return 'Extreme'; // Increased thresholds
    if (precipitation > 50 && humidity > 80) return 'High';
    if (precipitation > 25 && humidity > 70) return 'Moderate';
    if (precipitation > 10 && humidity > 60) return 'Low'; // Added a low-end threshold
    return 'Very Low'; // Renamed and adjusted default
  };

  const getRiskInterpretation = (riskLevel, precipitation, humidity) => {
    switch (riskLevel) {
      case 'Extreme':
        return `Extreme Flood Risk: Very heavy rainfall (${precipitation}mm) combined with very high humidity (${humidity}%) indicates a severe flood risk. Immediate action and evacuation planning are crucial.`;
      case 'High':
        return `High Flood Risk: Significant rainfall (${precipitation}mm) and high humidity (${humidity}%) suggest a high likelihood of flooding. Be prepared for potential evacuation and monitor alerts closely.`;
      case 'Moderate':
        return `Moderate Flood Risk: Moderate rainfall (${precipitation}mm) with moderate humidity (${humidity}%). There's a possibility of localized flooding, especially in vulnerable areas. Stay informed.`;
      case 'Low':
        return `Low Flood Risk: Light rainfall (${precipitation}mm) and relatively lower humidity (${humidity}%). Flood risk is currently low, but be aware of changing conditions.`;
      case 'Very Low': // Interpretation for the new "Very Low" risk
      default:
        return `Very Low Flood Risk: Minimal rainfall (${precipitation}mm) and low humidity (${humidity}%). Flood risk is very low. Weather conditions are generally safe.`;
    }
  };


  const fetchHistoricalWeather = async () => {
    try {
      const response = await fetch(
        `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=2024-01-01&end_date=2024-02-08&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,relative_humidity_2m_max&timezone=Asia%2FKolkata`
      );
      const data = await response.json();

      const lastIndex = data.daily.time.length - 1;
      const avgTemp = (data.daily.temperature_2m_max[lastIndex] + data.daily.temperature_2m_min[lastIndex]) / 2;
      const precipitation = data.daily.precipitation_sum[lastIndex];
      const humidity = data.daily.relative_humidity_2m_max[lastIndex];

      const riskLevel = calculateFloodRisk(precipitation, humidity);

      setWeather({
        temp: avgTemp,
        temp_min: data.daily.temperature_2m_min[lastIndex],
        temp_max: data.daily.temperature_2m_max[lastIndex],
        precipitation: precipitation,
        condition: precipitation > 0 ? 'Rainy' : 'Clear', // More descriptive condition
        windSpeed: data.daily.windspeed_10m_max[lastIndex],
        humidity: humidity,
        riskLevel: riskLevel,
        riskInterpretation: getRiskInterpretation(riskLevel, precipitation, humidity), // New interpretation message
        alerts: riskLevel === 'Extreme' || riskLevel === 'High' ? ['Flood Risk Alert'] : [] // Alerts based on risk level
      });
    } catch (error) {
      console.error('Weather fetch error:', error);
      setWeather(null);
    }
  };

  useEffect(() => {
    fetchHistoricalWeather();
  }, []);

  return (
    <div className="container">
      <div className="h">
        <h1>Flood Evacuation Route Optimisation using Graph Theory and Spatial Analysis</h1>
      </div>
      <div className="map-container">
        <MapComponent />
      </div>
      <ul>
    <li><strong>Interactive Map Selection:</strong>  Easily select your starting point and destination by simply clicking on the map.</li>
    <li><strong>Flood Zone Drawing:</strong> Draw polygons directly on the map to define areas affected by flooding.</li>
    <li><strong>Route Visualization:</strong>  The optimal route is clearly displayed as a black polyline on the map, along with distance metrics.</li>
    <li><strong>Mobile-Responsive Design:</strong>  Access and use the application seamlessly on any device, from desktop computers to mobile phones.</li>
    </ul>
      {weather && (
        <div className="weather-interpretation-container">
          <div className="weather-header">
            <h2>Weather Analysis & Flood Risk Assessment</h2>
            <div className={`risk-badge ${weather.riskLevel.toLowerCase()}`}>
              {weather.riskLevel} Risk Level
            </div>
          </div>

          <div className="weather-grid">
            {/* Temperature Card (Less Emphasis on Flood Risk) */}
            <div className="weather-card temperature">
              <h3>Temperature</h3>
              <div className="temp-range">
                <span className="temp-min">Min: {weather.temp_min.toFixed(1)}°C</span>
                <br />
                <span className="temp-max">Max: {weather.temp_max.toFixed(1)}°C</span>
              </div>
              <p className="interpretation">
                Temperature today ranges from {weather.temp_min.toFixed(1)}°C to {weather.temp_max.toFixed(1)}°C.
              </p>
            </div>

            {/* Humidity & Precipitation Card (Focus on Flood Risk) */}
            <div className="weather-card humidity">
              <h3>Precipitation & Humidity</h3>
              <div className="humidity-value">
                Humidity: {weather.humidity}%
              </div>
              <div className="precipitation-value">
                Rainfall: {weather.precipitation}mm
              </div>
              <p className="interpretation">
                {weather.condition === 'Rainy'
                  ? `It is rainy today with ${weather.precipitation}mm of rainfall and ${weather.humidity}% humidity.`
                  : `The weather is clear today. Humidity is ${weather.humidity}%.`}
              </p>
            </div>

            {/* Wind Card (Less Emphasis, can be removed if not needed) */}
            <div className="weather-card wind">
              <h3>Wind Speed</h3>
              <div className="wind-value">
                {weather.windSpeed.toFixed(1)} km/h
              </div>
              <p className="interpretation">
                Wind speed is {weather.windSpeed.toFixed(1)} km/h.
              </p>
            </div>

            {/* Risk Assessment Card (Key Interpretation) */}
            <div className="weather-card alerts">
              <h3>Flood Risk Assessment</h3>
              <div className="risk-level-display">
                Risk Level: <span className={`risk-badge large ${weather.riskLevel.toLowerCase()}`}>{weather.riskLevel}</span>
              </div>
              <div className="interpretation-message">
                <p className="interpretation">
                  {weather.riskInterpretation} {/* Dynamic risk interpretation message */}
                </p>
              </div>
              {weather.alerts.length > 0 && (
                <div className="alerts-list">
                  {weather.alerts.map((alert, index) => (
                    <div key={index} className="alert-item">{alert}</div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="weather-graphs">
            <WeatherGraphs />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;