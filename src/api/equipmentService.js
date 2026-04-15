import axios from 'axios';

const API_BASE_URL = '/api/equipment';

export const equipmentService = {
  /**
   * Fetches equipment from the backend DB based on type.
   * Types usually: 'modulos', 'inversores', 'baterias'
   * @param {string} equipmentType 
   */
  async getByType(equipmentType) {
    try {
      const response = await axios.get(`${API_BASE_URL}/${equipmentType}`);
      return response.data;
    } catch (error) {
      console.warn(`[equipmentService] Could not fetch ${equipmentType} from backend api, using static fallback if available.`, error);
      throw error;
    }
  }
};
