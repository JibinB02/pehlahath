import React, { useState, useEffect } from 'react';
import { Cloud, CloudRain, Thermometer, Wind, Droplets, AlertTriangle, Sun, CloudSnow } from 'lucide-react';
import { useThemeStore } from '../store/theme';
import { getCurrentWeather, parseForecastData, getWeatherAlerts, getWeatherGuidelines, parseWeatherData } from '../services/weatherService.js';

export function Weather() {
  const { isDarkMode } = useThemeStore();
  const [location, setLocation] = useState(null);
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [guidelines, setGuidelines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          
          try {
            // Fetch current weather
            const weatherData = await getCurrentWeather(latitude, longitude);
            const parsedWeatherData = parseWeatherData(weatherData);
            setCurrentWeather(parsedWeatherData);
            
            // Create forecast from the same data since the API doesn't provide multi-day forecast
            const parsedForecastData = parseForecastData(weatherData);
            setForecast(parsedForecastData);
            
            // Fetch alerts
            const alertsData = await getWeatherAlerts(latitude, longitude);
            setAlerts(alertsData);
            
            // Get guidelines based on current condition
            const weatherCondition = parsedWeatherData.current.condition.text;
            const safetyGuidelines = getWeatherGuidelines(weatherCondition);
            setGuidelines(safetyGuidelines);
            
            setLoading(false);
          } catch (err) {
            console.error('Error fetching weather data:', err);
            setError('Failed to fetch weather data. Please try again later.');
            setLoading(false);
          }
        },
        (err) => {
          console.error('Error getting location:', err);
          setError('Unable to get your location. Please enable location services.');
          setLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
    }
  }, []);

  // Helper function to get weather icon based on condition
  const getWeatherIcon = (condition) => {
    const conditionText = condition?.toLowerCase() || '';
    
    if (conditionText.includes('rain') || conditionText.includes('drizzle')) {
      return <CloudRain className="h-10 w-10" />;
    } else if (conditionText.includes('cloud')) {
      return <Cloud className="h-10 w-10" />;
    } else if (conditionText.includes('sun') || conditionText.includes('clear')) {
      return <Sun className="h-10 w-10" />;
    } else if (conditionText.includes('snow')) {
      return <CloudSnow className="h-10 w-10" />;
    } else {
      return <Cloud className="h-10 w-10" />;
    }
  };

  // Format date for forecast display
  const formatDate = (dateString) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${isDarkMode ? 'border-white' : 'border-blue-600'}`}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen p-6 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className={`max-w-4xl mx-auto p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header Section with Gradient */}
      <div className={`relative overflow-hidden rounded-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-gradient-to-r from-blue-500 to-blue-600'} p-8 text-white`}>
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Weather Forecast</h1>
              <p className="text-blue-100">Live weather updates and safety guidelines</p>
            </div>
            {currentWeather && (
              <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-blue-900/30' : 'bg-white/20'}`}>
                {getWeatherIcon(currentWeather.current.condition.text)}
              </div>
            )}
          </div>
        </div>
      </div>

      {currentWeather && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Current Weather Card */}
          <div className={`col-span-1 md:col-span-2 rounded-xl shadow-lg overflow-hidden ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
            <div className={`p-6 ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <h2 className="text-2xl font-bold mb-2">Current Weather</h2>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {currentWeather.location.name}, {currentWeather.location.region}, {currentWeather.location.country}
              </p>
            </div>
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="mr-4">
                    {getWeatherIcon(currentWeather.current.condition.text)}
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold">{currentWeather.current.temp_c}°C</h3>
                    <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {currentWeather.current.condition.text}
                    </p>
                  </div>
                </div>
                <div className={`text-right ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <p>Feels like: {currentWeather.current.feelslike_c}°C</p>
                  <p>Updated: {new Date(currentWeather.current.last_updated).toLocaleTimeString()}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex items-center mb-2">
                    <Wind className="h-5 w-5 mr-2" />
                    <span className="font-medium">Wind</span>
                  </div>
                  <p className="text-xl">{currentWeather.current.wind_kph} km/h</p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {currentWeather.current.wind_dir}
                  </p>
                </div>
                
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex items-center mb-2">
                    <Droplets className="h-5 w-5 mr-2" />
                    <span className="font-medium">Humidity</span>
                  </div>
                  <p className="text-xl">{currentWeather.current.humidity}%</p>
                </div>
                
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex items-center mb-2">
                    <Thermometer className="h-5 w-5 mr-2" />
                    <span className="font-medium">Pressure</span>
                  </div>
                  <p className="text-xl">{currentWeather.current.pressure_mb} mb</p>
                </div>
                
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex items-center mb-2">
                    <Cloud className="h-5 w-5 mr-2" />
                    <span className="font-medium">Cloud</span>
                  </div>
                  <p className="text-xl">{currentWeather.current.cloud}%</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Weather Guidelines Card */}
          <div className={`rounded-xl shadow-lg overflow-hidden ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
            <div className={`p-6 ${isDarkMode ? 'bg-gray-700' : 'bg-red-50'}`}>
              <div className="flex items-center">
                <AlertTriangle className={`h-5 w-5 mr-2 ${isDarkMode ? 'text-red-400' : 'text-red-500'}`} />
                <h2 className="text-xl font-bold">Safety Guidelines</h2>
              </div>
            </div>
            
            <div className="p-6">
              <ul className="space-y-3">
                {guidelines.map((guideline, index) => (
                  <li key={index} className="flex items-start">
                    <span className={`inline-block w-2 h-2 mt-1.5 mr-2 rounded-full ${isDarkMode ? 'bg-blue-400' : 'bg-blue-500'}`}></span>
                    <span>{guideline}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      
      {/* Weather Forecast Section */}
      {forecast && (
        <div className={`rounded-xl shadow-lg overflow-hidden ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
          <div className={`p-6 ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
            <h2 className="text-2xl font-bold">3-Day Forecast</h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {forecast.forecast.forecastday.map((day) => (
                <div key={day.date} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold">{formatDate(day.date)}</h3>
                    {getWeatherIcon(day.day.condition.text)}
                  </div>
                  
                  <div className="flex justify-between mb-2">
                    <span className="text-xl font-medium">{day.day.maxtemp_c}°C</span>
                    <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{day.day.mintemp_c}°C</span>
                  </div>
                  
                  <p className={`mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {day.day.condition.text}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center">
                      <Droplets className="h-4 w-4 mr-1" />
                      <span>{day.day.avghumidity}%</span>
                    </div>
                    <div className="flex items-center">
                      <Wind className="h-4 w-4 mr-1" />
                      <span>{day.day.maxwind_kph} km/h</span>
                    </div>
                    <div className="flex items-center">
                      <CloudRain className="h-4 w-4 mr-1" />
                      <span>{day.day.daily_chance_of_rain}%</span>
                    </div>
                    <div className="flex items-center">
                      <Sun className="h-4 w-4 mr-1" />
                      <span>UV: {day.day.uv}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Weather Alerts Section */}
      {alerts && alerts.length > 0 && (
        <div className={`rounded-xl shadow-lg overflow-hidden ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
          <div className={`p-6 ${isDarkMode ? 'bg-red-900/50' : 'bg-red-50'}`}>
            <div className="flex items-center">
              <AlertTriangle className={`h-6 w-6 mr-2 ${isDarkMode ? 'text-red-400' : 'text-red-500'}`} />
              <h2 className="text-2xl font-bold">Weather Alerts</h2>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {alerts.map((alert, index) => (
                <div key={index} className={`p-4 rounded-lg border ${isDarkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'}`}>
                  <h3 className={`font-bold mb-2 ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>{alert.headline}</h3>
                  <p className="mb-2">{alert.desc}</p>
                  <div className="flex justify-between text-sm">
                    <span>Effective: {new Date(alert.effective).toLocaleString()}</span>
                    <span>Expires: {new Date(alert.expires).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}