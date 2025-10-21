'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BiTransfer } from 'react-icons/bi';
import { TbSend } from 'react-icons/tb';
import { GiReceiveMoney } from 'react-icons/gi';
import { MdWork } from 'react-icons/md';
import NotificationCenter from '../../components/NotificationCenter';

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
  const [bookings, setBookings] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [transferForm, setTransferForm] = useState({
    receiverId: '',
    amount: '',
    description: '',
  });
  const [isTransferring, setIsTransferring] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'transfer' | 'services' | 'bookings' | 'history' | 'profile'>('overview');
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [serviceForm, setServiceForm] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    duration: ''
  });
  const [bookingForm, setBookingForm] = useState({
    serviceId: '',
    message: '',
    preferredDate: ''
  });
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    bio: '',
    phone: '',
    location: ''
  });
  const [avatarSeed, setAvatarSeed] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [processingBookings, setProcessingBookings] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | null}>({message: '', type: null});
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAvailableCategory, setSelectedAvailableCategory] = useState<string>('all');
  const router = useRouter();

  useEffect(() => {
    // Vérification d'authentification renforcée
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      if (!token || !user) {
        router.push('/auth/login');
        return;
      }

      // Vérifier la validité du token avec le serveur
      try {
        const response = await fetch('http://localhost:3001/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          // Token invalide, déconnecter et rediriger
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('hasVisitedDashboard');
          router.push('/auth/login');
          return;
        }

        // Token valide, continuer avec le chargement des données
        await fetchData();

        // Marquer la première visite
        const hasVisited = localStorage.getItem('hasVisitedDashboard');
        if (!hasVisited) {
          localStorage.setItem('hasVisitedDashboard', 'true');
        }
      } catch (error) {
        console.error('Erreur de vérification d\'authentification:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/auth/login');
      }
    };

    checkAuth();
  }, [router]);

  // Fermer les menus quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dropdown-menu') && !target.closest('.dropdown-trigger')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      router.push('/auth/login');
      return;
    }
    
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
      } else if (profileResponse.status === 401) {
        // Token invalide, rediriger vers login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/auth/login');
        return;
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

      // Récupérer les réservations
      const bookingsResponse = await fetch('http://localhost:3001/bookings/my-bookings', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json();
        setBookings(bookingsData);
      }

      // Récupérer les services disponibles
      const servicesResponse = await fetch('http://localhost:3001/services', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (servicesResponse.ok) {
        const servicesData = await servicesResponse.json();
        console.log('🔍 Services chargés:', servicesData.length);
        console.log('🔍 Catégories trouvées:', [...new Set(servicesData.map(s => s.category))]);
        // Stocker les services dans un état pour les utiliser dans les réservations
        setServices(servicesData);
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
        const receiver = users.find(u => u.id === transferForm.receiverId);
        // Transfert réussi - notification automatique via WebSocket
      } else {
        const error = await response.json();

      }
    } catch (error) {
      console.error('Erreur:', error);

    } finally {
      setIsTransferring(false);
    }
  };

  const handleLogout = () => {

    setTimeout(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('currentUser');
      router.push('/');
    }, 1000);
  };

  // Fonction pour créer un nouveau service
  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch('http://localhost:3001/services', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: serviceForm.title,
          description: serviceForm.description,
          pricePerHour: parseInt(serviceForm.price),
          category: serviceForm.category,
          duration: parseInt(serviceForm.duration)
        }),
      });

      if (response.ok) {

        setServiceForm({ title: '', description: '', price: '', category: '', duration: '' });
        setShowServiceModal(false);
        fetchData(); // Recharger les données
      } else {
        const error = await response.json();

      }
    } catch (error) {
      console.error('Erreur:', error);

    }
  };

  // Fonction pour réserver un service
  const handleBookService = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    if (!selectedService) {

      return;
    }
    
    try {
      const response = await fetch('http://localhost:3001/bookings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId: selectedService.id,
          hours: 1, // Par défaut 1 heure
          notes: bookingForm.message,
          scheduledAt: bookingForm.preferredDate ? new Date(bookingForm.preferredDate).toISOString() : null
        }),
      });

      if (response.ok) {

        setBookingForm({ serviceId: '', message: '', preferredDate: '' });
        setShowBookingModal(false);
        setSelectedService(null);
        fetchData(); // Recharger les données
      } else {
        const error = await response.json();

      }
    } catch (error) {
      console.error('Erreur:', error);

    }
  };

  // Fonction pour ouvrir le modal de réservation
  const openBookingModal = (service: any) => {
    setSelectedService(service);
    setBookingForm({ 
      serviceId: service.id, 
      message: '', 
      preferredDate: '' 
    });
    setShowBookingModal(true);
  };

  // Fonction pour ouvrir le modal de modification de profil
  const openProfileModal = () => {
    if (user) {
      setProfileForm({
        username: user.username || '',
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        bio: user.bio || '',
        phone: user.phone || '',
        location: user.location || ''
      });
      setAvatarSeed(user.username || '');
    }
    setShowProfileModal(true);
  };

  // Fonction pour sauvegarder les modifications de profil
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch('http://localhost:3001/users/me', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileForm),
      });

      if (response.ok) {

        setShowProfileModal(false);
        fetchData(); // Recharger les données
      } else {
        const error = await response.json();

      }
    } catch (error) {
      console.error('Erreur:', error);

    }
  };

  // Fonction pour générer un nouvel avatar
  const generateNewAvatar = () => {
    const newSeed = Math.random().toString(36).substring(7);
    setAvatarSeed(newSeed);
    setProfileForm({ ...profileForm, username: newSeed });
  };

  // Fonction pour afficher des toasts
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast({ message: '', type: null });
    }, 3000);
  };

  // Liste des catégories disponibles (basée sur les vraies catégories de la DB)
  const categories = [
    { value: 'all', label: 'Toutes catégories' },
    { value: 'Développement', label: 'Développement' },
    { value: 'Design', label: 'Design' },
    { value: 'Musique', label: 'Musique' },
    { value: 'Langues', label: 'Langues' },
    { value: 'Sport', label: 'Sport' },
    { value: 'Cuisine', label: 'Cuisine' },
    { value: 'Technologie', label: 'Technologie' },
    { value: 'Éducation', label: 'Éducation' },
    { value: 'Bien-être', label: 'Bien-être' }
  ];

  // Filtrer les services par catégorie
  const filteredServices = selectedCategory === 'all' 
    ? services 
    : services.filter(service => service.category === selectedCategory);

  // Filtrer les services disponibles par catégorie
  const filteredAvailableServices = selectedAvailableCategory === 'all' 
    ? services 
    : services.filter(service => service.category === selectedAvailableCategory);

  // Calculer les statistiques
  const myServices = services.filter(service => service.providerId === user?.id);
  const myBookings = bookings.filter(booking => booking.providerId === user?.id);
  const completedBookings = myBookings.filter(booking => booking.status === 'COMPLETED');
  const totalEarned = completedBookings.reduce((sum, booking) => sum + booking.totalPrice, 0);

  // Fonction pour confirmer une réservation
  const handleConfirmBooking = async (bookingId: string) => {
    const token = localStorage.getItem('token');
    
    // Marquer cette réservation comme en cours de traitement
    setProcessingBookings(prev => new Set(prev).add(bookingId));
    
    try {
      console.log('🔄 Confirmation de la réservation:', bookingId);
      
      const response = await fetch(`http://localhost:3001/bookings/${bookingId}/confirm`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Réponse du serveur:', response.status, response.statusText);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Réservation confirmée:', result);
        // Notification de succès plus élégante
        showToast('✅ Réservation confirmée avec succès !', 'success');
        fetchData(); // Recharger les données
      } else {
        const error = await response.json();
        console.error('❌ Erreur serveur:', error);
        showToast(`❌ Erreur: ${error.message || 'Impossible de confirmer la réservation'}`, 'error');
      }
    } catch (error) {
      console.error('❌ Erreur de connexion:', error);
      console.error('❌ Erreur de connexion. Veuillez réessayer.');
    } finally {
      // Retirer cette réservation de la liste des réservations en cours
      setProcessingBookings(prev => {
        const newSet = new Set(prev);
        newSet.delete(bookingId);
        return newSet;
      });
    }
  };

  // Fonction pour annuler une réservation
  const handleCancelBooking = async (bookingId: string) => {
    const token = localStorage.getItem('token');
    
    // Marquer cette réservation comme en cours de traitement
    setProcessingBookings(prev => new Set(prev).add(bookingId));
    
    try {
      const response = await fetch(`http://localhost:3001/bookings/${bookingId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        showToast('❌ Réservation refusée avec succès !', 'success');
        fetchData(); // Recharger les données
      } else {
        const error = await response.json();
        showToast(`❌ Erreur: ${error.message || 'Impossible de refuser la réservation'}`, 'error');
      }
    } catch (error) {
      console.error('Erreur:', error);
      console.error('❌ Erreur de connexion. Veuillez réessayer.');
    } finally {
      // Retirer cette réservation de la liste des réservations en cours
      setProcessingBookings(prev => {
        const newSet = new Set(prev);
        newSet.delete(bookingId);
        return newSet;
      });
    }
  };

  // Fonction pour marquer une réservation comme terminée
  const handleCompleteBooking = async (bookingId: string) => {
    const token = localStorage.getItem('token');
    
    // Marquer cette réservation comme en cours de traitement
    setProcessingBookings(prev => new Set(prev).add(bookingId));
    
    try {
      const response = await fetch(`http://localhost:3001/bookings/${bookingId}/complete`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        showToast('🎉 Réservation terminée avec succès !', 'success');
        fetchData(); // Recharger les données
      } else {
        const error = await response.json();
        showToast(`❌ Erreur: ${error.message || 'Impossible de terminer la réservation'}`, 'error');
      }
    } catch (error) {
      console.error('Erreur:', error);
      console.error('❌ Erreur de connexion. Veuillez réessayer.');
    } finally {
      // Retirer cette réservation de la liste des réservations en cours
      setProcessingBookings(prev => {
        const newSet = new Set(prev);
        newSet.delete(bookingId);
        return newSet;
      });
    }
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
      <div className="min-h-screen bg-gradient-to-br from-[#06141B] via-[#11212D] to-[#253745] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#4A5C6A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl">Chargement de votre tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#06141B] via-[#11212D] to-[#253745]">
      {/* Header */}
      <header className="bg-white/5 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex justify-between items-center">
            {/* Logo et Menu Mobile */}
            <div className="flex items-center space-x-3 md:space-x-6">
              {/* Menu Mobile Button - Seulement sur mobile */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              <Link href="/" className="flex items-center space-x-3 group">
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg group-hover:shadow-[#4A5C6A]/25">
                  <svg 
                    viewBox="0 0 100 100" 
                    className="w-full h-full rounded-xl"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Cercle extérieur avec dégradé */}
                    <defs>
                      <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#4A5C6A" />
                        <stop offset="100%" stopColor="#9BA8AB" />
                      </linearGradient>
                    </defs>
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="45" 
                      fill="url(#logoGradient)" 
                      stroke="#CCD0CF" 
                      strokeWidth="2"
                    />
                    
                    {/* Marqueurs d'horloge */}
                    <line x1="50" y1="10" x2="50" y2="20" stroke="#CCD0CF" strokeWidth="3" strokeLinecap="round"/>
                    <line x1="90" y1="50" x2="80" y2="50" stroke="#CCD0CF" strokeWidth="3" strokeLinecap="round"/>
                    <line x1="50" y1="90" x2="50" y2="80" stroke="#CCD0CF" strokeWidth="3" strokeLinecap="round"/>
                    <line x1="10" y1="50" x2="20" y2="50" stroke="#CCD0CF" strokeWidth="3" strokeLinecap="round"/>
                    
                    {/* Symbole central - T */}
                    <text 
                      x="50" 
                      y="45" 
                      textAnchor="middle" 
                      fontSize="24" 
                      fontWeight="bold" 
                      fill="#CCD0CF"
                      fontFamily="Arial, sans-serif"
                    >
                      T
                    </text>
                    
                    {/* Symbole central - S */}
                    <text 
                      x="50" 
                      y="70" 
                      textAnchor="middle" 
                      fontSize="24" 
                      fontWeight="bold" 
                      fill="#CCD0CF"
                      fontFamily="Arial, sans-serif"
                    >
                      S
                    </text>
                  </svg>
                </div>
                <div className="hidden sm:block">
                  <span className="text-white text-lg lg:text-xl font-bold group-hover:text-[#9BA8AB] transition-colors">Time-Swap</span>
                  <p className="text-gray-400 text-xs lg:text-sm">Tableau de bord</p>
                </div>
              </Link>
            </div>

            {/* Actions et Profil - Responsive */}
            <div className="flex items-center space-x-3 md:space-x-6">
              {/* Notifications */}
              <NotificationCenter />

              {/* Profil utilisateur avec menu déroulant */}
              <div className="relative dropdown-menu">
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 md:space-x-3 bg-white/5 rounded-lg p-2 hover:bg-white/10 transition-all duration-300 dropdown-trigger"
                >
                  <div className="w-9 h-9 md:w-10 md:h-10 bg-gradient-to-r from-[#4A5C6A] to-[#9BA8AB] rounded-full flex items-center justify-center overflow-hidden">
                    <img 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}&backgroundColor=4A5C6A,9BA8AB&backgroundType=gradientLinear`}
                      alt={user?.username}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-left hidden md:block">
                    <p className="text-white font-semibold text-sm">{user?.username}</p>
                    <p className="text-gray-400 text-xs">{user?.credits?.toFixed(2)} crédits</p>
                  </div>
                  <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-2 shadow-xl dropdown-menu">
                    <div className="space-y-1">
                      <button 
                        onClick={() => {
                          setActiveTab('profile');
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-white hover:bg-white/10 rounded-lg transition-colors text-sm flex items-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        <span>Mon profil</span>
                      </button>
                      <button className="w-full text-left px-3 py-2 text-white hover:bg-white/10 rounded-lg transition-colors text-sm flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                        </svg>
                        <span>Paramètres</span>
                      </button>
                      <hr className="border-white/10 my-2" />
                      <button
                        onClick={() => {
                          handleLogout();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm flex items-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                        </svg>
                        <span>Déconnexion</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)}>
        </div>
      )}

      <div className="flex">
        {/* Sidebar - Desktop et Tablet */}
        <aside className="hidden md:block w-64 lg:w-72 bg-white/5 backdrop-blur-sm border-r border-white/10 min-h-screen">
          <nav className="p-6">
            <div className="space-y-2">
              {[
                { id: 'overview', label: 'Vue d\'ensemble' },
                { id: 'transfer', label: 'Transfert' },
                { id: 'services', label: 'Services' },
                { id: 'bookings', label: 'Réservations' },
                { id: 'history', label: 'Historique' },
                { id: 'profile', label: 'Profil' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-[#4A5C6A] text-white shadow-lg'
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
                        <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                    {tab.id === 'services' && (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                        <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                      </svg>
                    )}
                    {tab.id === 'bookings' && (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
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
                  <BiTransfer className="w-4 h-4" />
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

        {/* Sidebar - Mobile */}
        <aside className={`fixed top-0 left-0 h-full w-80 bg-white/10 backdrop-blur-md border-r border-white/20 transform transition-transform duration-300 z-50 md:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <nav className="p-6 pt-20">
            {/* Close Button */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* User Info */}
            <div className="mb-8 p-4 bg-white/5 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-[#4A5C6A] to-[#9BA8AB] rounded-full flex items-center justify-center overflow-hidden">
                  <img 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}&backgroundColor=4A5C6A,9BA8AB&backgroundType=gradientLinear`}
                    alt={user?.username}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-white font-semibold">{user?.username}</p>
                  <p className="text-gray-400 text-sm">{user?.credits?.toFixed(2)} crédits</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="space-y-2">
              {[
                { id: 'overview', label: 'Vue d\'ensemble' },
                { id: 'transfer', label: 'Transfert' },
                { id: 'services', label: 'Services' },
                { id: 'bookings', label: 'Réservations' },
                { id: 'history', label: 'Historique' },
                { id: 'profile', label: 'Profil' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-[#4A5C6A] text-white shadow-lg'
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
                        <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                    {tab.id === 'services' && (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                        <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                      </svg>
                    )}
                    {tab.id === 'bookings' && (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
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
                  onClick={() => {
                    setShowTransferModal(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
                >
                  <BiTransfer className="w-4 h-4" />
                  <span>Transfert rapide</span>
                </button>
                <button
                  onClick={() => {
                    setShowUserSearch(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                  <span>Rechercher utilisateur</span>
                </button>
                <Link
                  href="/contact"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                  </svg>
                  <span>Support</span>
                </Link>
              </div>
            </div>

            {/* Logout Button */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Déconnexion</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 xl:p-10">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">Vue d'ensemble</h1>
                <p className="text-gray-300 text-sm md:text-base">Bienvenue sur votre tableau de bord Time-Swap</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:border-[#4A5C6A]/50 transition-all duration-300 hover:scale-105">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-300 text-sm">Solde actuel</p>
                      <p className="text-3xl font-bold text-white">{user?.credits.toFixed(2)}</p>
                      <p className="text-[#4A5C6A] text-sm">crédits</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-[#4A5C6A] to-[#9BA8AB] rounded-lg flex items-center justify-center">
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
                    className="text-[#4A5C6A] hover:text-[#9BA8AB] transition-colors"
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
                            <GiReceiveMoney className="w-5 h-5" />
                          ) : (
                            <TbSend className="w-5 h-5" />
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
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">Transfert de crédits</h1>
                <p className="text-gray-300 text-sm md:text-base">Envoyez des crédits à d'autres utilisateurs</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-white/20 max-w-2xl mx-auto">
                <form onSubmit={handleTransfer} className="space-y-6">
                  <div>
                    <label className="block text-white font-medium mb-2">Destinataire</label>
                    <select
                      value={transferForm.receiverId}
                      onChange={(e) => setTransferForm({ ...transferForm, receiverId: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4A5C6A] focus:border-transparent"
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
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4A5C6A] focus:border-transparent"
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
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4A5C6A] focus:border-transparent"
                      placeholder="Raison du transfert..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isTransferring}
                    className="w-full bg-gradient-to-r from-[#4A5C6A] to-[#9BA8AB] text-white py-3 px-6 rounded-lg hover:from-[#253745] hover:to-[#4A5C6A] transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-semibold"
                  >
                    {isTransferring ? 'Transfert en cours...' : (
                      <span className="flex items-center justify-center space-x-2">
                        <TbSend className="w-5 h-5" />
                        <span>Effectuer le transfert</span>
                      </span>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Services Tab */}
          {activeTab === 'services' && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">Marketplace des Services</h1>
                  <p className="text-gray-300 text-sm md:text-base">Découvrez et proposez des services Time-Swap</p>
                </div>
                <button
                  onClick={() => setShowServiceModal(true)}
                  className="px-6 py-3 bg-gradient-to-r from-[#4A5C6A] to-[#9BA8AB] text-white rounded-lg font-semibold hover:from-[#253745] hover:to-[#4A5C6A] transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-[#4A5C6A]/25 flex items-center space-x-2"
                >
                  <MdWork className="w-5 h-5" />
                  <span>Ajouter un service</span>
                </button>
              </div>

              {/* Mes Services */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-white">Mes Services</h2>
                  <div className="flex space-x-2">
                    <select 
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#4A5C6A] focus:border-transparent"
                    >
                      {categories.map(category => {
                        const count = category.value === 'all' 
                          ? services.filter(service => service.providerId === user?.id).length
                          : services.filter(service => service.providerId === user?.id && service.category === category.value).length;
                        console.log(`🔍 Compteur ${category.label}: ${count} services`);
                        return (
                          <option key={category.value} value={category.value} className="bg-slate-800">
                            {category.label} ({count})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Services de l'utilisateur */}
                  {filteredServices.filter(service => service.providerId === user?.id).length > 0 ? (
                    filteredServices.filter(service => service.providerId === user?.id).map((service) => (
                      <div key={service.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-[#4A5C6A] to-[#9BA8AB] rounded-full flex items-center justify-center overflow-hidden">
                            <img 
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'user'}&backgroundColor=4A5C6A,9BA8AB&backgroundType=gradientLinear`}
                              alt="Avatar"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h3 className="text-white font-semibold">{user?.username || 'Utilisateur'}</h3>
                            <p className="text-gray-400 text-sm">{categories.find(cat => cat.value === service.category)?.label || service.category}</p>
                          </div>
                        </div>
                        <h4 className="text-white font-bold mb-2">{service.title}</h4>
                        <p className="text-gray-300 text-sm mb-3">{service.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-[#4A5C6A] font-bold">{service.pricePerHour} crédits/heure</span>
                          <div className="flex space-x-2">
                            <span className="text-green-400 text-sm">✓ Actif</span>
                            <button className="bg-[#4A5C6A] hover:bg-[#4A5C6A]/80 text-white px-3 py-1 rounded text-xs transition-colors">
                              Modifier
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8">
                      <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MdWork className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-white font-semibold mb-2">Aucun service trouvé</h3>
                      <p className="text-gray-400 text-sm mb-4">
                        {selectedCategory === 'all' 
                          ? "Vous n'avez pas encore créé de services." 
                          : "Aucun service dans cette catégorie."
                        }
                      </p>
                      <button 
                        onClick={() => setShowServiceModal(true)}
                        className="bg-[#4A5C6A] hover:bg-[#4A5C6A]/80 text-white px-6 py-2 rounded-lg transition-colors"
                      >
                        Créer un service
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Services Disponibles */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-white">Services Disponibles</h2>
                  <div className="flex space-x-2">
                    <select 
                      value={selectedAvailableCategory}
                      onChange={(e) => setSelectedAvailableCategory(e.target.value)}
                      className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#4A5C6A] focus:border-transparent"
                    >
                      {categories.map(category => {
                        const count = category.value === 'all' 
                          ? services.filter(service => service.providerId !== user?.id).length
                          : services.filter(service => service.providerId !== user?.id && service.category === category.value).length;
                        return (
                          <option key={category.value} value={category.value} className="bg-slate-800">
                            {category.label} ({count})
                          </option>
                        );
                      })}
                    </select>
                    <input
                      type="text"
                      placeholder="Rechercher un service..."
                      className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Services d'autres utilisateurs */}
                  {filteredAvailableServices.filter(service => service.providerId !== user?.id).length > 0 ? (
                    filteredAvailableServices.filter(service => service.providerId !== user?.id).slice(0, 6).map((service) => (
                    <div key={service.id} className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-[#4A5C6A]/50 transition-all duration-300 cursor-pointer">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-[#4A5C6A] to-[#9BA8AB] rounded-full flex items-center justify-center overflow-hidden">
                          <img 
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${service.provider?.username || 'user'}&backgroundColor=4A5C6A,9BA8AB&backgroundType=gradientLinear`}
                            alt={service.provider?.username || 'Utilisateur'}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">{service.provider?.username || 'Utilisateur'}</h3>
                          <p className="text-gray-400 text-sm">{service.category}</p>
                        </div>
                      </div>
                      <h4 className="text-white font-bold mb-2">{service.title}</h4>
                      <p className="text-gray-300 text-sm mb-3">{service.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-[#4A5C6A] font-bold">{service.pricePerHour} crédits/heure</span>
                        <button 
                          onClick={() => openBookingModal(service)}
                          className="bg-[#4A5C6A] hover:bg-[#253745] text-white px-3 py-1 rounded text-sm transition-colors transform hover:scale-105"
                        >
                          Réserver
                        </button>
                      </div>
                    </div>
                  ))
                  ) : (
                    <div className="col-span-full text-center py-8">
                      <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MdWork className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-white font-semibold mb-2">Aucun service disponible</h3>
                      <p className="text-gray-400 text-sm">
                        {selectedAvailableCategory === 'all' 
                          ? "Aucun service disponible pour le moment." 
                          : "Aucun service disponible dans cette catégorie."
                        }
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Statistiques des Services */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-300 text-sm">Services proposés</p>
                      <p className="text-3xl font-bold text-white">{myServices.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-[#4A5C6A]/20 rounded-lg flex items-center justify-center">
                      <MdWork className="w-6 h-6 text-[#4A5C6A]" />
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-300 text-sm">Réservations reçues</p>
                      <p className="text-3xl font-bold text-white">{myBookings.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <GiReceiveMoney className="w-6 h-6 text-green-400" />
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-300 text-sm">Réservations terminées</p>
                      <p className="text-3xl font-bold text-white">{completedBookings.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-blue-400 text-xl">✅</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-300 text-sm">Crédits gagnés</p>
                      <p className="text-3xl font-bold text-white">{totalEarned}</p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-yellow-400 text-xl">💰</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <div className="space-y-8">
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">Mes Réservations</h1>
                <p className="text-gray-300 text-sm md:text-base">Gérez vos réservations de services</p>
              </div>

              {/* Réservations en tant que client */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h2 className="text-xl font-bold text-white mb-6">Réservations reçues</h2>
                <div className="space-y-4">
                  {bookings.filter(booking => booking.clientId === user?.id).length > 0 ? (
                    bookings.filter(booking => booking.clientId === user?.id).map((booking) => (
                      <div key={booking.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-white font-semibold">{booking.service.title}</h3>
                            <p className="text-gray-300 text-sm">Prestataire: {booking.provider.username}</p>
                            <p className="text-gray-300 text-sm">Durée: {booking.hours}h - Prix: {booking.totalPrice} crédits</p>
                            <p className="text-gray-300 text-sm">Statut: <span className={`font-semibold ${
                              booking.status === 'PENDING' ? 'text-yellow-400' :
                              booking.status === 'CONFIRMED' ? 'text-green-400' :
                              booking.status === 'COMPLETED' ? 'text-blue-400' :
                              'text-red-400'
                            }`}>{booking.status}</span></p>
                            {booking.notes && <p className="text-gray-300 text-sm mt-2">Note: {booking.notes}</p>}
                          </div>
                          <div className="flex space-x-2">
                            {booking.status === 'PENDING' && (
                              <button 
                                onClick={() => handleCancelBooking(booking.id)}
                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
                              >
                                Annuler
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-300 text-center py-8">Aucune réservation reçue</p>
                  )}
                </div>
              </div>

              {/* Réservations en tant que prestataire */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h2 className="text-xl font-bold text-white mb-6">Réservations de mes services</h2>
                <div className="space-y-4">
                  {bookings.filter(booking => booking.providerId === user?.id).length > 0 ? (
                    bookings.filter(booking => booking.providerId === user?.id).map((booking) => (
                      <div key={booking.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-white font-semibold">{booking.service.title}</h3>
                            <p className="text-gray-300 text-sm">Client: {booking.client.username}</p>
                            <p className="text-gray-300 text-sm">Durée: {booking.hours}h - Prix: {booking.totalPrice} crédits</p>
                            <p className="text-gray-300 text-sm">Statut: <span className={`font-semibold ${
                              booking.status === 'PENDING' ? 'text-yellow-400' :
                              booking.status === 'CONFIRMED' ? 'text-green-400' :
                              booking.status === 'COMPLETED' ? 'text-blue-400' :
                              'text-red-400'
                            }`}>{booking.status}</span></p>
                            {booking.notes && <p className="text-gray-300 text-sm mt-2">Note: {booking.notes}</p>}
                          </div>
                          <div className="flex space-x-2">
                            {booking.status === 'PENDING' && (
                              <>
                                <button 
                                  onClick={() => handleConfirmBooking(booking.id)}
                                  disabled={processingBookings.has(booking.id)}
                                  className={`px-3 py-1 rounded text-sm transition-colors ${
                                    processingBookings.has(booking.id)
                                      ? 'bg-gray-500 cursor-not-allowed text-gray-300'
                                      : 'bg-green-500 hover:bg-green-600 text-white'
                                  }`}
                                >
                                  {processingBookings.has(booking.id) ? '⏳' : '✅ Confirmer'}
                                </button>
                                <button 
                                  onClick={() => handleCancelBooking(booking.id)}
                                  disabled={processingBookings.has(booking.id)}
                                  className={`px-3 py-1 rounded text-sm transition-colors ${
                                    processingBookings.has(booking.id)
                                      ? 'bg-gray-500 cursor-not-allowed text-gray-300'
                                      : 'bg-red-500 hover:bg-red-600 text-white'
                                  }`}
                                >
                                  {processingBookings.has(booking.id) ? '⏳' : '❌ Refuser'}
                                </button>
                              </>
                            )}
                            {booking.status === 'CONFIRMED' && (
                              <button 
                                onClick={() => handleCompleteBooking(booking.id)}
                                disabled={processingBookings.has(booking.id)}
                                className={`px-3 py-1 rounded text-sm transition-colors ${
                                  processingBookings.has(booking.id)
                                    ? 'bg-gray-500 cursor-not-allowed text-gray-300'
                                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                                }`}
                              >
                                {processingBookings.has(booking.id) ? '⏳' : '🎉 Terminer'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-300 text-center py-8">Aucune réservation de vos services</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-8">
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">Historique des transactions</h1>
                <p className="text-gray-300 text-sm md:text-base">Toutes vos transactions Time-Swap</p>
              </div>

              {/* Search */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher dans les transactions..."
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4A5C6A] focus:border-transparent"
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
                            {transaction.receiverId === user?.id ? (
                              <GiReceiveMoney className="w-6 h-6" />
                            ) : (
                              <TbSend className="w-6 h-6" />
                            )}
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
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">Mon profil</h1>
                  <p className="text-gray-300 text-sm md:text-base">Gérez vos informations personnelles</p>
                </div>
                <button
                  onClick={openProfileModal}
                  className="px-6 py-3 bg-gradient-to-r from-[#4A5C6A] to-[#9BA8AB] text-white rounded-lg font-semibold hover:from-[#253745] hover:to-[#4A5C6A] transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-[#4A5C6A]/25 flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Modifier le profil</span>
                </button>
              </div>

              {/* Section Avatar */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h2 className="text-xl font-bold text-white mb-6">Avatar</h2>
                <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-r from-[#4A5C6A] to-[#9BA8AB] rounded-full flex items-center justify-center overflow-hidden shadow-lg">
                      <img 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}&backgroundColor=4A5C6A,9BA8AB&backgroundType=gradientLinear`}
                        alt={user?.username}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      onClick={generateNewAvatar}
                      className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#4A5C6A] hover:bg-[#253745] text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
                      title="Générer un nouvel avatar"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="text-white font-bold text-lg">{user?.username}</h3>
                    <p className="text-gray-300 text-sm">{user?.email}</p>
                    <p className="text-[#4A5C6A] text-xs mt-1">Membre depuis {new Date(user?.createdAt || '').toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
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
                      <label className="block text-gray-300 text-sm mb-1">Prénom</label>
                      <p className="text-white font-medium">{user?.firstName || 'Non renseigné'}</p>
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm mb-1">Nom</label>
                      <p className="text-white font-medium">{user?.lastName || 'Non renseigné'}</p>
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm mb-1">Bio</label>
                      <p className="text-white font-medium">{user?.bio || 'Aucune bio'}</p>
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm mb-1">Téléphone</label>
                      <p className="text-white font-medium">{user?.phone || 'Non renseigné'}</p>
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm mb-1">Localisation</label>
                      <p className="text-white font-medium">{user?.location || 'Non renseigné'}</p>
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 md:p-6 border border-white/20 max-w-md w-full mx-auto modal-scrollbar">
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
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4A5C6A] focus:border-transparent"
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
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4A5C6A] focus:border-transparent"
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
                  className="flex-1 bg-gradient-to-r from-[#4A5C6A] to-[#9BA8AB] text-white py-3 px-6 rounded-lg hover:from-[#253745] hover:to-[#4A5C6A] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  {isTransferring ? 'En cours...' : (
                    <span className="flex items-center justify-center space-x-2">
                      <TbSend className="w-4 h-4" />
                      <span>Transférer</span>
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Search Modal */}
      {showUserSearch && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 md:p-6 border border-white/20 max-w-2xl w-full mx-auto modal-scrollbar">
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
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4A5C6A] focus:border-transparent mb-4"
            />
            <div className="space-y-2 max-h-60 overflow-y-auto modal-scrollbar">
              {filteredUsers.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-300"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-[#4A5C6A] to-[#9BA8AB] rounded-full flex items-center justify-center overflow-hidden">
                      <img 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}&backgroundColor=4A5C6A,9BA8AB&backgroundType=gradientLinear`}
                        alt={u.username}
                        className="w-full h-full object-cover"
                      />
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
                      className="text-[#4A5C6A] hover:text-[#9BA8AB] transition-colors text-sm"
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

      {/* Modal de création de service */}
      {showServiceModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 w-full max-w-md modal-scrollbar">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Ajouter un service</h2>
              <button
                onClick={() => setShowServiceModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleCreateService} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Titre du service
                </label>
                <input
                  type="text"
                  value={serviceForm.title}
                  onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4A5C6A] focus:border-transparent"
                  placeholder="Ex: Cours de programmation"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4A5C6A] focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Décrivez votre service..."
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Prix (crédits)
                  </label>
                  <input
                    type="number"
                    value={serviceForm.price}
                    onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4A5C6A] focus:border-transparent"
                    placeholder="50"
                    min="1"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Durée (heures)
                  </label>
                  <input
                    type="number"
                    value={serviceForm.duration}
                    onChange={(e) => setServiceForm({ ...serviceForm, duration: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4A5C6A] focus:border-transparent"
                    placeholder="2"
                    min="1"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Catégorie
                </label>
                <select
                  value={serviceForm.category}
                  onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4A5C6A] focus:border-transparent"
                  required
                >
                  <option value="" className="bg-slate-800">Sélectionner une catégorie</option>
                  {categories.filter(cat => cat.value !== 'all').map(category => (
                    <option key={category.value} value={category.value} className="bg-slate-800">
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowServiceModal(false)}
                  className="flex-1 px-4 py-3 text-gray-300 hover:text-white transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-[#4A5C6A] to-[#9BA8AB] text-white rounded-lg font-semibold hover:from-[#253745] hover:to-[#4A5C6A] transition-all duration-300"
                >
                  Créer le service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de réservation de service */}
      {showBookingModal && selectedService && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 w-full max-w-md modal-scrollbar">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Réserver un service</h2>
              <button
                onClick={() => setShowBookingModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-2">{selectedService.title}</h3>
              <p className="text-gray-300 text-sm mb-2">{selectedService.description}</p>
              <div className="flex justify-between text-sm">
                <span className="text-[#4A5C6A] font-semibold">{selectedService.price} crédits</span>
                <span className="text-gray-400">{selectedService.duration}h</span>
              </div>
            </div>
            
            <form onSubmit={handleBookService} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Date préférée
                </label>
                <input
                  type="date"
                  value={bookingForm.preferredDate}
                  onChange={(e) => setBookingForm({ ...bookingForm, preferredDate: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4A5C6A] focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Message (optionnel)
                </label>
                <textarea
                  value={bookingForm.message}
                  onChange={(e) => setBookingForm({ ...bookingForm, message: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4A5C6A] focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Décrivez vos besoins spécifiques..."
                />
              </div>
              
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 px-4 py-3 text-gray-300 hover:text-white transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-[#4A5C6A] to-[#9BA8AB] text-white rounded-lg font-semibold hover:from-[#253745] hover:to-[#4A5C6A] transition-all duration-300"
                >
                  Envoyer la demande
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast notifications */}
      {toast.type && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 transform ${
          toast.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center space-x-2">
            <span className="text-lg">
              {toast.type === 'success' ? '✅' : '❌'}
            </span>
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Modal de modification de profil */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto modal-scrollbar">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Modifier le profil</h2>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              {/* Section Avatar */}
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-20 h-20 bg-gradient-to-r from-[#4A5C6A] to-[#9BA8AB] rounded-full flex items-center justify-center overflow-hidden shadow-lg mx-auto">
                    <img 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}&backgroundColor=4A5C6A,9BA8AB&backgroundType=gradientLinear`}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={generateNewAvatar}
                    className="absolute -bottom-2 -right-2 w-6 h-6 bg-[#4A5C6A] hover:bg-[#253745] text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
                    title="Générer un nouvel avatar"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
                <p className="text-gray-300 text-sm mt-2">Cliquez sur l'icône pour générer un nouvel avatar</p>
              </div>

              {/* Informations de base */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nom d'utilisateur
                  </label>
                  <input
                    type="text"
                    value={profileForm.username}
                    onChange={(e) => {
                      setProfileForm({ ...profileForm, username: e.target.value });
                      setAvatarSeed(e.target.value);
                    }}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4A5C6A] focus:border-transparent"
                    placeholder="Nom d'utilisateur"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4A5C6A] focus:border-transparent"
                    placeholder="Email"
                    required
                  />
                </div>
              </div>

              {/* Nom et prénom */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Prénom
                  </label>
                  <input
                    type="text"
                    value={profileForm.firstName}
                    onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4A5C6A] focus:border-transparent"
                    placeholder="Prénom"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nom
                  </label>
                  <input
                    type="text"
                    value={profileForm.lastName}
                    onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4A5C6A] focus:border-transparent"
                    placeholder="Nom"
                  />
                </div>
              </div>

              {/* Téléphone et localisation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4A5C6A] focus:border-transparent"
                    placeholder="Téléphone"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Localisation
                  </label>
                  <input
                    type="text"
                    value={profileForm.location}
                    onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4A5C6A] focus:border-transparent"
                    placeholder="Ville, Pays"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Bio
                </label>
                <textarea
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4A5C6A] focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Parlez-nous de vous..."
                />
              </div>
              
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="flex-1 px-4 py-3 text-gray-300 hover:text-white transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-[#4A5C6A] to-[#9BA8AB] text-white rounded-lg font-semibold hover:from-[#253745] hover:to-[#4A5C6A] transition-all duration-300"
                >
                  Sauvegarder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}