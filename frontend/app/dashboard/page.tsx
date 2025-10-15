'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
  username: string;
  credits: number;
}

interface Transaction {
  id: string;
  amount: number;
  description?: string;
  status: string;
  senderId: string;
  receiverId: string;
  sender: { username: string };
  receiver: { username: string };
  createdAt: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [transferForm, setTransferForm] = useState({
    receiverId: '',
    amount: '',
    description: '',
  });
  const [isTransferring, setIsTransferring] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'transfer' | 'history' | 'profile'>('overview');
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [notifications, setNotifications] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    fetchData();
    
    // Simulation de notifications en temps réel
    const notificationInterval = setInterval(() => {
      const randomNotifications = [
        "Nouvelle transaction reçue",
        "Solde mis à jour",
        "Système sécurisé",
        "Connexion établie"
      ];
      const randomNotification = randomNotifications[Math.floor(Math.random() * randomNotifications.length)];
      
      setNotifications(prev => {
        const newNotifications = [...prev, randomNotification];
        if (newNotifications.length > 3) {
          newNotifications.shift(); // Garder seulement les 3 dernières
        }
        return newNotifications;
      });
    }, 10000);

    return () => clearInterval(notificationInterval);
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    
    try {
      // Récupérer le profil de l'utilisateur connecté
      const profileResponse = await fetch('http://localhost:3001/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setUser(profileData);
        localStorage.setItem('currentUser', profileData.id);
      }

      // Récupérer tous les utilisateurs
      const usersResponse = await fetch('http://localhost:3001/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData);
      }

      // Récupérer les transactions de l'utilisateur connecté
      const transactionsResponse = await fetch('http://localhost:3001/users/me/transactions', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json();
        setTransactions(transactionsData);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsTransferring(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/transactions/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          senderId: user.id,
          receiverId: transferForm.receiverId,
          amount: parseFloat(transferForm.amount),
          description: transferForm.description,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        
        // Mettre à jour le solde local
        setUser(prev => prev ? { ...prev, credits: prev.credits - parseFloat(transferForm.amount) } : null);
        
        // Ajouter la transaction à la liste
        setTransactions(prev => [result, ...prev]);
        
        // Réinitialiser le formulaire
        setTransferForm({ receiverId: '', amount: '', description: '' });
        setShowTransferModal(false);
        
        // Notification de succès
        setNotifications(prev => [...prev, `Transfert de ${transferForm.amount} crédits effectué avec succès`]);
      } else {
        const error = await response.json();
        alert(error.message || 'Erreur lors du transfert');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur de connexion');
    } finally {
      setIsTransferring(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('currentUser');
    router.push('/');
  };

  const filteredUsers = users.filter(u => 
    u.id !== user?.id && 
    (u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
     u.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredTransactions = transactions.filter(t =>
    t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.sender.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.receiver.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl">Chargement de votre tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="bg-white/5 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex justify-between items-center">
            {/* Logo et Navigation */}
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center space-x-3 group">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg group-hover:shadow-blue-500/25">
                  <span className="text-white font-bold text-lg">TS</span>
                </div>
                <div>
                  <span className="text-white text-xl font-bold group-hover:text-blue-300 transition-colors">Time-Swap</span>
                  <p className="text-gray-400 text-xs">Tableau de bord</p>
                </div>
              </Link>
            </div>

            {/* Actions et Profil */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button className="relative p-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                      {notifications.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Profil utilisateur */}
              <div className="flex items-center space-x-3 bg-white/5 rounded-lg p-2 hover:bg-white/10 transition-all duration-300">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">{user?.username?.[0]?.toUpperCase()}</span>
                </div>
                <div className="text-left">
                  <p className="text-white font-semibold text-sm">{user?.username}</p>
                  <p className="text-gray-400 text-xs">{user?.credits?.toFixed(2)} crédits</p>
                </div>
              </div>

              {/* Menu déroulant utilisateur */}
              <div className="relative">
                <button className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-2 shadow-xl">
                  <div className="space-y-1">
                    <button className="w-full text-left px-3 py-2 text-white hover:bg-white/10 rounded-lg transition-colors text-sm">
                      Mon profil
                    </button>
                    <button className="w-full text-left px-3 py-2 text-white hover:bg-white/10 rounded-lg transition-colors text-sm">
                      Paramètres
                    </button>
                    <hr className="border-white/10 my-2" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm"
                    >
                      Déconnexion
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white/5 backdrop-blur-sm border-r border-white/10 min-h-screen">
          <nav className="p-6">
            <div className="space-y-2">
              {[
                { id: 'overview', label: 'Vue d\'ensemble' },
                { id: 'transfer', label: 'Transfert' },
                { id: 'history', label: 'Historique' },
                { id: 'profile', label: 'Profil' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <div className="w-5 h-5">
                    {tab.id === 'overview' && (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                      </svg>
                    )}
                    {tab.id === 'transfer' && (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8 5a1 1 0 011 1v1h1a1 1 0 110 2H9v1a1 1 0 11-2 0V9H6a1 1 0 110-2h1V6a1 1 0 011-1z" />
                        <path d="M2 2a2 2 0 00-2 2v8a2 2 0 002 2V4h10a2 2 0 00-2-2H2zm12.5 5.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                      </svg>
                    )}
                    {tab.id === 'history' && (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                    )}
                    {tab.id === 'profile' && (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="mt-8">
              <h3 className="text-white font-semibold mb-4">Actions rapides</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setShowTransferModal(true)}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Transfert rapide</span>
                </button>
                <button
                  onClick={() => setShowUserSearch(true)}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                  <span>Rechercher utilisateur</span>
                </button>
                <Link
                  href="/contact"
                  className="w-full flex items-center space-x-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                  </svg>
                  <span>Support</span>
                </Link>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Vue d'ensemble</h1>
                <p className="text-gray-300">Bienvenue sur votre tableau de bord Time-Swap</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:border-blue-500/50 transition-all duration-300 hover:scale-105">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-300 text-sm">Solde actuel</p>
                      <p className="text-3xl font-bold text-white">{user?.credits.toFixed(2)}</p>
                      <p className="text-blue-400 text-sm">crédits</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                        <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:border-green-500/50 transition-all duration-300 hover:scale-105">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-300 text-sm">Transactions</p>
                      <p className="text-3xl font-bold text-white">{transactions.length}</p>
                      <p className="text-green-400 text-sm">total</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:border-purple-500/50 transition-all duration-300 hover:scale-105">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-300 text-sm">Utilisateurs</p>
                      <p className="text-3xl font-bold text-white">{users.length}</p>
                      <p className="text-purple-400 text-sm">actifs</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-white">Transactions récentes</h2>
                  <button
                    onClick={() => setActiveTab('history')}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Voir tout
                  </button>
                </div>
                <div className="space-y-4">
                  {transactions.slice(0, 5).map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-300"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.receiverId === user?.id
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {transaction.receiverId === user?.id ? (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.707 7.707a1 1 0 000-1.414l-3-3a1 1 0 00-1.414 1.414L6.586 9H3a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {transaction.receiverId === user?.id
                              ? `Reçu de ${transaction.sender.username}`
                              : `Envoyé à ${transaction.receiver.username}`}
                          </p>
                          <p className="text-gray-400 text-sm">
                            {new Date(transaction.createdAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${
                          transaction.receiverId === user?.id ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {transaction.receiverId === user?.id ? '+' : '-'}{transaction.amount.toFixed(2)}
                        </p>
                        <p className="text-gray-400 text-sm">crédits</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Transfer Tab */}
          {activeTab === 'transfer' && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Transfert de crédits</h1>
                <p className="text-gray-300">Envoyez des crédits à d'autres utilisateurs</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 max-w-2xl">
                <form onSubmit={handleTransfer} className="space-y-6">
                  <div>
                    <label className="block text-white font-medium mb-2">Destinataire</label>
                    <select
                      value={transferForm.receiverId}
                      onChange={(e) => setTransferForm({ ...transferForm, receiverId: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="" className="bg-slate-800">Sélectionner un utilisateur</option>
                      {users.filter(u => u.id !== user?.id).map((u) => (
                        <option key={u.id} value={u.id} className="bg-slate-800">
                          {u.username} ({u.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Montant</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      max={user?.credits}
                      value={transferForm.amount}
                      onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                      required
                    />
                    <p className="text-gray-400 text-sm mt-1">
                      Solde disponible: {user?.credits.toFixed(2)} crédits
                    </p>
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Description (optionnel)</label>
                    <input
                      type="text"
                      value={transferForm.description}
                      onChange={(e) => setTransferForm({ ...transferForm, description: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Raison du transfert..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isTransferring}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-6 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-semibold"
                  >
                    {isTransferring ? 'Transfert en cours...' : 'Effectuer le transfert'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Historique des transactions</h1>
                <p className="text-gray-300">Toutes vos transactions Time-Swap</p>
              </div>

              {/* Search */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher dans les transactions..."
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Transactions List */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <div className="p-6 border-b border-white/10">
                  <h2 className="text-xl font-bold text-white">Transactions ({filteredTransactions.length})</h2>
                </div>
                <div className="divide-y divide-white/10">
                  {filteredTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="p-6 hover:bg-white/5 transition-all duration-300"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            transaction.receiverId === user?.id
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {transaction.receiverId === user?.id ? '⬇️' : '⬆️'}
                          </div>
                          <div>
                            <p className="text-white font-medium">
                              {transaction.receiverId === user?.id
                                ? `Reçu de ${transaction.sender.username}`
                                : `Envoyé à ${transaction.receiver.username}`}
                            </p>
                            <p className="text-gray-400 text-sm">
                              {transaction.description || 'Aucune description'}
                            </p>
                            <p className="text-gray-500 text-xs">
                              {new Date(transaction.createdAt).toLocaleString('fr-FR')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-2xl font-bold ${
                            transaction.receiverId === user?.id ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {transaction.receiverId === user?.id ? '+' : '-'}{transaction.amount.toFixed(2)}
                          </p>
                          <p className="text-gray-400 text-sm">crédits</p>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            transaction.status === 'COMPLETED'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {transaction.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Mon profil</h1>
                <p className="text-gray-300">Gérez vos informations personnelles</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <h2 className="text-xl font-bold text-white mb-6">Informations personnelles</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-300 text-sm mb-1">Nom d'utilisateur</label>
                      <p className="text-white font-medium">{user?.username}</p>
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm mb-1">Email</label>
                      <p className="text-white font-medium">{user?.email}</p>
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm mb-1">ID utilisateur</label>
                      <p className="text-white font-medium font-mono text-sm">{user?.id}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <h2 className="text-xl font-bold text-white mb-6">Statistiques</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Solde actuel</span>
                      <span className="text-white font-bold">{user?.credits.toFixed(2)} crédits</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Transactions totales</span>
                      <span className="text-white font-bold">{transactions.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Crédits envoyés</span>
                      <span className="text-white font-bold">
                        {transactions
                          .filter(t => t.senderId === user?.id)
                          .reduce((sum, t) => sum + t.amount, 0)
                          .toFixed(2)} crédits
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Crédits reçus</span>
                      <span className="text-white font-bold">
                        {transactions
                          .filter(t => t.receiverId === user?.id)
                          .reduce((sum, t) => sum + t.amount, 0)
                          .toFixed(2)} crédits
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Transfert rapide</h2>
              <button
                onClick={() => setShowTransferModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleTransfer} className="space-y-4">
              <div>
                <label className="block text-white font-medium mb-2">Destinataire</label>
                <select
                  value={transferForm.receiverId}
                  onChange={(e) => setTransferForm({ ...transferForm, receiverId: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="" className="bg-slate-800">Sélectionner un utilisateur</option>
                  {users.filter(u => u.id !== user?.id).map((u) => (
                    <option key={u.id} value={u.id} className="bg-slate-800">
                      {u.username}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-white font-medium mb-2">Montant</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={user?.credits}
                  value={transferForm.amount}
                  onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="flex-1 px-4 py-3 text-gray-300 hover:text-white transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isTransferring}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-6 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  {isTransferring ? 'En cours...' : 'Transférer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Search Modal */}
      {showUserSearch && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Rechercher un utilisateur</h2>
              <button
                onClick={() => setShowUserSearch(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nom d'utilisateur ou email..."
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
            />
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {filteredUsers.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-300"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">{u.username[0].toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{u.username}</p>
                      <p className="text-gray-400 text-sm">{u.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">{u.credits.toFixed(2)} crédits</p>
                    <button
                      onClick={() => {
                        setTransferForm({ ...transferForm, receiverId: u.id });
                        setShowUserSearch(false);
                        setShowTransferModal(true);
                      }}
                      className="text-blue-400 hover:text-blue-300 transition-colors text-sm"
                    >
                      Transférer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}