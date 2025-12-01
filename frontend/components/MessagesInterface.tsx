'use client';

import { useState, useRef, useEffect } from 'react';
import { useMessages } from '../hooks/useMessages';
import { usersApi, type User } from '../lib/api';
import { TbSend } from 'react-icons/tb';

export default function MessagesInterface() {
  console.log('[MessagesInterface] Composant rendu');
  
  const {
    conversations,
    currentConversation,
    unreadCount,
    loading,
    error,
    sendMessage,
    loadConversation,
    markConversationAsRead,
  } = useMessages();

  console.log('[MessagesInterface] État:', {
    conversationsCount: conversations.length,
    hasCurrentConversation: !!currentConversation,
    loading,
    error,
    unreadCount,
  });

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Charger la liste des utilisateurs pour démarrer une nouvelle conversation
  useEffect(() => {
    console.log('[MessagesInterface] Chargement des utilisateurs...');
    const fetchUsers = async () => {
      try {
        const data = await usersApi.getAll();
        console.log('[MessagesInterface] Utilisateurs chargés:', data.length);
        setUsers(data);
      } catch (err) {
        console.error('[MessagesInterface] Erreur lors du chargement des utilisateurs:', err);
      }
    };
    fetchUsers();
  }, []);

  // Faire défiler vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation?.messages]);

  // Charger une conversation
  const handleSelectConversation = async (userId: string) => {
    console.log('[MessagesInterface] Sélection conversation:', userId);
    setSelectedUserId(userId);
    try {
      await loadConversation(userId);
      console.log('[MessagesInterface] Conversation chargée');
      await markConversationAsRead(userId);
      setShowUserSearch(false);
    } catch (err) {
      console.error('[MessagesInterface] Erreur lors du chargement de la conversation:', err);
    }
  };

  // Démarrer une nouvelle conversation
  const handleStartNewConversation = async (userId: string) => {
    setSelectedUserId(userId);
    await loadConversation(userId);
    setShowUserSearch(false);
    setUserSearchTerm('');
  };

  // Envoyer un message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[MessagesInterface] Tentative d\'envoi de message:', { selectedUserId, messageInput: messageInput.trim() });
    
    if (!messageInput.trim() || !selectedUserId) {
      console.warn('[MessagesInterface] Message vide ou pas de destinataire');
      return;
    }

    const content = messageInput.trim();
    setMessageInput(''); // Vider le champ immédiatement pour meilleure UX
    
    try {
      console.log('[MessagesInterface] Envoi du message...');
      await sendMessage(selectedUserId, content);
      console.log('[MessagesInterface] Message envoyé avec succès');
    } catch (err) {
      // En cas d'erreur, remettre le message dans le champ
      setMessageInput(content);
      console.error('[MessagesInterface] Erreur lors de l\'envoi du message:', err);
    }
  };

  // Filtrer les utilisateurs pour la recherche
  const filteredUsers = users.filter(user => {
    const currentUserId = typeof window !== 'undefined' 
      ? JSON.parse(localStorage.getItem('user') || 'null')?.id 
      : null;
    
    if (user.id === currentUserId) return false;
    
    const searchLower = userSearchTerm.toLowerCase();
    return user.username.toLowerCase().includes(searchLower) || 
           user.email.toLowerCase().includes(searchLower);
  });

  // Obtenir l'utilisateur actuel
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setCurrentUser(user);
        } catch (e) {
          console.error('Erreur lors du parsing de l\'utilisateur:', e);
        }
      }
    }
  }, []);

  // Formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  // Générer l'avatar
  const getAvatarUrl = (seed?: string, username?: string) => {
    const avatarSeed = seed || username || 'default';
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`;
  };

  if (loading && !currentConversation) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-400">Chargement des conversations...</div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-[#1a2332] rounded-lg overflow-hidden">
      {/* Liste des conversations - Sidebar */}
      <div className="w-full md:w-80 lg:w-96 border-r border-[#4A5C6A]/30 bg-[#1a2332] flex flex-col">
        {/* En-tête avec bouton pour démarrer une nouvelle conversation */}
        <div className="p-4 border-b border-[#4A5C6A]/30 bg-[#253745]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold text-white">Messages</h2>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={() => setShowUserSearch(!showUserSearch)}
            className="w-full px-4 py-2 bg-[#4A5C6A] hover:bg-[#5a6c7a] text-white rounded-lg transition-colors text-sm font-medium"
          >
            + Nouvelle conversation
          </button>
          
          {/* Aide pour les comptes de test */}
          {conversations.length === 0 && !showUserSearch && (
            <div className="mt-3 p-3 bg-[#1a2332] rounded-lg border border-[#4A5C6A]/30">
              <p className="text-xs text-gray-400 mb-2">💡 Pour tester la messagerie :</p>
              <p className="text-xs text-gray-500 mb-1">1. Ouvrez un autre onglet/navigateur</p>
              <p className="text-xs text-gray-500 mb-1">2. Connectez-vous avec un autre compte :</p>
              <div className="text-xs text-gray-400 mt-2 space-y-1">
                <p>• alice@example.com / password123</p>
                <p>• bob@example.com / password123</p>
                <p>• charlie@example.com / password123</p>
              </div>
            </div>
          )}
        </div>

        {/* Recherche d'utilisateur */}
        {showUserSearch && (
          <div className="p-4 border-b border-[#4A5C6A]/30 bg-[#253745]">
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={userSearchTerm}
              onChange={(e) => setUserSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-[#1a2332] border border-[#4A5C6A]/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4A5C6A]"
            />
            <div className="mt-2 max-h-48 overflow-y-auto">
              {filteredUsers.map(user => (
                <button
                  key={user.id}
                  onClick={() => handleStartNewConversation(user.id)}
                  className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-[#1a2332] rounded-lg transition-colors text-left"
                >
                  <img
                    src={getAvatarUrl(user.avatarSeed, user.username)}
                    alt={user.username}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium truncate">{user.username}</div>
                    <div className="text-gray-400 text-sm truncate">{user.email}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Liste des conversations */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              <p>Aucune conversation</p>
              <p className="text-sm mt-2">Commencez une nouvelle conversation pour démarrer</p>
              <div className="mt-4 p-3 bg-[#253745] rounded-lg border border-[#4A5C6A]/30 text-left">
                <p className="text-xs text-gray-300 mb-2 font-semibold">💡 Comptes de test disponibles :</p>
                <div className="text-xs text-gray-400 space-y-1">
                  <p>• alice@example.com</p>
                  <p>• bob@example.com</p>
                  <p>• charlie@example.com</p>
                  <p>• diana@example.com</p>
                  <p className="text-gray-500 mt-2">Mot de passe : password123</p>
                </div>
              </div>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.otherUser.id}
                onClick={() => handleSelectConversation(conv.otherUser.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 border-b border-[#4A5C6A]/10 hover:bg-[#253745] transition-colors ${
                  selectedUserId === conv.otherUser.id ? 'bg-[#253745] border-l-4 border-l-[#4A5C6A]' : ''
                }`}
              >
                <div className="relative">
                  <img
                    src={getAvatarUrl(conv.otherUser.avatarSeed, conv.otherUser.username)}
                    alt={conv.otherUser.username}
                    className="w-12 h-12 rounded-full"
                  />
                  {conv.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-white font-semibold truncate">{conv.otherUser.username}</div>
                    {conv.lastMessage && (
                      <span className="text-gray-400 text-xs">
                        {formatDate(conv.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  {conv.lastMessage && (
                    <div className="text-gray-400 text-sm truncate">
                      {conv.lastMessage.content}
                    </div>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Zone de chat principale */}
      <div className="flex-1 flex flex-col bg-[#1a2332]">
        {selectedUserId && currentConversation ? (
          <>
            {/* En-tête de la conversation */}
            <div className="p-4 border-b border-[#4A5C6A]/30 bg-[#253745]">
              <div className="flex items-center space-x-3">
                <img
                  src={getAvatarUrl(currentConversation.otherUser.avatarSeed, currentConversation.otherUser.username)}
                  alt={currentConversation.otherUser.username}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <div className="text-white font-semibold">{currentConversation.otherUser.username}</div>
                  <div className="text-gray-400 text-sm">{currentConversation.otherUser.email}</div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {currentConversation.messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <p>Aucun message. Commencez la conversation !</p>
                </div>
              ) : (
                currentConversation.messages.map((message) => {
                  const isOwnMessage = message.senderId === currentUser?.id;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-start space-x-2 max-w-[70%] ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        {!isOwnMessage && (
                          <img
                            src={getAvatarUrl(currentConversation.otherUser.avatarSeed, currentConversation.otherUser.username)}
                            alt={currentConversation.otherUser.username}
                            className="w-8 h-8 rounded-full flex-shrink-0"
                          />
                        )}
                        <div className={`rounded-lg px-4 py-2 ${
                          isOwnMessage 
                            ? 'bg-[#4A5C6A] text-white' 
                            : 'bg-[#253745] text-white'
                        }`}>
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            isOwnMessage ? 'text-gray-300' : 'text-gray-400'
                          }`}>
                            {formatDate(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Formulaire d'envoi de message */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-[#4A5C6A]/30 bg-[#253745]">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Tapez votre message..."
                  className="flex-1 px-4 py-2 bg-[#1a2332] border border-[#4A5C6A]/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4A5C6A]"
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className="px-4 py-2 bg-[#4A5C6A] hover:bg-[#5a6c7a] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <TbSend className="w-5 h-5" />
                  <span>Envoyer</span>
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <p className="text-lg mb-2">Sélectionnez une conversation</p>
              <p className="text-sm">ou démarrez une nouvelle conversation</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
}

