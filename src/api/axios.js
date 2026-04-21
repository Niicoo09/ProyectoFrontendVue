import axios from 'axios';

// LOG DE CONTROL PARA SABER SI EL ARCHIVO SE HA ACTUALIZADO
console.warn('[DEBUG-V4] VERSION FINAL - SIN CACHE');
// Timestamp: 2026-04-21 11:58

const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  console.log('[DEBUG] VITE_API_BASE_URL detectada:', envUrl);

  if (envUrl) {
    // Limpiar barras finales y asegurar /api/v1/
    const cleaned = envUrl.replace(/\/+$/, '');
    const final = cleaned.endsWith('/api/v1') ? cleaned : `${cleaned}/api/v1`;
    return final + '/'; // Forzamos barra final
  }

  // Fallback para LOCALHOST
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3000/api/v1/';
  }

  return '/api/v1';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  r => r,
  error => {
    console.error('[DEBUG] Error en petición:', {
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      status: error.response?.status,
      message: error.message
    });
    return Promise.reject(error);
  }
);

export default api;
