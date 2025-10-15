'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    
    try {
      // Récupérer les utilisateurs
      const usersResponse = await fetch('http://localhost:3001/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData);
        
        // Trouver l'utilisateur actuel (simplifié - dans un vrai projet on aurait un endpoint /me)
        const currentUser = usersData.find((u: User) => 
          localStorage.getItem('currentUser') === u.id
        );
        setUser(currentUser || usersData[0]);
      }

      // Récupérer les transactions
      const transactionsResponse = await fetch('http://localhost:3001/transactions', {
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
        setTransferForm({ receiverId: '', amount: '', description: '' });
        fetchData(); // Recharger les données
        alert('Transfert effectué avec succès !');
      } else {
        const error = await response.json();
        alert(error.message || 'Erreur lors du transfert');
      }
    } catch (error) {
      alert('Erreur de connexion');
    } finally {
      setIsTransferring(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    router.push('/auth/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Chargement...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Erreur: Utilisateur non trouvé</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Time-Swap Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span>Bonjour, {user.username} !</span>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Solde et Transfert */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Mon Solde</h2>
            <div className="text-3xl font-bold text-blue-600 mb-6">
              {user.credits} crédits
            </div>

            <h3 className="text-lg font-semibold mb-4">Effectuer un transfert</h3>
            <form onSubmit={handleTransfer}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Destinataire
                </label>
                <select
                  value={transferForm.receiverId}
                  onChange={(e) => setTransferForm({ ...transferForm, receiverId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="">Sélectionner un utilisateur</option>
                  {users
                    .filter(u => u.id !== user.id)
                    .map(u => (
                      <option key={u.id} value={u.id}>
                        {u.username} ({u.credits} crédits)
                      </option>
                    ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Montant
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={user.credits}
                  value={transferForm.amount}
                  onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Description (optionnel)
                </label>
                <input
                  type="text"
                  value={transferForm.description}
                  onChange={(e) => setTransferForm({ ...transferForm, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Pourquoi ce transfert ?"
                />
              </div>

              <button
                type="submit"
                disabled={isTransferring}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg disabled:opacity-50"
              >
                {isTransferring ? 'Transfert en cours...' : 'Effectuer le transfert'}
              </button>
            </form>
          </div>

          {/* Historique des transactions */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Historique des transactions</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {transactions.length === 0 ? (
                <p className="text-gray-500">Aucune transaction pour le moment</p>
              ) : (
                transactions.map((transaction) => (
                  <div key={transaction.id} className="border-l-4 border-blue-500 pl-4 py-2">
                    <div className="flex justify-between">
                      <span className="font-medium">
                        {transaction.sender.username} → {transaction.receiver.username}
                      </span>
                      <span className="font-bold text-blue-600">
                        {transaction.amount} crédits
                      </span>
                    </div>
                    {transaction.description && (
                      <p className="text-sm text-gray-600">{transaction.description}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      {new Date(transaction.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
