'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { usersApi, transactionsApi, User, Transaction } from '@/lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<{
    sent: Transaction[];
    received: Transaction[];
  }>({ sent: [], received: [] });
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [transferError, setTransferError] = useState('');
  const [transferSuccess, setTransferSuccess] = useState('');

  useEffect(() => {
    const loadData = async () => {
      const token = Cookies.get('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      try {
        const [profileData, usersData, transactionsData] = await Promise.all([
          usersApi.getProfile(),
          usersApi.getAll(),
          usersApi.getTransactions(),
        ]);

        setUser(profileData);
        setUsers(usersData.filter((u) => u.id !== profileData.id));
        setTransactions(transactionsData);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setTransferError('');
    setTransferSuccess('');

    if (!selectedUser || !amount) {
      setTransferError('Veuillez remplir tous les champs');
      return;
    }

    try {
      await transactionsApi.transfer(selectedUser, parseFloat(amount), description);
      
      setTransferSuccess('Transfert effectué avec succès !');
      setSelectedUser('');
      setAmount('');
      setDescription('');

      // Recharger les données
      const [profileData, transactionsData] = await Promise.all([
        usersApi.getProfile(),
        usersApi.getTransactions(),
      ]);
      setUser(profileData);
      setTransactions(transactionsData);
    } catch (error: any) {
      setTransferError(error.response?.data?.message || 'Erreur lors du transfert');
    }
  };

  const handleLogout = () => {
    Cookies.remove('token');
    Cookies.remove('user');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-2xl font-semibold text-gray-700">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Time-Swap Network</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Déconnexion
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profil utilisateur */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Bienvenue, {user?.username} !</h2>
          <div className="flex items-center space-x-4">
            <div className="text-4xl">💰</div>
            <div>
              <p className="text-gray-600">Vos crédits</p>
              <p className="text-3xl font-bold text-blue-600">{user?.credits} crédits</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulaire de transfert */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">Transférer des crédits</h3>
            
            {transferSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
                {transferSuccess}
              </div>
            )}
            
            {transferError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {transferError}
              </div>
            )}

            <form onSubmit={handleTransfer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destinataire
                </label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Sélectionner un utilisateur</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.username} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (optionnelle)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Aide pour déménagement..."
                  rows={3}
                />
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Envoyer
              </button>
            </form>
          </div>

          {/* Historique des transactions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">Historique des transactions</h3>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {[...transactions.sent, ...transactions.received]
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((transaction) => {
                  const isSent = transaction.senderId === user?.id;
                  return (
                    <div
                      key={transaction.id}
                      className={`p-4 rounded-lg border ${
                        isSent ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">
                            {isSent ? '→' : '←'} {isSent ? transaction.receiver?.username : transaction.sender?.username}
                          </p>
                          <p className="text-sm text-gray-600">
                            {transaction.description || 'Aucune description'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(transaction.createdAt).toLocaleDateString('fr-FR')} à{' '}
                            {new Date(transaction.createdAt).toLocaleTimeString('fr-FR')}
                          </p>
                        </div>
                        <div className={`text-lg font-bold ${isSent ? 'text-red-600' : 'text-green-600'}`}>
                          {isSent ? '-' : '+'}{transaction.amount} crédits
                        </div>
                      </div>
                    </div>
                  );
                })}
              
              {transactions.sent.length === 0 && transactions.received.length === 0 && (
                <p className="text-center text-gray-500 py-8">Aucune transaction</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

