'use client';

import { useState } from 'react';
import { useNotifications } from '../hooks/useNotifications';

interface NotificationCenterProps {
  className?: string;
}

export default function NotificationCenter({ className = '' }: NotificationCenterProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'BOOKING_REQUEST':
        return '📋';
      case 'BOOKING_CONFIRMED':
        return '✅';
      case 'BOOKING_CANCELLED':
        return '❌';
      case 'PAYMENT_RECEIVED':
        return '💰';
      case 'BOOKING_COMPLETED':
        return '🎉';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'BOOKING_REQUEST':
        return 'text-blue-400';
      case 'BOOKING_CONFIRMED':
        return 'text-green-400';
      case 'BOOKING_CANCELLED':
        return 'text-red-400';
      case 'PAYMENT_RECEIVED':
        return 'text-yellow-400';
      case 'BOOKING_COMPLETED':
        return 'text-purple-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Bouton de notification */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-3 text-white rounded-xl transition-all duration-300 transform hover:scale-105 ${
          unreadCount > 0 
            ? 'bg-gradient-to-r from-[#4A5C6A] to-[#9BA8AB] shadow-lg shadow-blue-500/25' 
            : 'bg-white/10 hover:bg-white/20'
        }`}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel des notifications */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-80 bg-[#11212D] backdrop-blur-md rounded-xl border border-[#4A5C6A] shadow-2xl z-50">
          {/* Header */}
          <div className="p-4 border-b border-[#4A5C6A] bg-gradient-to-r from-[#253745] to-[#4A5C6A] rounded-t-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-bold text-lg">🔔 Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm bg-[#4A5C6A] hover:bg-[#253745] text-white px-3 py-1 rounded-lg transition-colors font-medium"
                >
                  Tout marquer lu
                </button>
              )}
            </div>
          </div>

          {/* Liste des notifications */}
          <div className="max-h-96 overflow-y-auto bg-[#06141B] modal-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-300 bg-[#06141B] rounded-b-xl">
                <div className="text-4xl mb-2">🔕</div>
                <p className="text-gray-400">Aucune notification</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-[#253745] hover:bg-[#11212D] transition-all duration-200 ${
                    !notification.isRead ? 'bg-gradient-to-r from-[#253745]/50 to-[#4A5C6A]/30 border-l-4 border-l-blue-400' : 'bg-[#06141B]'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className={`font-bold text-sm ${getNotificationColor(notification.type)}`}>
                          {notification.title}
                        </h4>
                        {!notification.isRead && (
                          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                        )}
                      </div>
                      <p className="text-gray-200 text-sm mt-2 leading-relaxed">{notification.message}</p>
                      <p className="text-gray-400 text-xs mt-3 font-medium">
                        {new Date(notification.createdAt).toLocaleString('fr-FR')}
                      </p>
                    </div>
                    <div className="flex flex-col space-y-2">
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded transition-colors font-medium"
                        >
                          ✓ Lu
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded transition-colors font-medium"
                      >
                        ✕ Suppr
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Overlay pour fermer */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

