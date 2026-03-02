import { Product, ProductCreate } from '../types/Product';
import { authService } from './authService';

const API_URL = 'http://localhost:8080/api/products';

const getAuthHeaders = () => {
  const token = authService.getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const productService = {
  async getAll(): Promise<Product[]> {
    const response = await fetch(API_URL, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Error fetching products');
    return response.json();
  },

  async getById(id: string): Promise<Product> {
    const response = await fetch(`${API_URL}/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Product not found');
    return response.json();
  },

  async create(product: ProductCreate): Promise<Product> {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(product),
    });
    if (!response.ok) throw new Error('Error creating product');
    return response.json();
  },

  async update(id: string, product: ProductCreate): Promise<Product> {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(product),
    });
    if (!response.ok) throw new Error('Error updating product');
    return response.json();
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Error deleting product');
  },

  async search(name: string): Promise<Product[]> {
    const response = await fetch(`${API_URL}/search?name=${encodeURIComponent(name)}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Error searching products');
    return response.json();
  },
};
