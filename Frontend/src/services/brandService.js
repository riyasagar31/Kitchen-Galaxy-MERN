import api from './api'; // Import your existing axios instance

export const brandService = {
  // Get all brands
  getBrands: async () => {
    const response = await api.get('/brands');
    return response.data;
  },

  // Create new brand (Admin only)
  createBrand: async (brandData) => {
    const response = await api.post('/brands', brandData);
    return response.data;
  },

  // Update brand (Admin only)
  updateBrand: async (id, brandData) => {
    const response = await api.put(`/brands/${id}`, brandData);
    return response.data;
  },

  // Delete brand (Admin only)
  deleteBrand: async (id) => {
    const response = await api.delete(`/brands/${id}`);
    return response.data;
  }
};