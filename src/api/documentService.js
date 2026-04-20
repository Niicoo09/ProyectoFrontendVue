import api from './axios';

export const documentService = {
  /**
   * Obtiene la lista de todos los documentos/clientes
   */
  getAll: () => api.get('/documents'),

  /**
   * Obtiene los datos completos de un cliente: metadatos + formulario.
   * Respuesta: { id, nombre, data: {...}, createdAt, updatedAt }
   */
  getById: (id) => api.get(`/documents/data/${id}`),

  /**
   * Crea un nuevo cliente. Envía el formato DocumentCreateDTO.
   * @param {string} nombre - Nombre del cliente (apellidosNombre)
   * @param {Object} formulario - Todos los campos del formulario
   */
  create: (nombre, formulario) => api.post('/documents', { nombre, formulario }),

  /**
   * Actualiza los datos de un cliente existente. Envía el formato DocumentCreateDTO.
   * @param {string} id - UUID del cliente
   * @param {string} nombre - Nombre del cliente (apellidosNombre)
   * @param {Object} formulario - Todos los campos del formulario
   */
  update: (id, nombre, formulario) => api.put(`/documents/${id}`, { nombre, formulario }),

  /**
   * Genera y descarga un PDF de cualquier categoría
   * @param {'pdf' | 'aceptacion' | 'justificacion'} category - Categoría del documento
   * @param {string} endpoint - El sub-path (ej: 'adecuacion', 'cartel-l3')
   * @param {string} id - UUID del documento
   * @param {string} fileName - Nombre sugerido para el archivo
   */
  download: async (category, endpoint, id, fileName) => {
    let basePath = '/documents';
    if (category === 'aceptacion') basePath = '/aceptaciones';
    if (category === 'justificacion') basePath = '/justificaciones';
    if (category === 'justificaciones50') basePath = '/justificaciones50';
    if (category === 'legalizacion') basePath = '/legalizacion';

    try {
      const response = await api.get(`${basePath}/${endpoint}/${id}`, {
        responseType: 'blob',
      });
      triggerDownload(response.data, fileName);
    } catch (error) {
      console.error(`Error descargando documento (${category}/${endpoint}):`, error);
      throw error;
    }
  },

  /**
   * Obtiene el Blob de un documento para previsualización
   * @param {'pdf' | 'aceptacion' | 'justificacion' | 'legalizacion'} category - Categoría del documento
   */
  getBlob: async (category, endpoint, id) => {
    let basePath = '/documents';
    if (category === 'aceptacion') basePath = '/aceptaciones';
    if (category === 'justificacion') basePath = '/justificaciones';
    if (category === 'justificaciones50') basePath = '/justificaciones50';
    if (category === 'legalizacion') basePath = '/legalizacion';
    
    try {
      const response = await api.get(`${basePath}/${endpoint}/${id}`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error(`Error obteniendo Blob (${category}/${endpoint}):`, error);
      throw error;
    }
  }
};

/**
 * Función auxiliar para disparar la descarga en el navegador
 */
function triggerDownload(blobData, fileName) {
  const url = window.URL.createObjectURL(new Blob([blobData], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${fileName}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
