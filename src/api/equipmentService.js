import axios from 'axios';

const API_BASE_URL = '/api/v1/equipment';

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
  },

  /**
   * Creates a new equipment entry.
   */
  async create(equipmentType, data) {
    try {
      const response = await axios.post(`${API_BASE_URL}/${equipmentType}`, data);
      return response.data;
    } catch (error) {
      console.error(`[equipmentService] Failed to create ${equipmentType}:`, error);
      throw error;
    }
  },

  /**
   * Updates an existing equipment entry.
   */
  async update(equipmentType, id, data) {
    try {
      const response = await axios.put(`${API_BASE_URL}/${equipmentType}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`[equipmentService] Failed to update ${equipmentType} (ID: ${id}):`, error);
      throw error;
    }
  },

  /**
   * Deletes an equipment entry.
   */
  async remove(equipmentType, id) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/${equipmentType}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`[equipmentService] Failed to delete ${equipmentType} (ID: ${id}):`, error);
      throw error;
    }
  }
};
