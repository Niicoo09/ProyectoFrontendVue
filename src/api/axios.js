import axios from 'axios';

const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (!envUrl) return '/api/v1'; // Fallback para desarrollo local (proxy)
  
  // Si la URL ya termina en /api/v1, la usamos tal cual
  if (envUrl.endsWith('/api/v1')) return envUrl;
  
  // Si no, quitamos la barra final si existe y añadimos el prefijo
  return envUrl.replace(/\/+$/, '') + '/api/v1';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
