import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const WeatherGraphs = () => {
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHistoricalData = async () => {
    try {
      const response = await fetch(
        `https://archive-api.open-meteo.com/v1/archive?` +
        `latitude=19.0760&longitude=72.8777` +
        `&start_date=2024-01-01` +
        `&end_date=2024-02-08` +
        `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,` +
        `windspeed_10m_max,relative_humidity_2m_max` +
        `&timezone=Asia%2FKolkata`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Process data for visualization
      const processedData = data.daily.time.map((date, index) => {
        const formattedDate = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return {
          date: formattedDate, // Format date for better readability
          originalDate: date, // Keep original date for tooltip sorting if needed
          maxTemp: data.daily.temperature_2m_max[index],
          minTemp: data.daily.temperature_2m_min[index],
          rainfall: data.daily.precipitation_sum[index],
          windSpeed: data.daily.windspeed_10m_max[index],
          humidity: data.daily.relative_humidity_2m_max[index]
        };
      });

      setHistoricalData(processedData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching historical data:', error);
      setError('Failed to load weather data. Please try again later.'); // User-friendly error message
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoricalData();
  }, []);

  if (loading) {
    return <div className="loading-text">Loading weather data...</div>;
  }

  if (error) {
    return <div className="error-text">{error}</div>;
  }

  return (
    <div className="weather-graphs-container">
      <div>
        <h3 className="graph-title">Temperature Trends (°C)</h3>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                interval={2}
              />
              <YAxis
                label={{
                  value: '°C',
                  angle: -90,
                  position: 'insideLeft',
                  offset: -5
                }}
              />
              <Tooltip
                labelFormatter={(label) => `Date: ${label}`}
                formatter={(value, name) => [`${value}°C`, name]}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="maxTemp"
                stroke="#ff7300"
                name="Max"
              />
              <Line
                type="monotone"
                dataKey="minTemp"
                stroke="#387908"
                name="Min"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h3 className="graph-title">Rainfall Analysis (mm)</h3>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                interval={2}
              />
              <YAxis
                label={{
                  value: 'mm',
                  angle: -90,
                  position: 'insideLeft',
                  offset: -5
                }}
              />
              <Tooltip
                labelFormatter={(label) => `Date: ${label}`}
                formatter={(value, name) => [`${value}mm`, name]}
              />
              <Area
                type="monotone"
                dataKey="rainfall"
                fill="#8884d8"
                stroke="#8884d8"
                name="Daily Rainfall"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h3 className="graph-title">Wind Speed (km/h) & Humidity (%)</h3>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                interval={2}
              />
              <YAxis
                yAxisId="left"
                label={{
                  value: 'km/h',
                  angle: -90,
                  position: 'insideLeft',
                  offset: -5
                }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                label={{
                  value: '%',
                  angle: 90,
                  position: 'insideRight',
                  offset: -5
                }}
              />
              <Tooltip
                labelFormatter={(label) => `Date: ${label}`}
                formatter={(value, name, props) => {
                  const unit = props.yAxisId === 'right' ? '%' : 'km/h';
                  return [`${value}${unit}`, name];
                }}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="windSpeed"
                stroke="#82ca9d"
                name="Wind Speed"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="humidity"
                stroke="#ffc658"
                name="Humidity"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="data-info">
        <p>* Data shown is historical weather data for Mumbai region</p>
        <p>* Updated daily with latest available measurements</p>
      </div>

      <style>
        {`
          .weather-graphs-container {
            space-y: 2rem; /* Equivalent to space-y-8 */
            padding: 1rem; /* Equivalent to p-4 */
            background-color: white; /* Equivalent to bg-white */
            border-radius: 0.5rem; /* Equivalent to rounded-lg */
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06); /* Equivalent to shadow */
          }

          .graph-title {
            font-size: 1.125rem; /* Equivalent to text-lg */
            font-weight: 600; /* Equivalent to font-semibold */
            margin-bottom: 1rem; /* Equivalent to mb-4 */
          }

          .chart-container {
            height: 16rem; /* Equivalent to h-64 */
          }

          .loading-text {
            text-align: center; /* Equivalent to text-center */
            padding: 1rem; /* Equivalent to p-4 */
          }

          .error-text {
            text-align: center; /* Equivalent to text-center */
            padding: 1rem; /* Equivalent to p-4 */
            color: #dc2626; /* Equivalent to text-red-500 */
          }

          .data-info {
            font-size: 0.875rem; /* Equivalent to text-sm */
            color: #71717a; /* Approximating text-gray-600 */
            margin-top: 1rem; /* Equivalent to mt-4 */
          }
        `}
      </style>
    </div>
  );
};

export default WeatherGraphs;