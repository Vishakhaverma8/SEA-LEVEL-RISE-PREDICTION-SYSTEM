import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

const handleError = (error) => {
  if (error.response) {
    console.error('API Error:', error.response.data);
    return {
      success: false,
      error: error.response.data.message || 'Server error',
      status: error.response.status
    };
  } else if (error.request) {
    console.error('Network Error:', error.request);
    return {
      success: false,
      error: 'Network error - Cannot reach server',
      status: 0
    };
  } else {
    console.error('Error:', error.message);
    return {
      success: false,
      error: error.message,
      status: 0
    };
  }
};


// WEATHER API METHODS

export const getWeather = async (city) => {
  try {
    const response = await api.get(`/weather/${city}`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return handleError(error);
  }
};

export const getWeatherByCoords = async (lat, lon) => {
  try {
    const response = await api.get(`/weather/coords?lat=${lat}&lon=${lon}`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return handleError(error);
  }
};

export const getForecast = async (city) => {
  try {
    const response = await api.get(`/forecast/${city}`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return handleError(error);
  }
};

export const searchCity = async (query) => {
  try {
    const response = await api.get(`/search/${query}`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return handleError(error);
  }
};

export const getMapboxToken = async () => {
  try {
    const response = await api.get('/mapbox-token');
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return handleError(error);
  }
};

// DAY 1 METHODS


export const testConnection = async () => {
  try {
    const response = await api.get('/status');
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return handleError(error);
  }
};


// CLIMATE DATA METHODS

export const getTemperatureHistory = async (startYear = 1950, endYear = 2024) => {
  try {
    const response = await api.get(`/climate/temperature-history?start_year=${startYear}&end_year=${endYear}`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return handleError(error);
  }
};

export const getCO2History = async (startYear = 1950, endYear = 2024) => {
  try {
    const response = await api.get(`/climate/co2-history?start_year=${startYear}&end_year=${endYear}`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return handleError(error);
  }
};

export const getGlobalStats = async () => {
  try {
    const response = await api.get('/climate/global-stats');
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return handleError(error);
  }
};

export const getClimateSummary = async () => {
  try {
    const response = await api.get('/climate/summary');
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return handleError(error);
  }
};

export const getTemperatureAnomaly = async (year) => {
  try {
    const response = await api.get(`/climate/anomaly/${year}`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return handleError(error);
  }
};


export default api;

// ============================================
// DAY 4: SEA LEVEL & CO2 API METHODS
// ============================================

export const getCurrentSeaLevel = async () => {
  try {
    const response = await api.get('/sealevel/current');
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return handleError(error);
  }
};

export const getStationSeaLevel = async (stationId) => {
  try {
    const response = await api.get(`/sealevel/station/${stationId}`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return handleError(error);
  }
};

export const getTideStations = async () => {
  try {
    const response = await api.get('/sealevel/stations');
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return handleError(error);
  }
};

export const getCurrentCO2 = async () => {
  try {
    const response = await api.get('/climate/co2/current');
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return handleError(error);
  }
};

export const searchCitiesForPrediction = async (query) => {
  try {
    const response = await api.get(`/ml/sealevel/search/${query}`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return handleError(error);
  }
};

export const predictAnyCitySeaLevel = async (city, scenario, years) => {
  try {
    const response = await api.get(`/ml/sealevel/predict/any/${city}`, {
      params: { scenario, years }
    });
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return handleError(error);
  }
};

