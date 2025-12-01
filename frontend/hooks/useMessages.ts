import { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { messagesApi, type Message, type Conversation, type ConversationDetail } from '../lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface UseMessagesReturn {
  conversations: Conversation[];
  currentConversation: ConversationDetail | null;
  unreadCount: number;
  socket: Socket | null;
  loading: boolean;
  error: string | null;
  sendMessage: (receiverId: string, content: string) => Promise<void>;
  loadConversation: (userId: string) => Promise<void>;
  markConversationAsRead: (userId: string) => Promise<void>;
  refreshConversations: () => Promise<void>;
}

export const useMessages = (): UseMessagesReturn => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<ConversationDetail | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Récupérer l'utilisateur actuel
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setUserId(user.id);
        } catch (e) {
          // Erreur silencieuse
        }
      }
    }
  }, []);

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await messagesApi.getConversations();
      setConversations(data);
    } catch (err) {
      setError('Erreur lors du chargement des conversations');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const data = await messagesApi.getUnreadCount();
      setUnreadCount(data.count);
    } catch (err) {
      // Erreur silencieuse
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token || !userId) {
      return;
    }

    // Initialiser la connexion WebSocket pour les messages
    // Render ne supporte pas bien les WebSockets, donc on utilise polling en production
    const isProduction = process.env.NODE_ENV === 'production';
    const newSocket = io(`${API_URL}/messages`, {
      auth: {
        token: token,
      },
      transports: isProduction ? ['polling'] : ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      setSocket(newSocket);
    });

    newSocket.on('connect_error', () => {
      // Ne pas bloquer l'application si WebSocket échoue
      // L'application fonctionnera toujours via l'API REST
      setError(null);
    });

    newSocket.on('new-message', (message: Message) => {
      // Mettre à jour la conversation actuelle si elle est ouverte
      setCurrentConversation(prev => {
        if (!prev) {
          return prev;
        }
        const isCurrentConversation = 
          (message.senderId === prev.otherUser.id && message.receiverId === userId) ||
          (message.receiverId === prev.otherUser.id && message.senderId === userId);
        
        if (isCurrentConversation) {
          // Vérifier si le message n'existe pas déjà (éviter les doublons)
          const messageExists = prev.messages.some(msg => msg.id === message.id);
          if (messageExists) {
            return prev;
          }
          
          return {
            ...prev,
            messages: [...prev.messages, message],
          };
        }
        return prev;
      });

      // Mettre à jour la liste des conversations
      setConversations(prev => {
        const updated = prev.map(conv => {
          if (conv.otherUser.id === message.senderId || conv.otherUser.id === message.receiverId) {
            return {
              ...conv,
              lastMessage: message,
              unreadCount: message.receiverId === userId && !message.isRead 
                ? conv.unreadCount + 1 
                : conv.unreadCount,
            };
          }
          return conv;
        });

        // Si la conversation n'existe pas encore, l'ajouter
        const exists = updated.some(conv => 
          conv.otherUser.id === message.senderId || conv.otherUser.id === message.receiverId
        );
        
        if (!exists && message.sender && message.receiver) {
          updated.unshift({
            otherUser: message.senderId === userId ? message.receiver : message.sender,
            lastMessage: message,
            unreadCount: message.receiverId === userId && !message.isRead ? 1 : 0,
          });
        }

        return updated;
      });

      // Mettre à jour le nombre de messages non lus
      if (message.receiverId === userId && !message.isRead) {
        setUnreadCount(prev => prev + 1);
      }
    });

    newSocket.on('new-message-notification', (data: { message: Message; unreadCount: number }) => {
      setUnreadCount(data.unreadCount);
    });

    newSocket.on('message-sent', (message: Message) => {
      // Le message a été envoyé avec succès
      // Mettre à jour la conversation actuelle si elle est ouverte
      setCurrentConversation(prev => {
        if (!prev) {
          return prev;
        }
        const isCurrentConversation = 
          (message.senderId === prev.otherUser.id && message.receiverId === userId) ||
          (message.receiverId === prev.otherUser.id && message.senderId === userId);
        
        if (isCurrentConversation) {
          // Vérifier si le message n'existe pas déjà (éviter les doublons)
          const messageExists = prev.messages.some(msg => msg.id === message.id);
          if (messageExists) {
            return prev;
          }
          
          return {
            ...prev,
            messages: [...prev.messages, message],
          };
        }
        return prev;
      });

      // Mettre à jour la liste des conversations
      setConversations(prev => {
        const updated = prev.map(conv => {
          if (conv.otherUser.id === message.senderId || conv.otherUser.id === message.receiverId) {
            return {
              ...conv,
              lastMessage: message,
            };
          }
          return conv;
        });

        // Si la conversation n'existe pas encore, l'ajouter
        const exists = updated.some(conv => 
          conv.otherUser.id === message.senderId || conv.otherUser.id === message.receiverId
        );
        
        if (!exists && message.sender && message.receiver) {
          updated.unshift({
            otherUser: message.senderId === userId ? message.receiver : message.sender,
            lastMessage: message,
            unreadCount: 0,
          });
        }

        return updated;
      });
    });

    newSocket.on('messages-read', (data: { userId: string }) => {
      // Mettre à jour les messages comme lus dans la conversation actuelle
      setCurrentConversation(prev => {
        if (!prev || prev.otherUser.id !== data.userId) return prev;
        return {
          ...prev,
          messages: prev.messages.map(msg => 
            msg.senderId === data.userId ? { ...msg, isRead: true } : msg
          ),
        };
      });
    });

    newSocket.on('unread-count', (data: { count: number }) => {
      setUnreadCount(data.count);
    });

    newSocket.on('error', (data: { message: string }) => {
      setError(data.message);
    });

    newSocket.on('disconnect', () => {
      // Gestion silencieuse de la déconnexion
    });

    // Charger les conversations existantes
    fetchConversations();
    fetchUnreadCount();

    return () => {
      newSocket.disconnect();
    };
  }, [userId, fetchConversations, fetchUnreadCount]);

  const sendMessage = async (receiverId: string, content: string) => {
    if (!content.trim()) {
      setError('Le message ne peut pas être vide');
      return;
    }

    // Toujours utiliser l'API REST pour garantir que le message est sauvegardé
    // Le WebSocket émettra ensuite le message via 'new-message'
    try {
      const message = await messagesApi.create(receiverId, content);
      
      // Ajouter le message immédiatement à la conversation pour feedback instantané
      setCurrentConversation(prev => {
        if (!prev) return prev;
        const isCurrentConversation = 
          (message.senderId === prev.otherUser.id && message.receiverId === userId) ||
          (message.receiverId === prev.otherUser.id && message.senderId === userId);
        
        if (isCurrentConversation) {
          const messageExists = prev.messages.some(msg => msg.id === message.id);
          if (messageExists) return prev;
          
          return {
            ...prev,
            messages: [...prev.messages, message],
          };
        }
        return prev;
      });
      
      // Si WebSocket est connecté, émettre aussi pour notification temps réel
      if (socket && socket.connected) {
        socket.emit('send-message', { receiverId, content });
      }
    } catch (apiErr: any) {
      setError(apiErr.response?.data?.message || 'Erreur lors de l\'envoi du message');
    }
  };

  const loadConversation = async (userId: string) => {
    try {
      setLoading(true);
      const data = await messagesApi.getConversation(userId);
      setCurrentConversation(data);

      // Rejoindre la room de conversation via WebSocket
      if (socket) {
        socket.emit('join-conversation', { otherUserId: userId });
        // Marquer comme lu
        socket.emit('mark-conversation-read', { otherUserId: userId });
      }

      // Mettre à jour le nombre de messages non lus dans la liste
      setConversations(prev => prev.map(conv => 
        conv.otherUser.id === userId ? { ...conv, unreadCount: 0 } : conv
      ));
    } catch (err) {
      setError('Erreur lors du chargement de la conversation');
    } finally {
      setLoading(false);
    }
  };

  const markConversationAsRead = async (userId: string) => {
    try {
      await messagesApi.markConversationAsRead(userId);
      if (socket) {
        socket.emit('mark-conversation-read', { otherUserId: userId });
      }
      setConversations(prev => prev.map(conv => 
        conv.otherUser.id === userId ? { ...conv, unreadCount: 0 } : conv
      ));
    } catch (err) {
      // Erreur silencieuse
    }
  };

  const refreshConversations = async () => {
    await fetchConversations();
    await fetchUnreadCount();
  };

  return {
    conversations,
    currentConversation,
    unreadCount,
    socket,
    loading,
    error,
    sendMessage,
    loadConversation,
    markConversationAsRead,
    refreshConversations,
  };
};

