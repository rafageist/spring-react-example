import { Category, Location } from '../types/Warehouse';
import { authService } from './authService';

const API_URL = 'http://localhost:8080/api';

const getAuthHeaders = () => {
  const token = authService.getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const warehouseService = {
  // Categories
  async getCategories(): Promise<Category[]> {
    const response = await fetch(`${API_URL}/categories`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Error al cargar categorías');
    return response.json();
  },

  async createCategory(category: Omit<Category, 'id'>): Promise<Category> {
    const response = await fetch(`${API_URL}/categories`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(category),
    });
    if (!response.ok) throw new Error('Error al crear categoría');
    return response.json();
  },

  async updateCategory(id: string, category: Partial<Category>): Promise<Category> {
    const response = await fetch(`${API_URL}/categories/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(category),
    });
    if (!response.ok) throw new Error('Error al actualizar categoría');
    return response.json();
  },

  async deleteCategory(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/categories/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Error al eliminar categoría');
  },

  // Locations
  async getLocations(): Promise<Location[]> {
    const response = await fetch(`${API_URL}/locations`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Error al cargar localizaciones');
    return response.json();
  },

  async createLocation(location: Omit<Location, 'id'>): Promise<Location> {
    const response = await fetch(`${API_URL}/locations`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(location),
    });
    if (!response.ok) throw new Error('Error al crear localización');
    return response.json();
  },

  async updateLocation(id: string, location: Partial<Location>): Promise<Location> {
    const response = await fetch(`${API_URL}/locations/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(location),
    });
    if (!response.ok) throw new Error('Error al actualizar localización');
    return response.json();
  },

  async deleteLocation(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/locations/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Error al eliminar localización');
  },

  // Product position update
  async updateProductPosition(
    productId: string,
    position: { posX: number; posY: number; locationId?: string | null }
  ): Promise<void> {
    const response = await fetch(`${API_URL}/products/${productId}/position`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(position),
    });
    if (!response.ok) throw new Error('Error al actualizar posición');
  },
};
