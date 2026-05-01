export interface AuthUser {
  id_user: number;
  first_name: string;
  last_name: string;
  email: string;
  role: 'admin' | 'client';
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface RegisterResponse {
  message: string;
  id_user: number;
}
