import axios from 'axios';

const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  
  // En desarrollo local si no hay variable de entorno
  if (!envUrl && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:3000/api/v1';
  }

  // En producción
  if (!envUrl) return '/api/v1';

  // Normalizar URL
  const baseUrl = envUrl.replace(/\/+$/, '');
  return baseUrl.endsWith('/api/v1') ? baseUrl : `${baseUrl}/api/v1`;
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// INTERCEPTOR DE DEPURACIÓN
api.interceptors.request.use(config => {
  console.log(`[API Request] ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
  return config;
}, error => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  response => response,
  error => {
    const errorInfo = {
      message: error.message,
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      status: error.response?.status,
      data: error.response?.data
    };
    console.error('[API Error Detail]:', errorInfo);
    
    // Solo mostramos alert en producción para ver el fallo real
    if (window.location.hostname !== 'localhost') {
      alert(`Error API: ${error.message}\nURL: ${error.config?.baseURL}${error.config?.url}\nStatus: ${error.response?.status || 'Red/CORS'}`);
    }
    
    return Promise.reject(error);
  }
);

export default api;
