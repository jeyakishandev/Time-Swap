import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Instance Axios configurée
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      Cookies.remove('token');
      Cookies.remove('user');
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  },
);

// Types
export interface User {
  id: string;
  email: string;
  username: string;
  credits: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Transaction {
  id: string;
  amount: number;
  description: string | null;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  senderId: string;
  receiverId: string;
  createdAt: string;
  updatedAt: string;
  sender?: {
    id: string;
    username: string;
    email: string;
  };
  receiver?: {
    id: string;
    username: string;
    email: string;
  };
}

// API Auth
export const authApi = {
  register: async (email: string, username: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/register', {
      email,
      username,
      password,
    });
    return data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/login', {
      email,
      password,
    });
    return data;
  },
};

// API Users
export const usersApi = {
  getProfile: async (): Promise<User> => {
    const { data } = await api.get<User>('/users/me');
    return data;
  },

  getAll: async (): Promise<User[]> => {
    const { data } = await api.get<User[]>('/users');
    return data;
  },

  getTransactions: async (): Promise<Transaction[]> => {
    const { data } = await api.get<Transaction[]>('/users/me/transactions');
    return data;
  },
};

// API Transactions
export const transactionsApi = {
  transfer: async (
    senderId: string,
    receiverId: string,
    amount: number,
    description?: string,
  ): Promise<Transaction> => {
    const { data } = await api.post<Transaction>('/transactions/transfer', {
      senderId,
      receiverId,
      amount,
      description,
    });
    return data;
  },

  getAll: async (): Promise<Transaction[]> => {
    const { data } = await api.get<Transaction[]>('/transactions');
    return data;
  },

  getOne: async (id: string): Promise<Transaction> => {
    const { data } = await api.get<Transaction>(`/transactions/${id}`);
    return data;
  },
};

export default api;

