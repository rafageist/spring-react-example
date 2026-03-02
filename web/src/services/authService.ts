import { LoginCredentials, RegisterData, AuthResponse } from '../types/Auth';

const API_URL = 'http://localhost:8080/api';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al iniciar sesión');
    }

    return response.json();
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al registrarse');
    }

    return response.json();
  },

  async getCurrentUser(token: string): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Sesión inválida');
    }

    return response.json();
  },

  saveToken(token: string) {
    localStorage.setItem('authToken', token);
  },

  getToken(): string | null {
    return localStorage.getItem('authToken');
  },

  removeToken() {
    localStorage.removeItem('authToken');
  },

  saveUser(user: { userId: string; username: string; fullName: string; role: string }) {
    localStorage.setItem('authUser', JSON.stringify(user));
  },

  getUser() {
    const user = localStorage.getItem('authUser');
    return user ? JSON.parse(user) : null;
  },

  removeUser() {
    localStorage.removeItem('authUser');
  },

  logout() {
    this.removeToken();
    this.removeUser();
  },
};
