import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { notificationsApi, type Notification } from '../lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  socket: Socket | null;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const useNotifications = (): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Initialiser la connexion WebSocket avec polling uniquement en production
    // Render ne supporte pas bien les WebSockets, donc on utilise polling
    const isProduction = process.env.NODE_ENV === 'production';
    const newSocket = io(API_URL, {
      auth: {
        token: token,
      },
      transports: isProduction ? ['polling'] : ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('[useNotifications] WebSocket connecté');
      setSocket(newSocket);
    });

    newSocket.on('connect_error', (error) => {
      console.warn('[useNotifications] Erreur de connexion WebSocket:', error.message);
      // Ne pas bloquer l'application si WebSocket échoue
      setError(null); // Réinitialiser l'erreur pour ne pas bloquer l'UI
    });

    newSocket.on('new-notification', (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    newSocket.on('disconnect', () => {
      console.log('[useNotifications] WebSocket déconnecté');
    });

    // Charger les notifications existantes
    fetchNotifications(token);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const fetchNotifications = async (token: string) => {
    try {
      setLoading(true);
      const data = await notificationsApi.getAll();
      setNotifications(data);
      setUnreadCount(data.filter((n: Notification) => !n.isRead).length);
    } catch (err) {
      setError('Erreur lors du chargement des notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationsApi.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      // Erreur silencieuse
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      // Erreur silencieuse
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await notificationsApi.delete(notificationId);
      const notification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      if (notification && !notification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      // Erreur silencieuse
    }
  };

  return {
    notifications,
    unreadCount,
    socket,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loading,
    error,
  };
};

