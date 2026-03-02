export interface User {
  userId: string;
  username: string;
  fullName: string;
  role: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  password: string;
  fullName: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  fullName: string;
  role: string;
  userId: string;
}
