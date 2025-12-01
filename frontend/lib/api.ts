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
    // Utiliser localStorage si disponible, sinon Cookies
    const token = typeof window !== 'undefined' 
      ? localStorage.getItem('token') || Cookies.get('token')
      : Cookies.get('token');
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
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('currentUser');
        window.location.href = '/auth/login';
      } else {
        Cookies.remove('token');
        Cookies.remove('user');
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
  avatarSeed?: string;
  credits: number;
  createdAt?: string;
  updatedAt?: string;
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

  forgotPassword: async (email: string): Promise<{ message: string; resetLink?: string }> => {
    const { data } = await api.post<{ message: string; resetLink?: string }>('/auth/forgot-password', {
      email,
    });
    return data;
  },

  resetPassword: async (token: string, newPassword: string): Promise<{ message: string }> => {
    const { data } = await api.post<{ message: string }>('/auth/reset-password', {
      token,
      newPassword,
    });
    return data;
  },
};

// Types supplémentaires
export interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  pricePerHour: number;
  isActive: boolean;
  providerId: string;
  provider?: User;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  clientId: string;
  serviceId: string;
  providerId: string;
  hours: number;
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  scheduledAt?: string;
  createdAt: string;
  updatedAt: string;
  client?: User;
  service?: Service;
  provider?: User;
}

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  reviewerId: string;
  revieweeId: string;
  serviceId?: string;
  bookingId?: string;
  createdAt: string;
  updatedAt: string;
  reviewer?: User;
  reviewee?: User;
  service?: Service;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  sender?: User;
  receiver?: User;
}

export interface Conversation {
  otherUser: User;
  lastMessage: Message | null;
  unreadCount: number;
}

export interface ConversationDetail {
  otherUser: User;
  messages: Message[];
}

// Types pour la pagination
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// Type pour les paramètres de pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
}

// Fonction utilitaire pour extraire les données d'une réponse (paginée ou non)
export function extractData<T>(response: T[] | PaginatedResponse<T>): T[] {
  if (Array.isArray(response)) {
    return response;
  }
  if (response && typeof response === 'object' && 'data' in response) {
    return (response as PaginatedResponse<T>).data;
  }
  return [];
}

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

  updateProfile: async (profileData: {
    email?: string;
    username?: string;
    password?: string;
    avatarSeed?: string;
  }): Promise<User> => {
    const { data } = await api.patch<User>('/users/me', profileData);
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

  getAll: async (pagination?: PaginationParams): Promise<Transaction[] | PaginatedResponse<Transaction>> => {
    const { data } = await api.get<PaginatedResponse<Transaction>>('/transactions', {
      params: pagination,
    });
    // Retourner directement la réponse paginée
    return data;
  },

  getByUser: async (userId: string, pagination?: PaginationParams): Promise<Transaction[] | PaginatedResponse<Transaction>> => {
    const { data } = await api.get<PaginatedResponse<Transaction>>(`/transactions/user/${userId}`, {
      params: pagination,
    });
    return data;
  },

  getOne: async (id: string): Promise<Transaction> => {
    const { data } = await api.get<Transaction>(`/transactions/${id}`);
    return data;
  },
};

// API Services
export interface SearchServicesParams {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sortBy?: 'price' | 'rating' | 'createdAt' | 'title';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ServiceWithRating extends Service {
  averageRating?: number;
  reviewCount?: number;
}

export const servicesApi = {
  getAll: async (category?: string, pagination?: PaginationParams): Promise<Service[] | PaginatedResponse<Service>> => {
    const params: any = { ...pagination };
    if (category) {
      params.category = category;
    }
    const { data } = await api.get<PaginatedResponse<Service>>('/services', {
      params,
    });
    return data;
  },

  search: async (searchParams: SearchServicesParams): Promise<PaginatedResponse<ServiceWithRating>> => {
    const { data } = await api.get<PaginatedResponse<ServiceWithRating>>('/services/search', {
      params: searchParams,
    });
    return data;
  },

  getOne: async (id: string): Promise<Service> => {
    const { data } = await api.get<Service>(`/services/${id}`);
    return data;
  },

  create: async (serviceData: {
    title: string;
    description: string;
    pricePerHour: number;
    category: string;
  }): Promise<Service> => {
    const { data } = await api.post<Service>('/services', serviceData);
    return data;
  },

  update: async (id: string, serviceData: Partial<Service>): Promise<Service> => {
    const { data } = await api.patch<Service>(`/services/${id}`, serviceData);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/services/${id}`);
  },
};

// API Bookings
export const bookingsApi = {
  getMyBookings: async (): Promise<Booking[]> => {
    const { data } = await api.get<Booking[]>('/bookings/my-bookings');
    return data;
  },

  create: async (bookingData: {
    serviceId: string;
    hours: number;
    notes?: string;
    scheduledAt?: string;
  }): Promise<Booking> => {
    const { data } = await api.post<Booking>('/bookings', bookingData);
    return data;
  },

  confirm: async (id: string): Promise<Booking> => {
    const { data } = await api.patch<Booking>(`/bookings/${id}/confirm`);
    return data;
  },

  cancel: async (id: string): Promise<Booking> => {
    const { data } = await api.patch<Booking>(`/bookings/${id}/cancel`);
    return data;
  },

  complete: async (id: string): Promise<Booking> => {
    const { data } = await api.patch<Booking>(`/bookings/${id}/complete`);
    return data;
  },
};

// API Reviews
export const reviewsApi = {
  getAll: async (): Promise<Review[]> => {
    const { data } = await api.get<Review[]>('/reviews');
    return data;
  },

  getByUser: async (userId: string): Promise<Review[]> => {
    const { data } = await api.get<Review[]>(`/reviews/user/${userId}`);
    return data;
  },

  getByService: async (serviceId: string): Promise<Review[]> => {
    const { data } = await api.get<Review[]>(`/reviews/service/${serviceId}`);
    return data;
  },

  getServiceAverage: async (serviceId: string): Promise<{ average: number; count: number }> => {
    const { data } = await api.get<{ average: number; count: number }>(`/public/reviews/service/${serviceId}/average`);
    return data;
  },

  create: async (reviewData: {
    revieweeId: string;
    rating: number;
    comment?: string;
    serviceId?: string;
    bookingId?: string;
  }): Promise<Review> => {
    const { data } = await api.post<Review>('/reviews', reviewData);
    return data;
  },
};

// API Notifications
export const notificationsApi = {
  getAll: async (): Promise<Notification[]> => {
    const { data } = await api.get<Notification[]>('/notifications');
    return data;
  },

  markAsRead: async (id: string): Promise<Notification> => {
    const { data } = await api.patch<Notification>(`/notifications/${id}/read`);
    return data;
  },

  markAllAsRead: async (): Promise<void> => {
    await api.patch('/notifications/mark-all-read');
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/notifications/${id}`);
  },
};

// API Messages
export const messagesApi = {
  create: async (receiverId: string, content: string): Promise<Message> => {
    const { data } = await api.post<Message>('/messages', {
      receiverId,
      content,
    });
    return data;
  },

  getConversations: async (): Promise<Conversation[]> => {
    const { data } = await api.get<Conversation[]>('/messages/conversations');
    return data;
  },

  getConversation: async (userId: string): Promise<ConversationDetail> => {
    const { data } = await api.get<ConversationDetail>(`/messages/conversations/${userId}`);
    return data;
  },

  getUnreadCount: async (): Promise<{ count: number }> => {
    const { data } = await api.get<{ count: number }>('/messages/unread-count');
    return data;
  },

  markAsRead: async (messageId: string): Promise<Message> => {
    const { data } = await api.patch<Message>(`/messages/${messageId}/read`);
    return data;
  },

  markConversationAsRead: async (userId: string): Promise<void> => {
    await api.patch(`/messages/conversations/${userId}/read`);
  },

  delete: async (messageId: string): Promise<void> => {
    await api.delete(`/messages/${messageId}`);
  },
};

export default api;

