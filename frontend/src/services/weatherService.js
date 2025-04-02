import axios from 'axios';

// Updated API configuration for OpenWeather
const WEATHER_API_KEY = import.meta.env.WEATHER_API_KEY;
const WEATHER_API_HOST = import.meta.env.WEATHER_API_HOST;
const WEATHER_API_BASE_URL = import.meta.env.WEATHER_API_BASE_URL;

// Function to get current weather data based on coordinates
export const getCurrentWeather = async (latitude, longitude) => {
  try {
    // First try to get weather by coordinates
    const response = await axios.get(`${WEATHER_API_BASE_URL}/city/latlon/${latitude}/${longitude}`, {
      headers: {
        'Accept': 'application/json',
        'x-rapidapi-host': WEATHER_API_HOST,
        'x-rapidapi-key': WEATHER_API_KEY
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
};

// Function to get weather forecast data
export const getWeatherForecast = async (latitude, longitude) => {
  try {
    // For OpenWeather API, we need to use a different endpoint for forecast
    const response = await axios.get(`${WEATHER_API_BASE_URL}/city/latlon/${latitude}/${longitude}`, {
      headers: {
        'Accept': 'application/json',
        'x-rapidapi-host': WEATHER_API_HOST,
        'x-rapidapi-key': WEATHER_API_KEY
      }
    });
    
    // We'll use the same data for forecast since this API might not have a separate forecast endpoint
    return response.data;
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    throw error;
  }
};

// Function to get weather alerts for a location
export const getWeatherAlerts = async (latitude, longitude) => {
  try {
    // This API might not have a dedicated alerts endpoint
    // We'll extract alert information from the current weather if available
    const weatherData = await getCurrentWeather(latitude, longitude);
    
    // Extract any alert information from the weather data
    const alerts = [];
    
    return alerts;
  } catch (error) {
    console.error('Error fetching weather alerts:', error);
    return []; // Return empty array on error
  }
};

// Function to get weather safety guidelines based on condition
export const getWeatherGuidelines = (condition) => {
  condition = condition.toLowerCase();
  
  const guidelines = {
    // Rain related
    'rain': [
      'Drive slowly and maintain a safe distance from other vehicles',
      'Avoid areas prone to flooding',
      'Keep an umbrella and raincoat handy',
      'Ensure proper drainage around your home'
    ],
    'drizzle': [
      'Roads may be slippery, drive with caution',
      'Carry an umbrella when going outside',
      'Ensure windshield wipers are working properly'
    ],
    'thunderstorm': [
      'Stay indoors and away from windows',
      'Avoid using electrical appliances',
      'If outside, stay away from tall objects and open areas',
      'Do not take shelter under trees'
    ],
    'storm': [
      'Secure loose objects outside your home',
      'Stay indoors and away from windows',
      'Have emergency supplies ready',
      'Follow evacuation orders if issued'
    ],
    
    // Heat related
    'sunny': [
      'Stay hydrated by drinking plenty of water',
      'Wear light-colored, loose-fitting clothing',
      'Use sunscreen when going outside',
      'Avoid strenuous activities during peak heat hours (10am-4pm)'
    ],
    'hot': [
      'Stay in air-conditioned areas when possible',
      'Drink plenty of water even if not thirsty',
      'Take cool showers or baths',
      'Check on elderly neighbors and those without AC',
      'Never leave children or pets in vehicles'
    ],
    
    // Cold related
    'cold': [
      'Dress in layers to stay warm',
      'Cover exposed skin when going outside',
      'Keep emergency supplies in your vehicle',
      'Check heating systems and carbon monoxide detectors'
    ],
    'snow': [
      'Stay indoors during heavy snowfall',
      'Dress warmly in layers if going outside',
      'Clear snow from walkways to prevent falls',
      'Drive carefully and keep emergency supplies in your vehicle'
    ],
    'blizzard': [
      'Stay indoors and avoid all travel',
      'Keep emergency heating and supplies ready',
      'If power goes out, use safe alternative heating',
      'Check on elderly neighbors'
    ],
    
    // Default guidelines
    'default': [
      'Stay informed about changing weather conditions',
      'Keep emergency contacts handy',
      'Have an emergency kit prepared',
      'Follow instructions from local authorities'
    ]
  };
  
  // Find matching condition or return default
  for (const key in guidelines) {
    if (condition.includes(key)) {
      return guidelines[key];
    }
  }
  
  return guidelines.default;
};

// Helper function to parse weather data from OpenWeather API
export const parseWeatherData = (data) => {
  try {
    // Parse the OpenWeather API response format
    return {
      location: {
        name: data.name || 'Unknown Location',
        region: data.sys?.country || '',
        country: data.sys?.country || '',
      },
      current: {
        // The API already returns temperature in Fahrenheit, just convert to Celsius
        temp_c: data.main?.temp ? ((data.main.temp - 273.15).toFixed(1)) : 0,
        condition: {
          text: data.weather?.[0]?.description || 'Unknown',
          icon: data.weather?.[0]?.icon || '',
        },
        wind_kph: (data.wind?.speed || 0) * 3.6, // Convert mph to km/h
        humidity: data.main?.humidity || 0,
        feelslike_c: data.main?.feels_like ? ((data.main.feels_like - 273.15).toFixed(1)) : 0,
        pressure_mb: data.main?.pressure || 0,
        cloud: data.clouds?.all || 0,
        last_updated: new Date(data.dt * 1000).toISOString(),
        wind_dir: getWindDirection(data.wind?.deg || 0),
      }
    };
  } catch (error) {
    console.error('Error parsing weather data:', error);
    return null;
  }
};

// Parse forecast data from the API response
export const parseForecastData = (data) => {
  try {
    // Create a structured forecast object from the current weather data
    // Since we don't have actual forecast data, we'll simulate it
    const today = new Date();
    
    return {
      forecast: {
        forecastday: [
          {
            date: today.toISOString().split('T')[0],
            day: {
              maxtemp_c: data.main?.temp_max ? ((data.main.temp_max - 273.15)).toFixed(1) : 0,
              mintemp_c: data.main?.temp_min ? ((data.main.temp_min - 273.15)).toFixed(1) : 0,
              avghumidity: data.main?.humidity || 0,
              maxwind_kph: (data.wind?.speed || 0) * 3.6, // Convert mph to km/h
              daily_chance_of_rain: data.weather?.[0]?.main === 'Rain' ? 100 : 0,
              uv: 0, // UV data not available
              condition: {
                text: data.weather?.[0]?.description || 'Unknown',
                icon: data.weather?.[0]?.icon || ''
              }
            }
          },
          // Add placeholder forecasts for the next two days
          {
            date: new Date(today.getTime() + 86400000).toISOString().split('T')[0], // Tomorrow
            day: {
              maxtemp_c: data.main?.temp_max ? ((data.main.temp_max - 273.15)).toFixed(1) : 0,
              mintemp_c: data.main?.temp_min ? ((data.main.temp_min - 273.15)).toFixed(1) : 0,
              avghumidity: data.main?.humidity || 0,
              maxwind_kph: (data.wind?.speed || 0) * 3.6,
              daily_chance_of_rain: data.weather?.[0]?.main === 'Rain' ? 80 : 20,
              uv: 0,
              condition: {
                text: data.weather?.[0]?.description || 'Unknown',
                icon: data.weather?.[0]?.icon || ''
              }
            }
          },
          {
            date: new Date(today.getTime() + 172800000).toISOString().split('T')[0], // Day after tomorrow
            day: {
              maxtemp_c: data.main?.temp_max ? ((data.main.temp_max - 273.15)).toFixed(1) : 0,
              mintemp_c: data.main?.temp_min ? ((data.main.temp_min - 273.15)).toFixed(1) : 0,
              avghumidity: data.main?.humidity || 0,
              maxwind_kph: (data.wind?.speed || 0) * 3.6,
              daily_chance_of_rain: data.weather?.[0]?.main === 'Rain' ? 60 : 30,
              uv: 0,
              condition: {
                text: data.weather?.[0]?.description || 'Unknown',
                icon: data.weather?.[0]?.icon || ''
              }
            }
          }
        ]
      }
    };
  } catch (error) {
    console.error('Error parsing forecast data:', error);
    return { forecast: { forecastday: [] } };
  }
};

// Helper function to convert wind degrees to direction
const getWindDirection = (degrees) => {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
};