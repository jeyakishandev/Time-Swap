'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BiTransfer } from 'react-icons/bi';
import { TbSend } from 'react-icons/tb';
import { GiReceiveMoney } from 'react-icons/gi';
import { MdWork } from 'react-icons/md';
import NotificationCenter from '../../components/NotificationCenter';
import ReviewsList from '../../components/ReviewsList';
import RatingStats from '../../components/RatingStats';
import CreateReviewModal from '../../components/CreateReviewModal';
import ServiceRating from '../../components/ServiceRating';
import AnalyticsStats, { calculateAnalytics } from '../../components/AnalyticsStats';
import RevenueExpenseChart from '../../components/RevenueExpenseChart';
import TransactionDistributionChart from '../../components/TransactionDistributionChart';
import MonthlyReport from '../../components/MonthlyReport';
import MessagesInterface from '../../components/MessagesInterface';
import { 
  usersApi, 
  transactionsApi, 
  servicesApi, 
  bookingsApi, 
  reviewsApi,
  extractData,
  type User,
  type Transaction,
  type Service,
  type Booking,
  type Review,
  type ServiceWithRating,
  type SearchServicesParams
} from '../../lib/api';
import { 
  transferSchema, 
  serviceSchema, 
  bookingSchema, 
  profileSchema,
  type TransferFormData,
  type ServiceFormData,
  type BookingFormData,
  type ProfileFormData
} from '../../lib/validations';

// Types importés depuis lib/api.ts

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [transferForm, setTransferForm] = useState({
    receiverId: '',
    amount: '',
    description: '',
  });
  const [isTransferring, setIsTransferring] = useState(false);
  const [isCreatingService, setIsCreatingService] = useState(false);
  const [isUpdatingService, setIsUpdatingService] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [transferErrors, setTransferErrors] = useState<Record<string, string>>({});
  const [serviceErrors, setServiceErrors] = useState<Record<string, string>>({});
  const [bookingErrors, setBookingErrors] = useState<Record<string, string>>({});
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'overview' | 'transfer' | 'services' | 'bookings' | 'history' | 'profile' | 'analytics' | 'messages'>('overview');
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedReviewTarget, setSelectedReviewTarget] = useState<{
    revieweeId: string;
    revieweeUsername: string;
    serviceId?: string;
    serviceTitle?: string;
    bookingId?: string;
  } | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
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
  const [showEditServiceModal, setShowEditServiceModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [profileForm, setProfileForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [editServiceForm, setEditServiceForm] = useState({
    title: '',
    description: '',
    pricePerHour: '',
    category: '',
    duration: ''
  });
  const [avatarSeed, setAvatarSeed] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [processingBookings, setProcessingBookings] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | null}>({message: '', type: null});
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAvailableCategory, setSelectedAvailableCategory] = useState<string>('all');
  const [completedServiceIds, setCompletedServiceIds] = useState<Set<string>>(new Set());
  // États pour la recherche avancée
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<ServiceWithRating[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchFilters, setSearchFilters] = useState<SearchServicesParams>({
    category: undefined,
    minPrice: undefined,
    maxPrice: undefined,
    minRating: undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 20,
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
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
        await usersApi.getProfile();

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
      // Récupérer toutes les données en parallèle
      const [profileData, usersData, transactionsData, bookingsData, servicesData, reviewsData] = await Promise.allSettled([
        usersApi.getProfile(),
        usersApi.getAll(),
        usersApi.getTransactions(),
        bookingsApi.getMyBookings(),
        servicesApi.getAll(),
        reviewsApi.getAll(),
      ]);

      // Traiter le profil
      if (profileData.status === 'fulfilled') {
        setUser(profileData.value);
        // Initialiser avatarSeed avec la valeur de la base de données
        setAvatarSeed(profileData.value.avatarSeed || profileData.value.username || '');
        localStorage.setItem('currentUser', profileData.value.id);
      } else if (profileData.reason?.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/auth/login');
        return;
      }

      // Traiter les utilisateurs
      if (usersData.status === 'fulfilled') {
        setUsers(usersData.value);
      }

      // Traiter les transactions (peut être paginé)
      if (transactionsData.status === 'fulfilled') {
        const transactions = extractData(transactionsData.value);
        setTransactions(transactions);
      }

      // Traiter les réservations
      if (bookingsData.status === 'fulfilled') {
        setBookings(bookingsData.value);
        const completedServiceIds = bookingsData.value
          .filter((booking) => booking.status === 'COMPLETED')
          .map((booking) => booking.serviceId);
        setCompletedServiceIds(new Set(completedServiceIds));
      }

      // Traiter les services (peut être paginé)
      if (servicesData.status === 'fulfilled') {
        const services = extractData(servicesData.value);
        setServices(services);
      }

      // Traiter les avis
      if (reviewsData.status === 'fulfilled') {
        setReviews(reviewsData.value);
      }
    } catch (error) {
      // Erreur critique seulement
      if (error instanceof Error) {
        console.error('Erreur lors du chargement des données:', error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validation
    setTransferErrors({});
    const validationResult = transferSchema.safeParse(transferForm);
    
    if (!validationResult.success) {
      const errors: Record<string, string> = {};
      validationResult.error.issues.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0].toString()] = err.message;
        }
      });
      setTransferErrors(errors);
      return;
    }

    // Vérifier que l'utilisateur a assez de crédits
    if (user.credits < parseFloat(transferForm.amount)) {
      setTransferErrors({ amount: 'Crédits insuffisants' });
      return;
    }

    setIsTransferring(true);

    try {
      const result = await transactionsApi.transfer(
        user.id,
        transferForm.receiverId,
        parseFloat(transferForm.amount),
        transferForm.description
      );
      
      // Mettre à jour le solde local
      setUser(prev => prev ? { ...prev, credits: prev.credits - parseFloat(transferForm.amount) } : null);
      
      // Ajouter la transaction à la liste
      setTransactions(prev => [result, ...prev]);
      
      // Réinitialiser le formulaire
      setTransferForm({ receiverId: '', amount: '', description: '' });
      setTransferErrors({});
      setShowTransferModal(false);
      
      showToast('Virement effectué avec succès', 'success');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erreur lors du virement';
      showToast(errorMessage, 'error');
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
    
    // Validation
    setServiceErrors({});
    const validationResult = serviceSchema.safeParse(serviceForm);
    
    if (!validationResult.success) {
      const errors: Record<string, string> = {};
      validationResult.error.issues.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0].toString()] = err.message;
        }
      });
      setServiceErrors(errors);
      return;
    }

    setIsCreatingService(true);

    try {
      await servicesApi.create({
        title: serviceForm.title,
        description: serviceForm.description,
        pricePerHour: parseFloat(serviceForm.price),
        category: serviceForm.category,
      });

      setServiceForm({ title: '', description: '', price: '', category: '', duration: '' });
      setServiceErrors({});
      setShowServiceModal(false);
      showToast('Service créé avec succès', 'success');
      fetchData();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erreur lors de la création du service';
      showToast(errorMessage, 'error');
    } finally {
      setIsCreatingService(false);
    }
  };

  // Fonction pour ouvrir la modale d'édition
  const handleEditService = (service: Service) => {
    setEditingService(service);
    setEditServiceForm({
      title: service.title || '',
      description: service.description || '',
      pricePerHour: (service.pricePerHour || 0).toString(),
      category: service.category || '',
      duration: '1'
    });
    setShowEditServiceModal(true);
  };

  // Fonction pour modifier un service
  const handleUpdateService = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingService) return;

    // Validation
    setServiceErrors({});
    const validationResult = serviceSchema.safeParse({
      title: editServiceForm.title,
      description: editServiceForm.description,
      price: editServiceForm.pricePerHour,
      category: editServiceForm.category,
    });
    
    if (!validationResult.success) {
      const errors: Record<string, string> = {};
      validationResult.error.issues.forEach((err) => {
        if (err.path[0]) {
          const field = err.path[0].toString();
          errors[field === 'price' ? 'pricePerHour' : field] = err.message;
        }
      });
      setServiceErrors(errors);
      return;
    }

    setIsUpdatingService(true);

    try {
      await servicesApi.update(editingService.id, {
        title: editServiceForm.title,
        description: editServiceForm.description,
        pricePerHour: parseFloat(editServiceForm.pricePerHour),
        category: editServiceForm.category,
      });

      setShowEditServiceModal(false);
      setEditingService(null);
      setEditServiceForm({ title: '', description: '', pricePerHour: '', category: '', duration: '' });
      setServiceErrors({});
      showToast('Service modifié avec succès', 'success');
      fetchData();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erreur lors de la modification du service';
      showToast(errorMessage, 'error');
    } finally {
      setIsUpdatingService(false);
    }
  };

  // Fonction pour réserver un service
  const handleBookService = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedService) {
      showToast('Service non sélectionné', 'error');
      return;
    }
    
    // Validation
    setBookingErrors({});
    const validationResult = bookingSchema.safeParse({
      ...bookingForm,
      serviceId: selectedService.id,
    });
    
    if (!validationResult.success) {
      const errors: Record<string, string> = {};
      validationResult.error.issues.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0].toString()] = err.message;
        }
      });
      setBookingErrors(errors);
      return;
    }

    setIsBooking(true);

    try {
      await bookingsApi.create({
        serviceId: selectedService.id,
        hours: 1,
        notes: bookingForm.message,
        scheduledAt: bookingForm.preferredDate ? new Date(bookingForm.preferredDate).toISOString() : undefined
      });

      setBookingForm({ serviceId: '', message: '', preferredDate: '' });
      setBookingErrors({});
      setShowBookingModal(false);
      setSelectedService(null);
      showToast('Réservation créée avec succès', 'success');
      fetchData();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erreur lors de la création de la réservation';
      showToast(errorMessage, 'error');
    } finally {
      setIsBooking(false);
    }
  };

  // Fonction pour ouvrir le modal de réservation
  const openBookingModal = (service: Service) => {
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
          password: '',
          confirmPassword: ''
        });
      setAvatarSeed(user.avatarSeed || user.username || '');
    }
    setShowProfileModal(true);
  };

  // Fonction pour sauvegarder les modifications de profil
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    setProfileErrors({});
    
    // Validation manuelle
    const errors: Record<string, string> = {};
    
    if (profileForm.username && profileForm.username.length < 3) {
      errors.username = 'Le nom d\'utilisateur doit contenir au moins 3 caractères';
    }
    
    if (profileForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email)) {
      errors.email = 'Email invalide';
    }
    
    if (profileForm.password) {
      if (profileForm.password.length < 6) {
        errors.password = 'Le mot de passe doit contenir au moins 6 caractères';
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(profileForm.password)) {
        errors.password = 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre';
      } else if (profileForm.password !== profileForm.confirmPassword) {
        errors.confirmPassword = 'Les mots de passe ne correspondent pas';
      }
    }
    
    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors);
      return;
    }

    setIsUpdatingProfile(true);

    try {
      // Préparer les données à envoyer (seulement les champs modifiés)
      const updateData: { email?: string; username?: string; password?: string } = {};
      
      if (profileForm.email && profileForm.email !== user?.email) {
        updateData.email = profileForm.email;
      }
      
      if (profileForm.username && profileForm.username !== user?.username) {
        updateData.username = profileForm.username;
      }
      
      if (profileForm.password) {
        updateData.password = profileForm.password;
      }
      
      if (Object.keys(updateData).length === 0) {
        showToast('Aucune modification détectée', 'error');
        setIsUpdatingProfile(false);
        return;
      }
      
      await usersApi.updateProfile(updateData);
      showToast('Profil mis à jour avec succès', 'success');
      setProfileErrors({});
      setShowProfileModal(false);
      // Réinitialiser le formulaire
      setProfileForm({ username: '', email: '', password: '', confirmPassword: '' });
      fetchData();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erreur lors de la mise à jour du profil';
      showToast(errorMessage, 'error');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Fonction pour générer un nouvel avatar
  const generateNewAvatar = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const newSeed = Math.random().toString(36).substring(7);
    setAvatarSeed(newSeed);
    
    try {
      // Sauvegarder le nouveau seed dans la base de données
      const updatedUser = await usersApi.updateProfile({ avatarSeed: newSeed });
      setUser(updatedUser);
      showToast('Avatar changé avec succès', 'success');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erreur lors de la mise à jour de l\'avatar';
      showToast(errorMessage, 'error');
      // Revenir à l'ancien seed en cas d'erreur
      setAvatarSeed(user?.avatarSeed || user?.username || '');
    }
  };

  // Fonction pour afficher des toasts
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast({ message: '', type: null });
    }, 3000);
  };

  const handleCreateReview = async (data: { rating: number; comment: string; revieweeId: string; serviceId?: string; bookingId?: string }) => {
    try {
      await reviewsApi.create(data);
      showToast('Avis publié avec succès', 'success');
      fetchData();
      setShowReviewModal(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Impossible de publier l\'avis';
      showToast(errorMessage, 'error');
    }
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

  // Fonction de recherche avancée
  const handleSearch = async () => {
    if (!searchQuery.trim() && !searchFilters.category && !searchFilters.minPrice && !searchFilters.maxPrice && !searchFilters.minRating) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const searchParams: SearchServicesParams = {
        ...searchFilters,
        search: searchQuery.trim() || undefined,
      };
      
      const response = await servicesApi.search(searchParams);
      const results = extractData(response);
      setSearchResults(results as ServiceWithRating[]);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      showToast('Erreur lors de la recherche', 'error');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Pas de recherche automatique - seulement sur clic du bouton

  // Calculer les statistiques
  const myServices = services.filter(service => service.providerId === user?.id);
  const myBookings = bookings.filter(booking => booking.providerId === user?.id);
  const completedBookings = myBookings.filter(booking => {
    if (booking.status !== 'COMPLETED') return false;
    // Vérifier si l'utilisateur a déjà donné un avis pour cette réservation
    const hasReview = reviews.some(review => 
      review.bookingId === booking.id && review.reviewerId === user?.id
    );
    return !hasReview;
  });
  const totalEarned = myBookings
    .filter(booking => booking.status === 'COMPLETED')
    .reduce((sum, booking) => sum + booking.totalPrice, 0);
  
  // Statistiques pour les réservations en tant que client
  const clientBookings = bookings.filter(booking => booking.clientId === user?.id);
  const completedClientBookings = clientBookings.filter(booking => {
    if (booking.status !== 'COMPLETED') return false;
    // Vérifier si l'utilisateur a déjà donné un avis pour cette réservation
    const hasReview = reviews.some(review => 
      review.bookingId === booking.id && review.reviewerId === user?.id
    );
    return !hasReview;
  });

  // Fonction pour confirmer une réservation
  const handleConfirmBooking = async (bookingId: string) => {
    setProcessingBookings(prev => new Set(prev).add(bookingId));
    
    try {
      await bookingsApi.confirm(bookingId);
      showToast('Réservation confirmée avec succès', 'success');
      fetchData();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Impossible de confirmer la réservation';
      showToast(errorMessage, 'error');
    } finally {
      setProcessingBookings(prev => {
        const newSet = new Set(prev);
        newSet.delete(bookingId);
        return newSet;
      });
    }
  };

  // Fonction pour annuler une réservation
  const handleCancelBooking = async (bookingId: string) => {
    setProcessingBookings(prev => new Set(prev).add(bookingId));
    
    try {
      await bookingsApi.cancel(bookingId);
      showToast('Réservation refusée avec succès', 'success');
      fetchData();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Impossible de refuser la réservation';
      showToast(errorMessage, 'error');
    } finally {
      setProcessingBookings(prev => {
        const newSet = new Set(prev);
        newSet.delete(bookingId);
        return newSet;
      });
    }
  };

  // Fonction pour marquer une réservation comme terminée
  const handleCompleteBooking = async (bookingId: string) => {
    setProcessingBookings(prev => new Set(prev).add(bookingId));
    
    try {
      await bookingsApi.complete(bookingId);
      showToast('Réservation terminée avec succès', 'success');
      fetchData();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Impossible de terminer la réservation';
      showToast(errorMessage, 'error');
    } finally {
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
    t.sender?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.receiver?.username?.toLowerCase().includes(searchTerm.toLowerCase())
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
      {/* Header Bancaire Professionnel */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            {/* Logo et Menu Mobile */}
            <div className="flex items-center space-x-4 md:space-x-6">
              {/* Menu Mobile Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-white hover:text-gray-300 hover:bg-white/10 rounded-lg transition-all duration-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              <Link href="/" className="flex items-center space-x-3 group">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-[#4A5C6A] to-[#5a6c7a] rounded-lg flex items-center justify-center shadow-md">
                  <svg className="w-6 h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="hidden sm:block">
                  <span className="text-white text-lg lg:text-xl font-semibold tracking-tight">Time-Swap Bank</span>
                  <p className="text-gray-300 text-xs lg:text-sm font-light">Portail bancaire</p>
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
                  className="flex items-center space-x-2 md:space-x-3 bg-white/10 rounded-lg p-2 hover:bg-white/20 transition-all duration-300 dropdown-trigger border border-white/20"
                >
                  <div className="w-9 h-9 md:w-10 md:h-10 bg-gradient-to-r from-[#4A5C6A] to-[#9BA8AB] rounded-full flex items-center justify-center overflow-hidden">
                    <img 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.avatarSeed || user?.username}&backgroundColor=4A5C6A,9BA8AB&backgroundType=gradientLinear`}
                      alt={user?.username}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-left hidden md:block">
                    <p className="text-white font-semibold text-sm">{user?.username}</p>
                    <p className="text-gray-300 text-xs">{user?.credits?.toFixed(2)} crédits</p>
                  </div>
                  <svg className={`w-4 h-4 text-gray-300 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#1a2332]/95 backdrop-blur-md rounded-lg border border-white/20 p-2 shadow-xl dropdown-menu">
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
                        className="w-full text-left px-3 py-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors text-sm flex items-center space-x-2"
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
        {/* Sidebar - Desktop et Tablet - Design Bancaire */}
        <aside className="hidden md:block w-64 lg:w-72 bg-gradient-to-b from-[#1a2332] to-[#253745] border-r border-[#4A5C6A]/30 min-h-screen shadow-xl">
          <nav className="p-6">
            <div className="space-y-1">
              {[
                { id: 'overview', label: 'Tableau de bord', icon: 'dashboard' },
                { id: 'transfer', label: 'Virements', icon: 'transfer' },
                { id: 'services', label: 'Services', icon: 'services' },
                { id: 'bookings', label: 'Réservations', icon: 'bookings' },
                { id: 'history', label: 'Historique', icon: 'history' },
                { id: 'messages', label: 'Messages', icon: 'messages' },
                { id: 'analytics', label: 'Analytics', icon: 'analytics' },
                { id: 'profile', label: 'Mon compte', icon: 'profile' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-[#4A5C6A] text-white shadow-md font-semibold'
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
                    {tab.id === 'messages' && (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                        <path d="M15 7v2a4 4 0 01-4 4H9.828l-3 3v-3H6a3 3 0 01-3-3V7h3a4 4 0 014 4h2a4 4 0 004-4V7h-3z" />
                      </svg>
                    )}
                    {tab.id === 'analytics' && (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
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
            <div className="mt-8 pt-8 border-t border-white/20">
              <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Actions rapides</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setShowTransferModal(true)}
                  className="w-full flex items-center space-x-3 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300 border border-white/20 hover:border-[#4A5C6A]"
                >
                  <BiTransfer className="w-4 h-4" />
                  <span className="font-medium">Virement rapide</span>
                </button>
                <button
                  onClick={() => setShowUserSearch(true)}
                  className="w-full flex items-center space-x-3 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300 border border-white/20 hover:border-[#4A5C6A]"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Rechercher un compte</span>
                </button>
                <Link
                  href="/contact"
                  className="w-full flex items-center space-x-3 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300 border border-white/20 hover:border-[#4A5C6A]"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Support client</span>
                </Link>
              </div>
            </div>
          </nav>
        </aside>

        {/* Sidebar - Mobile */}
        <aside className={`fixed top-0 left-0 h-full w-80 bg-gradient-to-b from-[#1a2332] to-[#253745] border-r border-white/20 transform transition-transform duration-300 z-50 md:hidden shadow-xl ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <nav className="p-6 pt-20">
            {/* Close Button */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-2 text-white hover:text-gray-300 hover:bg-white/10 rounded-lg transition-all duration-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* User Info */}
            <div className="mb-8 p-4 bg-white/10 rounded-lg border border-white/20">
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
                  <p className="text-gray-300 text-sm">{user?.credits?.toFixed(2)} crédits</p>
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
                { id: 'analytics', label: 'Analytics' },
                { id: 'profile', label: 'Profil' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as typeof activeTab);
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
                    {tab.id === 'messages' && (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                        <path d="M15 7v2a4 4 0 01-4 4H9.828l-3 3v-3H6a3 3 0 01-3-3V7h3a4 4 0 014 4h2a4 4 0 004-4V7h-3z" />
                      </svg>
                    )}
                    {tab.id === 'analytics' && (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
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
            <div className="mt-8 pt-8 border-t border-white/20">
              <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Actions rapides</h3>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setShowTransferModal(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300 border border-white/20 hover:border-[#4A5C6A]"
                >
                  <BiTransfer className="w-4 h-4" />
                  <span className="font-medium">Virement rapide</span>
                </button>
                <button
                  onClick={() => {
                    setShowUserSearch(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300 border border-white/20 hover:border-[#4A5C6A]"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Rechercher un compte</span>
                </button>
                <Link
                  href="/contact"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center space-x-3 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300 border border-white/20 hover:border-[#4A5C6A]"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Support client</span>
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
        <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-4 sm:space-y-6 md:space-y-8">
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1 sm:mb-2">Vue d'ensemble</h1>
                <p className="text-gray-300 text-xs sm:text-sm md:text-base">Bienvenue sur votre tableau de bord Time-Swap</p>
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

              {/* Historique des Transactions Bancaires */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                <div className="bg-gradient-to-r from-[#1a2332] to-[#253745] px-4 sm:px-6 py-3 sm:py-4 border-b border-white/20">
                  <div className="flex justify-between items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-bold text-white">Historique des transactions</h2>
                    <button
                      onClick={() => setActiveTab('history')}
                      className="text-white/80 hover:text-white text-xs sm:text-sm font-medium transition-colors flex items-center space-x-1 flex-shrink-0"
                    >
                      <span className="hidden sm:inline">Voir tout</span>
                      <span className="sm:hidden">Tout</span>
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="divide-y divide-gray-100">
                  {transactions.slice(0, 5).map((transaction) => (
                    <div
                      key={transaction.id}
                      className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 hover:bg-white/5 transition-colors border-b border-white/10"
                    >
                      <div className="flex items-center justify-between gap-2 sm:gap-4">
                        <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 min-w-0 flex-1">
                          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            transaction.receiverId === user?.id
                              ? 'bg-green-50'
                              : 'bg-red-50'
                          }`}>
                            {transaction.receiverId === user?.id ? (
                              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-white font-semibold text-sm sm:text-base truncate">
                              {transaction.receiverId === user?.id
                                ? `Crédit reçu de ${transaction.sender?.username || 'Utilisateur'}`
                                : `Débit envoyé à ${transaction.receiver?.username || 'Utilisateur'}`}
                            </p>
                            <div className="flex items-center space-x-1 sm:space-x-2 mt-0.5 sm:mt-1 flex-wrap">
                              <p className="text-gray-300 text-xs sm:text-sm">
                                {new Date(transaction.createdAt).toLocaleDateString('fr-FR', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                              {transaction.description && (
                                <>
                                  <span className="text-gray-400 hidden sm:inline">•</span>
                                  <p className="text-gray-300 text-xs sm:text-sm truncate max-w-[150px] sm:max-w-xs">{transaction.description}</p>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className={`text-base sm:text-lg font-bold ${
                            transaction.receiverId === user?.id ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.receiverId === user?.id ? '+' : '-'}{transaction.amount.toFixed(2)}
                          </p>
                          <p className="text-gray-400 text-xs mt-0.5 sm:mt-1">Crédits</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {transactions.length === 0 && (
                    <div className="px-4 sm:px-6 py-8 sm:py-12 text-center">
                      <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-gray-300 text-base sm:text-lg font-medium">Aucune transaction</p>
                      <p className="text-gray-400 text-xs sm:text-sm mt-2">Vos transactions apparaîtront ici</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Transfer Tab - Mobile First */}
          {activeTab === 'transfer' && (
            <div className="space-y-4 sm:space-y-6 md:space-y-8">
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1 sm:mb-2">Transfert de crédits</h1>
                <p className="text-gray-300 text-xs sm:text-sm md:text-base">Envoyez des crédits à d'autres utilisateurs</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6 md:p-8 max-w-2xl mx-auto">
                <form onSubmit={handleTransfer} className="space-y-4 sm:space-y-6">
                  <div>
                    <label className="block text-white font-semibold mb-1.5 sm:mb-2 text-sm sm:text-base">Bénéficiaire</label>
                    <select
                      value={transferForm.receiverId}
                      onChange={(e) => {
                        setTransferForm({ ...transferForm, receiverId: e.target.value });
                        if (transferErrors.receiverId) setTransferErrors({ ...transferErrors, receiverId: '' });
                      }}
                      className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/10 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4A5C6A] focus:border-[#4A5C6A] text-sm sm:text-base ${
                        transferErrors.receiverId ? 'border-red-500' : 'border-white/20'
                      }`}
                      required
                    >
                      <option value="" className="bg-[#1a2332]">Sélectionner un bénéficiaire</option>
                      {users.filter(u => u.id !== user?.id).map((u) => (
                        <option key={u.id} value={u.id} className="bg-[#1a2332]">
                          {u.username} - {u.email}
                        </option>
                      ))}
                    </select>
                    {transferErrors.receiverId && (
                      <p className="text-red-400 text-xs sm:text-sm mt-1">{transferErrors.receiverId}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-1.5 sm:mb-2 text-sm sm:text-base">Montant</label>
                    <div className="relative">
                      <span className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-300 font-medium text-xs sm:text-sm">Crédits</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        max={user?.credits}
                        value={transferForm.amount}
                        onChange={(e) => {
                          setTransferForm({ ...transferForm, amount: e.target.value });
                          if (transferErrors.amount) setTransferErrors({ ...transferErrors, amount: '' });
                        }}
                        className={`w-full pl-16 sm:pl-20 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-white/10 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4A5C6A] focus:border-[#4A5C6A] text-sm sm:text-base placeholder-gray-400 ${
                          transferErrors.amount ? 'border-red-500' : 'border-white/20'
                        }`}
                        placeholder="0.00"
                        required
                      />
                    </div>
                    {transferErrors.amount && (
                      <p className="text-red-400 text-xs sm:text-sm mt-1">{transferErrors.amount}</p>
                    )}
                    <div className="mt-2 p-2 sm:p-3 bg-blue-500/20 rounded-lg border border-blue-400/30">
                      <p className="text-white text-xs sm:text-sm">
                        <span className="font-semibold">Solde disponible:</span> {user?.credits.toFixed(2)} crédits
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-1.5 sm:mb-2 text-sm sm:text-base">Libellé du virement (optionnel)</label>
                    <input
                      type="text"
                      value={transferForm.description}
                      onChange={(e) => setTransferForm({ ...transferForm, description: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4A5C6A] focus:border-[#4A5C6A] text-sm sm:text-base placeholder-gray-400"
                      placeholder="Ex: Paiement de service, Remboursement..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isTransferring}
                    className="w-full bg-gradient-to-r from-[#4A5C6A] to-[#9BA8AB] text-white py-3 sm:py-3.5 px-4 sm:px-6 rounded-lg hover:from-[#253745] hover:to-[#4A5C6A] transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-semibold flex items-center justify-center space-x-2 text-sm sm:text-base"
                  >
                    {isTransferring ? (
                      <>
                        <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Transfert en cours...</span>
                      </>
                    ) : (
                      <>
                        <TbSend className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>Effectuer le transfert</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Services Tab - Mobile First */}
          {activeTab === 'services' && (
            <div className="space-y-4 sm:space-y-6 md:space-y-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1 sm:mb-2">Marketplace des Services</h1>
                  <p className="text-gray-300 text-xs sm:text-sm md:text-base">Découvrez et proposez des services Time-Swap</p>
                </div>
                <button
                  onClick={() => setShowServiceModal(true)}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-[#4A5C6A] to-[#9BA8AB] text-white rounded-lg font-semibold hover:from-[#253745] hover:to-[#4A5C6A] transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-[#4A5C6A]/25 flex items-center justify-center space-x-2 text-sm sm:text-base"
                >
                  <MdWork className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Ajouter un service</span>
                </button>
              </div>

              {/* Mes Services */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-white">Mes Services</h2>
                  <div className="w-full sm:w-auto">
                    <select 
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full sm:w-auto bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#4A5C6A] focus:border-transparent text-sm sm:text-base"
                    >
                      {categories.map(category => {
                        const count = category.value === 'all' 
                          ? services.filter(service => service.providerId === user?.id).length
                          : services.filter(service => service.providerId === user?.id && service.category === category.value).length;
                        return (
                          <option key={category.value} value={category.value} className="bg-slate-800">
                            {category.label} ({count})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {/* Services de l'utilisateur */}
                  {filteredServices.filter(service => service.providerId === user?.id).length > 0 ? (
                    filteredServices.filter(service => service.providerId === user?.id).map((service) => (
                      <div key={service.id} className="bg-white/5 rounded-lg p-3 sm:p-4 border border-white/10">
                        <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-[#4A5C6A] to-[#9BA8AB] rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                            <img 
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.avatarSeed || user?.username || 'user'}&backgroundColor=4A5C6A,9BA8AB&backgroundType=gradientLinear`}
                              alt="Avatar"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-white font-semibold text-sm sm:text-base truncate">{user?.username || 'Utilisateur'}</h3>
                            <p className="text-gray-400 text-xs sm:text-sm truncate">{categories.find(cat => cat.value === service.category)?.label || service.category}</p>
                          </div>
                        </div>
                        <h4 className="text-white font-bold mb-1 sm:mb-2 text-sm sm:text-base">{service.title}</h4>
                        <div className="mb-2">
                          <ServiceRating 
                            serviceId={service.id} 
                            className="mb-2" 
                            showReviewButton={false}
                          />
                        </div>
                        <p className="text-gray-300 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">{service.description}</p>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                          <span className="text-[#4A5C6A] font-bold text-xs sm:text-sm">{service.pricePerHour} crédits/heure</span>
                          <div className="flex items-center space-x-2 w-full sm:w-auto">
                            <span className="text-green-400 text-xs sm:text-sm">✓ Actif</span>
                            <button 
                              onClick={() => handleEditService(service)}
                              className="bg-[#4A5C6A] hover:bg-[#4A5C6A]/80 text-white px-2 sm:px-3 py-1 rounded text-xs transition-colors flex-shrink-0"
                            >
                              Modifier
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-6 sm:py-8">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                        <MdWork className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                      </div>
                      <h3 className="text-white font-semibold mb-1 sm:mb-2 text-base sm:text-lg">Aucun service trouvé</h3>
                      <p className="text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4 px-4">
                        {selectedCategory === 'all' 
                          ? "Vous n'avez pas encore créé de services." 
                          : "Aucun service dans cette catégorie."
                        }
                      </p>
                      <button 
                        onClick={() => setShowServiceModal(true)}
                        className="bg-[#4A5C6A] hover:bg-[#4A5C6A]/80 text-white px-4 sm:px-6 py-2 rounded-lg transition-colors text-sm sm:text-base"
                      >
                        Créer un service
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Services Disponibles */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-white">Services Disponibles</h2>
                </div>

                {/* Barre de recherche avancée */}
                <div className="mb-4 sm:mb-6 space-y-3">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleSearch();
                          }
                        }}
                        placeholder="Rechercher un service (titre, description)..."
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 pl-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4A5C6A] focus:border-transparent text-sm sm:text-base"
                      />
                      <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <button
                      onClick={handleSearch}
                      disabled={isSearching}
                      className="px-4 py-2.5 bg-[#4A5C6A] hover:bg-[#253745] text-white rounded-lg transition-colors text-sm sm:text-base flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSearching ? (
                        <>
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Recherche...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          <span>Rechercher</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                      className="px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors text-sm sm:text-base flex items-center space-x-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                      </svg>
                      <span>Filtres</span>
                    </button>
                  </div>

                  {/* Filtres avancés */}
                  {showAdvancedFilters && (
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-gray-300 text-xs sm:text-sm mb-1">Catégorie</label>
                          <select
                            value={searchFilters.category || ''}
                            onChange={(e) => setSearchFilters({ ...searchFilters, category: e.target.value || undefined })}
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#4A5C6A] text-sm"
                          >
                            <option value="" className="bg-slate-800">Toutes</option>
                            {categories.filter(c => c.value !== 'all').map(cat => (
                              <option key={cat.value} value={cat.value} className="bg-slate-800">{cat.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-gray-300 text-xs sm:text-sm mb-1">Prix min (crédits)</label>
                          <input
                            type="number"
                            value={searchFilters.minPrice || ''}
                            onChange={(e) => setSearchFilters({ ...searchFilters, minPrice: e.target.value ? Number(e.target.value) : undefined })}
                            placeholder="0"
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4A5C6A] text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-300 text-xs sm:text-sm mb-1">Prix max (crédits)</label>
                          <input
                            type="number"
                            value={searchFilters.maxPrice || ''}
                            onChange={(e) => setSearchFilters({ ...searchFilters, maxPrice: e.target.value ? Number(e.target.value) : undefined })}
                            placeholder="∞"
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4A5C6A] text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-300 text-xs sm:text-sm mb-1">Note minimale</label>
                          <input
                            type="number"
                            min="0"
                            max="5"
                            step="0.1"
                            value={searchFilters.minRating || ''}
                            onChange={(e) => setSearchFilters({ ...searchFilters, minRating: e.target.value ? Number(e.target.value) : undefined })}
                            placeholder="0"
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4A5C6A] text-sm"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-gray-300 text-xs sm:text-sm mb-1">Trier par</label>
                          <select
                            value={searchFilters.sortBy || 'createdAt'}
                            onChange={(e) => setSearchFilters({ ...searchFilters, sortBy: e.target.value as any })}
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#4A5C6A] text-sm"
                          >
                            <option value="createdAt" className="bg-slate-800">Date de création</option>
                            <option value="price" className="bg-slate-800">Prix</option>
                            <option value="rating" className="bg-slate-800">Note</option>
                            <option value="title" className="bg-slate-800">Titre</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-gray-300 text-xs sm:text-sm mb-1">Ordre</label>
                          <select
                            value={searchFilters.sortOrder || 'desc'}
                            onChange={(e) => setSearchFilters({ ...searchFilters, sortOrder: e.target.value as any })}
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#4A5C6A] text-sm"
                          >
                            <option value="desc" className="bg-slate-800">Décroissant</option>
                            <option value="asc" className="bg-slate-800">Croissant</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {/* Afficher les résultats de recherche ou les services disponibles */}
                  {(searchQuery || searchFilters.category || searchFilters.minPrice || searchFilters.maxPrice || searchFilters.minRating) ? (
                    // Mode recherche active
                    searchResults.length > 0 ? (
                      // Résultats de recherche
                      searchResults.filter(service => service.providerId !== user?.id).map((service) => (
                    <div key={service.id} className="bg-white/5 rounded-lg p-3 sm:p-4 border border-white/10 hover:border-[#4A5C6A]/50 transition-all duration-300 cursor-pointer">
                      <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-[#4A5C6A] to-[#9BA8AB] rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                          <img 
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${service.provider?.avatarSeed || service.provider?.username || 'user'}&backgroundColor=4A5C6A,9BA8AB&backgroundType=gradientLinear`}
                            alt={service.provider?.username || 'Utilisateur'}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-white font-semibold text-sm sm:text-base truncate">{service.provider?.username || 'Utilisateur'}</h3>
                          <p className="text-gray-400 text-xs sm:text-sm truncate">{service.category}</p>
                        </div>
                      </div>
                      <h4 className="text-white font-bold mb-1 sm:mb-2 text-sm sm:text-base">{service.title}</h4>
                      <div className="mb-2">
                        {service.averageRating !== undefined ? (
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={`w-4 h-4 ${i < Math.round(service.averageRating || 0) ? 'text-yellow-400' : 'text-gray-400'}`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <span className="text-gray-300 text-xs">
                              {service.averageRating?.toFixed(1)} ({service.reviewCount || 0} avis)
                            </span>
                          </div>
                        ) : (
                          <ServiceRating 
                            serviceId={service.id} 
                            className="mb-2" 
                            showReviewButton={completedServiceIds.has(service.id)}
                            onReviewClick={() => {
                              setSelectedReviewTarget({
                                revieweeId: service.providerId,
                                revieweeUsername: service.provider?.username || 'Utilisateur',
                                serviceId: service.id,
                                serviceTitle: service.title
                              });
                              setShowReviewModal(true);
                            }}
                          />
                        )}
                      </div>
                      <p className="text-gray-300 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">{service.description}</p>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <span className="text-[#4A5C6A] font-bold text-xs sm:text-sm">{service.pricePerHour} crédits/heure</span>
                        <button 
                          onClick={() => openBookingModal(service)}
                          className="w-full sm:w-auto bg-[#4A5C6A] hover:bg-[#253745] text-white px-3 py-1.5 rounded text-xs sm:text-sm transition-colors transform hover:scale-105"
                        >
                          Réserver
                        </button>
                      </div>
                    </div>
                      ))
                    ) : (
                      // Aucun résultat de recherche
                      <div className="col-span-full text-center py-6 sm:py-8">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                          <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        <h3 className="text-white font-semibold mb-1 sm:mb-2 text-base sm:text-lg">Aucun résultat trouvé</h3>
                        <p className="text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4 px-4">
                          Essayez de modifier vos critères de recherche.
                        </p>
                        <button
                          onClick={() => {
                            setSearchQuery('');
                            setSearchFilters({
                              category: undefined,
                              minPrice: undefined,
                              maxPrice: undefined,
                              minRating: undefined,
                              sortBy: 'createdAt',
                              sortOrder: 'desc',
                              page: 1,
                              limit: 20,
                            });
                            setSearchResults([]);
                          }}
                          className="bg-[#4A5C6A] hover:bg-[#4A5C6A]/80 text-white px-4 sm:px-6 py-2 rounded-lg transition-colors text-sm sm:text-base"
                        >
                          Réinitialiser les filtres
                        </button>
                      </div>
                    )
                  ) : (
                    // Mode normal - afficher les services disponibles
                    filteredAvailableServices.filter(service => service.providerId !== user?.id).length > 0 ? (
                      filteredAvailableServices.filter(service => service.providerId !== user?.id).slice(0, 6).map((service) => (
                        <div key={service.id} className="bg-white/5 rounded-lg p-3 sm:p-4 border border-white/10 hover:border-[#4A5C6A]/50 transition-all duration-300 cursor-pointer">
                          <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-[#4A5C6A] to-[#9BA8AB] rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                              <img 
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${service.provider?.avatarSeed || service.provider?.username || 'user'}&backgroundColor=4A5C6A,9BA8AB&backgroundType=gradientLinear`}
                                alt={service.provider?.username || 'Utilisateur'}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="text-white font-semibold text-sm sm:text-base truncate">{service.provider?.username || 'Utilisateur'}</h3>
                              <p className="text-gray-400 text-xs sm:text-sm truncate">{service.category}</p>
                            </div>
                          </div>
                          <h4 className="text-white font-bold mb-1 sm:mb-2 text-sm sm:text-base">{service.title}</h4>
                          <div className="mb-2">
                            <ServiceRating 
                              serviceId={service.id} 
                              className="mb-2" 
                              showReviewButton={completedServiceIds.has(service.id)}
                              onReviewClick={() => {
                                setSelectedReviewTarget({
                                  revieweeId: service.providerId,
                                  revieweeUsername: service.provider?.username || 'Utilisateur',
                                  serviceId: service.id,
                                  serviceTitle: service.title
                                });
                                setShowReviewModal(true);
                              }}
                            />
                          </div>
                          <p className="text-gray-300 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">{service.description}</p>
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                            <span className="text-[#4A5C6A] font-bold text-xs sm:text-sm">{service.pricePerHour} crédits/heure</span>
                            <button 
                              onClick={() => openBookingModal(service)}
                              className="w-full sm:w-auto bg-[#4A5C6A] hover:bg-[#253745] text-white px-3 py-1.5 rounded text-xs sm:text-sm transition-colors transform hover:scale-105"
                            >
                              Réserver
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full text-center py-6 sm:py-8">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                          <MdWork className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                        </div>
                        <h3 className="text-white font-semibold mb-1 sm:mb-2 text-base sm:text-lg">Aucun service disponible</h3>
                        <p className="text-gray-400 text-xs sm:text-sm px-4">
                          {selectedAvailableCategory === 'all' 
                            ? "Aucun service disponible pour le moment." 
                            : "Aucun service disponible dans cette catégorie."
                          }
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Statistiques des Services */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-5 md:p-6 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-300 text-xs sm:text-sm">Services proposés</p>
                      <p className="text-2xl sm:text-3xl font-bold text-white">{myServices.length}</p>
                    </div>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#4A5C6A]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MdWork className="w-5 h-5 sm:w-6 sm:h-6 text-[#4A5C6A]" />
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-5 md:p-6 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-gray-300 text-xs sm:text-sm">Réservations en tant que prestataire</p>
                      <p className="text-2xl sm:text-3xl font-bold text-white">{myBookings.length}</p>
                    </div>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                      <GiReceiveMoney className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-5 md:p-6 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-gray-300 text-xs sm:text-sm">Réservations terminées (prestataire)</p>
                      <p className="text-2xl sm:text-3xl font-bold text-white">{completedBookings.length}</p>
                    </div>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-5 md:p-6 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-gray-300 text-xs sm:text-sm">Réservations en tant que client</p>
                      <p className="text-2xl sm:text-3xl font-bold text-white">{clientBookings.length}</p>
                    </div>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Indicateur d'avis en attente */}
                {(completedBookings.length > 0 || completedClientBookings.length > 0) && (
                  <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 backdrop-blur-sm rounded-xl p-4 sm:p-5 md:p-6 border border-yellow-500/20 col-span-full sm:col-span-1 lg:col-span-2">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                      <div>
                        <p className="text-yellow-300 text-xs sm:text-sm font-medium">Avis en attente</p>
                        <p className="text-xl sm:text-2xl font-bold text-white">{completedBookings.length + completedClientBookings.length}</p>
                        <p className="text-yellow-200 text-xs">Services terminés à évaluer</p>
                      </div>
                      <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                        <button
                          onClick={() => setActiveTab('bookings')}
                          className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg text-xs sm:text-sm hover:bg-yellow-500/30 transition-colors border border-yellow-500/30"
                        >
                          Donner mes avis
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-5 md:p-6 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-300 text-xs sm:text-sm">Crédits gagnés</p>
                      <p className="text-2xl sm:text-3xl font-bold text-white">{totalEarned}</p>
                    </div>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bookings Tab - Mobile First */}
          {activeTab === 'bookings' && (
            <div className="space-y-4 sm:space-y-6 md:space-y-8">
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1 sm:mb-2">Mes Réservations</h1>
                <p className="text-gray-300 text-xs sm:text-sm md:text-base">Gérez vos réservations de services</p>
              </div>

              {/* Réservations terminées en tant que client avec possibilité d'avis */}
              {completedClientBookings.length > 0 && (
                <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 backdrop-blur-sm rounded-xl p-6 border border-green-500/20">
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 inline text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Évaluez vos services reçus
                  </h2>
                  <p className="text-green-200 text-sm mb-4">
                    Partagez votre expérience pour aider la communauté
                  </p>
                  <div className="space-y-3">
                    {completedClientBookings.map((booking) => (
                      <div key={booking.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-white font-semibold">{booking.service?.title || 'Service'}</h3>
                            <p className="text-gray-300 text-sm">Prestataire: {booking.provider?.username || 'Utilisateur'}</p>
                            <p className="text-gray-300 text-sm">Terminé le {new Date(booking.updatedAt).toLocaleDateString()}</p>
                          </div>
                          <button
                            className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm hover:bg-green-500/30 transition-colors border border-green-500/30"
                            onClick={() => {
                              setSelectedReviewTarget({
                                revieweeId: booking.providerId,
                                revieweeUsername: booking.provider?.username || 'Utilisateur',
                                serviceId: booking.serviceId,
                                serviceTitle: booking.service?.title || 'Service',
                                bookingId: booking.id
                              });
                              setShowReviewModal(true);
                            }}
                          >
                            Évaluer le prestataire
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Réservations en tant que client */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h2 className="text-xl font-bold text-white mb-6">Mes réservations (en tant que client)</h2>
                <div className="space-y-4">
                  {bookings.filter(booking => booking.clientId === user?.id).length > 0 ? (
                    bookings.filter(booking => booking.clientId === user?.id).map((booking) => (
                      <div key={booking.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-white font-semibold">{booking.service?.title || 'Service'}</h3>
                            <p className="text-gray-300 text-sm">Prestataire: {booking.provider?.username || 'Utilisateur'}</p>
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
                    <p className="text-gray-300 text-center py-8">Aucune réservation en tant que client</p>
                  )}
                </div>
              </div>

              {/* Réservations terminées avec possibilité d'avis */}
              {completedBookings.length > 0 && (
                <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20">
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                    <svg className="w-4 h-4 mr-2 inline text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Donnez votre avis sur les services terminés
                  </h2>
                  <p className="text-blue-200 text-sm mb-4">
                    Évaluez vos clients pour améliorer la communauté
                  </p>
                  <div className="space-y-3">
                    {completedBookings.map((booking) => (
                      <div key={booking.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-white font-semibold">{booking.service?.title || 'Service'}</h3>
                            <p className="text-gray-300 text-sm">Client: {booking.client?.username || 'Utilisateur'}</p>
                            <p className="text-gray-300 text-sm">Terminé le {new Date(booking.updatedAt).toLocaleDateString()}</p>
                          </div>
                          <button
                            className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-sm hover:bg-blue-500/30 transition-colors border border-blue-500/30"
                            onClick={() => {
                              setSelectedReviewTarget({
                                revieweeId: booking.clientId,
                                revieweeUsername: booking.client?.username || 'Utilisateur',
                                serviceId: booking.serviceId,
                                serviceTitle: booking.service?.title || 'Service',
                                bookingId: booking.id
                              });
                              setShowReviewModal(true);
                            }}
                          >
                            Évaluer le client
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Réservations en tant que prestataire */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h2 className="text-xl font-bold text-white mb-6">Réservations de mes services (en tant que prestataire)</h2>
                <div className="space-y-4">
                  {bookings.filter(booking => booking.providerId === user?.id).length > 0 ? (
                    bookings.filter(booking => booking.providerId === user?.id).map((booking) => (
                      <div key={booking.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-white font-semibold">{booking.service?.title || 'Service'}</h3>
                            <p className="text-gray-300 text-sm">Client: {booking.client?.username || 'Utilisateur'}</p>
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
                                  {processingBookings.has(booking.id) ? 'En cours...' : 'Confirmer'}
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
                                  {processingBookings.has(booking.id) ? 'En cours...' : 'Refuser'}
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
                                {processingBookings.has(booking.id) ? 'En cours...' : 'Terminer'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-300 text-center py-8">Aucune réservation de vos services en tant que prestataire</p>
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
                                ? `Reçu de ${transaction.sender?.username || 'Utilisateur'}`
                                : `Envoyé à ${transaction.receiver?.username || 'Utilisateur'}`}
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

          {/* Analytics Tab */}
          {activeTab === 'analytics' && user && (
            <div className="space-y-6 sm:space-y-8">
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">Analytics</h1>
                <p className="text-gray-300 text-sm sm:text-base">Analysez vos revenus et dépenses en détail</p>
              </div>

              {(() => {
                const analytics = calculateAnalytics(transactions, user.id);
                return (
                  <>
                    <AnalyticsStats transactions={transactions} userId={user.id} />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      <RevenueExpenseChart data={analytics.monthlyData} type="monthly" />
                      <TransactionDistributionChart 
                        totalIncome={analytics.totalIncome} 
                        totalExpenses={analytics.totalExpenses} 
                      />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      <RevenueExpenseChart data={analytics.weeklyData} type="weekly" />
                      <MonthlyReport monthlyData={analytics.monthlyData} />
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20">
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Statistiques détaillées</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        <div>
                          <p className="text-gray-300 text-sm mb-1">Plus gros revenu</p>
                          <p className="text-green-400 text-xl sm:text-2xl font-bold">{analytics.largestIncome.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-gray-300 text-sm mb-1">Plus grosse dépense</p>
                          <p className="text-red-400 text-xl sm:text-2xl font-bold">{analytics.largestExpense.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-gray-300 text-sm mb-1">Nombre de transactions</p>
                          <p className="text-white text-xl sm:text-2xl font-bold">{analytics.transactionCount}</p>
                        </div>
                        <div>
                          <p className="text-gray-300 text-sm mb-1">Taux d'épargne</p>
                          <p className="text-blue-400 text-xl sm:text-2xl font-bold">
                            {analytics.totalIncome > 0 
                              ? ((analytics.netBalance / analytics.totalIncome) * 100).toFixed(1) 
                              : '0'}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <div className="h-[calc(100vh-200px)] min-h-[600px]">
              <MessagesInterface />
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-4 sm:space-y-6">
              {/* Header avec carte de compte style bancaire */}
              <div className="relative overflow-hidden bg-gradient-to-br from-[#1a2332] via-[#253745] to-[#2d3f52] rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-white/10 shadow-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-gradient-to-br from-[#4A5C6A]/20 to-transparent rounded-full blur-3xl"></div>
                <div className="relative z-10">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 mb-4 sm:mb-6">
                    <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
                      <div className="relative flex-shrink-0">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#4A5C6A] to-[#9BA8AB] rounded-xl sm:rounded-2xl flex items-center justify-center overflow-hidden shadow-xl ring-2 sm:ring-4 ring-white/10">
                          <img 
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed || user?.avatarSeed || user?.username}&backgroundColor=4A5C6A,9BA8AB&backgroundType=gradientLinear`}
                            alt={user?.username}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-4 h-4 sm:w-6 sm:h-6 bg-green-500 rounded-full border-2 border-[#1a2332]"></div>
                        <button
                          type="button"
                          onClick={(e) => generateNewAvatar(e)}
                          className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-5 h-5 sm:w-7 sm:h-7 bg-[#4A5C6A] hover:bg-[#253745] text-white rounded-full flex items-center justify-center transition-colors shadow-lg border-2 border-[#1a2332]"
                          title="Changer l'avatar"
                        >
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </button>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-0.5 sm:mb-1 truncate">{user?.username}</h1>
                        <p className="text-gray-300 text-xs sm:text-sm truncate">{user?.email}</p>
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-2">
                          <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-green-500/20 text-green-400 text-[10px] sm:text-xs font-semibold rounded-full border border-green-500/30 whitespace-nowrap">
                            ✓ Compte vérifié
                          </span>
                          <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-500/20 text-blue-400 text-[10px] sm:text-xs font-semibold rounded-full border border-blue-500/30 whitespace-nowrap">
                            Membre depuis {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }) : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={openProfileModal}
                      className="w-full sm:w-auto mt-4 sm:mt-0 px-4 sm:px-6 py-2.5 sm:py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg sm:rounded-xl font-semibold transition-all duration-300 border border-white/20 hover:border-white/30 flex items-center justify-center space-x-2 shadow-lg text-sm sm:text-base"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>Modifier</span>
                    </button>
                  </div>

                  {/* Carte de compte style bancaire */}
                  <div className="bg-gradient-to-r from-[#4A5C6A]/30 to-[#9BA8AB]/30 backdrop-blur-md rounded-lg sm:rounded-xl p-4 sm:p-6 border border-white/20 shadow-xl mt-4 sm:mt-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-start gap-3 sm:gap-0 mb-3 sm:mb-4">
                      <div className="flex-1">
                        <p className="text-gray-300 text-xs sm:text-sm mb-1">Solde disponible</p>
                        <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-white break-words">
                          {user?.credits.toFixed(2)} <span className="text-base sm:text-lg md:text-xl text-gray-400">crédits</span>
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-gray-300 text-[10px] sm:text-xs mb-1">ID Compte</p>
                        <p className="text-white font-mono text-xs sm:text-sm break-all">{user?.id.slice(0, 8).toUpperCase()}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-4 pt-3 sm:pt-4 border-t border-white/10">
                      <div className="flex-1 text-center sm:text-left">
                        <p className="text-gray-400 text-[10px] sm:text-xs mb-0.5 sm:mb-1">Transactions</p>
                        <p className="text-white font-semibold text-sm sm:text-base">{transactions.length}</p>
                      </div>
                      <div className="w-px h-6 sm:h-8 bg-white/20"></div>
                      <div className="flex-1 text-center sm:text-left">
                        <p className="text-gray-400 text-[10px] sm:text-xs mb-0.5 sm:mb-1">Services actifs</p>
                        <p className="text-white font-semibold text-sm sm:text-base">{services.filter(s => s.providerId === user?.id && s.isActive).length}</p>
                      </div>
                      <div className="w-px h-6 sm:h-8 bg-white/20"></div>
                      <div className="flex-1 text-center sm:text-left">
                        <p className="text-gray-400 text-[10px] sm:text-xs mb-0.5 sm:mb-1">Réservations</p>
                        <p className="text-white font-semibold text-sm sm:text-base">{bookings.length}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistiques détaillées */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white/5 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-6 border border-white/10 hover:border-white/20 transition-all">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <GiReceiveMoney className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
                    </div>
                  </div>
                  <p className="text-gray-400 text-xs sm:text-sm mb-1">Crédits reçus</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-white break-words">
                    {transactions
                      .filter(t => t.receiverId === user?.id)
                      .reduce((sum, t) => sum + t.amount, 0)
                      .toFixed(2)}
                  </p>
                  <p className="text-gray-500 text-[10px] sm:text-xs mt-1 sm:mt-2">Total des entrées</p>
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-6 border border-white/10 hover:border-white/20 transition-all">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                      <TbSend className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
                    </div>
                  </div>
                  <p className="text-gray-400 text-xs sm:text-sm mb-1">Crédits envoyés</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-white break-words">
                    {transactions
                      .filter(t => t.senderId === user?.id)
                      .reduce((sum, t) => sum + t.amount, 0)
                      .toFixed(2)}
                  </p>
                  <p className="text-gray-500 text-[10px] sm:text-xs mt-1 sm:mt-2">Total des sorties</p>
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-6 border border-white/10 hover:border-white/20 transition-all">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <BiTransfer className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                    </div>
                  </div>
                  <p className="text-gray-400 text-xs sm:text-sm mb-1">Transactions</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-white">{transactions.length}</p>
                  <p className="text-gray-500 text-[10px] sm:text-xs mt-1 sm:mt-2">Toutes transactions</p>
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-6 border border-white/10 hover:border-white/20 transition-all">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <MdWork className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                    </div>
                  </div>
                  <p className="text-gray-400 text-xs sm:text-sm mb-1">Services</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-white">{services.filter(s => s.providerId === user?.id).length}</p>
                  <p className="text-gray-500 text-[10px] sm:text-xs mt-1 sm:mt-2">Mes services</p>
                </div>
              </div>

              {/* Informations et historique */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Informations personnelles */}
                <div className="lg:col-span-2 bg-white/5 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-xl font-bold text-white">Informations du compte</h2>
                    <button
                      onClick={openProfileModal}
                      className="text-[#4A5C6A] hover:text-[#9BA8AB] transition-colors text-xs sm:text-sm font-medium"
                    >
                      Modifier
                    </button>
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between py-2 sm:py-3 border-b border-white/10">
                      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-gray-400 text-[10px] sm:text-xs">Nom d'utilisateur</p>
                          <p className="text-white font-medium text-sm sm:text-base truncate">{user?.username}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-2 sm:py-3 border-b border-white/10">
                      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-gray-400 text-[10px] sm:text-xs">Email</p>
                          <p className="text-white font-medium text-sm sm:text-base truncate">{user?.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-2 sm:py-3 border-b border-white/10">
                      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-gray-400 text-[10px] sm:text-xs">ID Utilisateur</p>
                          <p className="text-white font-mono text-xs sm:text-sm break-all">{user?.id}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-2 sm:py-3">
                      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-gray-400 text-[10px] sm:text-xs">Date d'inscription</p>
                          <p className="text-white font-medium text-xs sm:text-sm">
                            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR', { 
                              day: 'numeric', 
                              month: 'long', 
                              year: 'numeric' 
                            }) : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sécurité et activité */}
                <div className="bg-white/5 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-6 border border-white/10">
                  <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Sécurité</h2>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between p-2.5 sm:p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <p className="text-white text-xs sm:text-sm font-medium">Compte sécurisé</p>
                          <p className="text-gray-400 text-[10px] sm:text-xs">2FA activé</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-2.5 sm:p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <p className="text-white text-xs sm:text-sm font-medium">Mot de passe</p>
                          <p className="text-gray-400 text-[10px] sm:text-xs">Fort et sécurisé</p>
                        </div>
                      </div>
                    </div>
                    <div className="pt-3 sm:pt-4 border-t border-white/10">
                      <p className="text-gray-400 text-[10px] sm:text-xs mb-2 sm:mb-3">Activité récente</p>
                      <div className="space-y-1.5 sm:space-y-2">
                        <div className="flex items-center space-x-2 text-[10px] sm:text-xs text-gray-400">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full flex-shrink-0"></div>
                          <span className="truncate">Dernière connexion: Aujourd'hui</span>
                        </div>
                        <div className="flex items-center space-x-2 text-[10px] sm:text-xs text-gray-400">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-400 rounded-full flex-shrink-0"></div>
                          <span className="truncate">{transactions.length} transactions ce mois</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transactions récentes */}
              <div className="bg-white/5 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-white">Transactions récentes</h2>
                  <button
                    onClick={() => setActiveTab('history')}
                    className="text-[#4A5C6A] hover:text-[#9BA8AB] transition-colors text-xs sm:text-sm font-medium"
                  >
                    Voir tout →
                  </button>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  {transactions.slice(0, 5).map((transaction) => {
                    const isSent = transaction.senderId === user?.id;
                    const otherUser = isSent 
                      ? users.find(u => u.id === transaction.receiverId)
                      : users.find(u => u.id === transaction.senderId);
                    
                    return (
                      <div key={transaction.id} className="flex items-center justify-between p-3 sm:p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all gap-2 sm:gap-4">
                        <div className="flex items-center space-x-2 sm:space-x-3 sm:space-x-4 min-w-0 flex-1">
                          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            isSent ? 'bg-red-500/20' : 'bg-green-500/20'
                          }`}>
                            {isSent ? (
                              <TbSend className={`w-5 h-5 sm:w-6 sm:h-6 ${isSent ? 'text-red-400' : 'text-green-400'}`} />
                            ) : (
                              <GiReceiveMoney className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-white font-medium text-sm sm:text-base truncate">
                              {isSent ? 'Envoyé à' : 'Reçu de'} {otherUser?.username || 'Utilisateur'}
                            </p>
                            <p className="text-gray-400 text-xs sm:text-sm truncate">
                              {transaction.description || 'Transaction'}
                            </p>
                            <p className="text-gray-500 text-[10px] sm:text-xs mt-0.5 sm:mt-1">
                              {new Date(transaction.createdAt).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className={`font-bold text-base sm:text-lg ${
                            isSent ? 'text-red-400' : 'text-green-400'
                          }`}>
                            {isSent ? '-' : '+'}{transaction.amount.toFixed(2)}
                          </p>
                          <p className="text-gray-500 text-[10px] sm:text-xs">crédits</p>
                        </div>
                      </div>
                    );
                  })}
                  {transactions.length === 0 && (
                    <div className="text-center py-6 sm:py-8 text-gray-400 text-sm sm:text-base">
                      <p>Aucune transaction pour le moment</p>
                    </div>
                  )}
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
                  onChange={(e) => {
                    setTransferForm({ ...transferForm, receiverId: e.target.value });
                    if (transferErrors.receiverId) setTransferErrors({ ...transferErrors, receiverId: '' });
                  }}
                  className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4A5C6A] focus:border-transparent ${
                    transferErrors.receiverId ? 'border-red-500' : 'border-white/20'
                  }`}
                  required
                >
                  <option value="" className="bg-slate-800">Sélectionner un utilisateur</option>
                  {users.filter(u => u.id !== user?.id).map((u) => (
                    <option key={u.id} value={u.id} className="bg-slate-800">
                      {u.username}
                    </option>
                  ))}
                </select>
                {transferErrors.receiverId && (
                  <p className="text-red-400 text-sm mt-1">{transferErrors.receiverId}</p>
                )}
              </div>
              <div>
                <label className="block text-white font-medium mb-2">Montant</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={user?.credits}
                  value={transferForm.amount}
                  onChange={(e) => {
                    setTransferForm({ ...transferForm, amount: e.target.value });
                    if (transferErrors.amount) setTransferErrors({ ...transferErrors, amount: '' });
                  }}
                  className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4A5C6A] focus:border-transparent ${
                    transferErrors.amount ? 'border-red-500' : 'border-white/20'
                  }`}
                  placeholder="0.00"
                  required
                />
                {transferErrors.amount && (
                  <p className="text-red-400 text-sm mt-1">{transferErrors.amount}</p>
                )}
              </div>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowTransferModal(false);
                    setTransferErrors({});
                  }}
                  className="flex-1 px-4 py-3 text-gray-300 hover:text-white transition-colors"
                  disabled={isTransferring}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isTransferring}
                  className="flex-1 bg-gradient-to-r from-[#4A5C6A] to-[#9BA8AB] text-white py-3 px-6 rounded-lg hover:from-[#253745] hover:to-[#4A5C6A] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center space-x-2"
                >
                  {isTransferring ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>En cours...</span>
                    </>
                  ) : (
                    <>
                      <TbSend className="w-4 h-4" />
                      <span>Transférer</span>
                    </>
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
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.avatarSeed || u.username}&backgroundColor=4A5C6A,9BA8AB&backgroundType=gradientLinear`}
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
                  onChange={(e) => {
                    setServiceForm({ ...serviceForm, title: e.target.value });
                    if (serviceErrors.title) setServiceErrors({ ...serviceErrors, title: '' });
                  }}
                  className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4A5C6A] focus:border-transparent ${
                    serviceErrors.title ? 'border-red-500' : 'border-white/20'
                  }`}
                  placeholder="Ex: Cours de programmation"
                  required
                />
                {serviceErrors.title && (
                  <p className="text-red-400 text-sm mt-1">{serviceErrors.title}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={serviceForm.description}
                  onChange={(e) => {
                    setServiceForm({ ...serviceForm, description: e.target.value });
                    if (serviceErrors.description) setServiceErrors({ ...serviceErrors, description: '' });
                  }}
                  className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4A5C6A] focus:border-transparent resize-none ${
                    serviceErrors.description ? 'border-red-500' : 'border-white/20'
                  }`}
                  rows={3}
                  placeholder="Décrivez votre service..."
                  required
                />
                {serviceErrors.description && (
                  <p className="text-red-400 text-sm mt-1">{serviceErrors.description}</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Prix (crédits)
                  </label>
                  <input
                    type="number"
                    value={serviceForm.price}
                    onChange={(e) => {
                      setServiceForm({ ...serviceForm, price: e.target.value });
                      if (serviceErrors.price) setServiceErrors({ ...serviceErrors, price: '' });
                    }}
                    className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4A5C6A] focus:border-transparent ${
                      serviceErrors.price ? 'border-red-500' : 'border-white/20'
                    }`}
                    placeholder="50"
                    min="1"
                    required
                  />
                  {serviceErrors.price && (
                    <p className="text-red-400 text-sm mt-1">{serviceErrors.price}</p>
                  )}
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
                  onChange={(e) => {
                    setServiceForm({ ...serviceForm, category: e.target.value });
                    if (serviceErrors.category) setServiceErrors({ ...serviceErrors, category: '' });
                  }}
                  className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4A5C6A] focus:border-transparent ${
                    serviceErrors.category ? 'border-red-500' : 'border-white/20'
                  }`}
                  required
                >
                  <option value="" className="bg-slate-800">Sélectionner une catégorie</option>
                  {categories.filter(cat => cat.value !== 'all').map(category => (
                    <option key={category.value} value={category.value} className="bg-slate-800">
                      {category.label}
                    </option>
                  ))}
                </select>
                {serviceErrors.category && (
                  <p className="text-red-400 text-sm mt-1">{serviceErrors.category}</p>
                )}
              </div>
              
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowServiceModal(false);
                    setServiceErrors({});
                  }}
                  className="flex-1 px-4 py-3 text-gray-300 hover:text-white transition-colors"
                  disabled={isCreatingService}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isCreatingService}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-[#4A5C6A] to-[#9BA8AB] text-white rounded-lg font-semibold hover:from-[#253745] hover:to-[#4A5C6A] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isCreatingService ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Création...</span>
                    </>
                  ) : (
                    'Créer le service'
                  )}
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
                <span className="text-[#4A5C6A] font-semibold">{selectedService.pricePerHour} crédits/heure</span>
                <span className="text-gray-400">1h</span>
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
                  onClick={() => {
                    setShowBookingModal(false);
                    setBookingErrors({});
                  }}
                  className="flex-1 px-4 py-3 text-gray-300 hover:text-white transition-colors"
                  disabled={isBooking}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isBooking}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-[#4A5C6A] to-[#9BA8AB] text-white rounded-lg font-semibold hover:from-[#253745] hover:to-[#4A5C6A] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isBooking ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Envoi...</span>
                    </>
                  ) : (
                    'Envoyer la demande'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal d'édition de service */}
      {showEditServiceModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto modal-scrollbar">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Modifier le service</h2>
              <button
                onClick={() => {
                  setShowEditServiceModal(false);
                  setEditingService(null);
                  setEditServiceForm({ title: '', description: '', pricePerHour: '', category: '', duration: '' });
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleUpdateService} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Titre du service
                </label>
                <input
                  type="text"
                  value={editServiceForm.title}
                  onChange={(e) => {
                    setEditServiceForm({ ...editServiceForm, title: e.target.value });
                    if (serviceErrors.title) setServiceErrors({ ...serviceErrors, title: '' });
                  }}
                  className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4A5C6A] focus:border-transparent ${
                    serviceErrors.title ? 'border-red-500' : 'border-white/20'
                  }`}
                  placeholder="Ex: Cours de programmation"
                  required
                />
                {serviceErrors.title && (
                  <p className="text-red-400 text-sm mt-1">{serviceErrors.title}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={editServiceForm.description}
                  onChange={(e) => {
                    setEditServiceForm({ ...editServiceForm, description: e.target.value });
                    if (serviceErrors.description) setServiceErrors({ ...serviceErrors, description: '' });
                  }}
                  className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4A5C6A] focus:border-transparent resize-none ${
                    serviceErrors.description ? 'border-red-500' : 'border-white/20'
                  }`}
                  rows={3}
                  placeholder="Décrivez votre service..."
                  required
                />
                {serviceErrors.description && (
                  <p className="text-red-400 text-sm mt-1">{serviceErrors.description}</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Prix par heure (crédits)
                  </label>
                  <input
                    type="number"
                    value={editServiceForm.pricePerHour}
                    onChange={(e) => {
                      setEditServiceForm({ ...editServiceForm, pricePerHour: e.target.value });
                      if (serviceErrors.pricePerHour) setServiceErrors({ ...serviceErrors, pricePerHour: '' });
                    }}
                    className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4A5C6A] focus:border-transparent ${
                      serviceErrors.pricePerHour ? 'border-red-500' : 'border-white/20'
                    }`}
                    placeholder="25"
                    min="1"
                    required
                  />
                  {serviceErrors.pricePerHour && (
                    <p className="text-red-400 text-sm mt-1">{serviceErrors.pricePerHour}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Durée (heures)
                  </label>
                  <input
                    type="number"
                    value={editServiceForm.duration}
                    onChange={(e) => setEditServiceForm({ ...editServiceForm, duration: e.target.value })}
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
                  value={editServiceForm.category}
                  onChange={(e) => {
                    setEditServiceForm({ ...editServiceForm, category: e.target.value });
                    if (serviceErrors.category) setServiceErrors({ ...serviceErrors, category: '' });
                  }}
                  className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4A5C6A] focus:border-transparent ${
                    serviceErrors.category ? 'border-red-500' : 'border-white/20'
                  }`}
                  required
                >
                  <option value="" className="bg-slate-800">Sélectionner une catégorie</option>
                  {categories.filter(cat => cat.value !== 'all').map(category => (
                    <option key={category.value} value={category.value} className="bg-slate-800">
                      {category.label}
                    </option>
                  ))}
                </select>
                {serviceErrors.category && (
                  <p className="text-red-400 text-sm mt-1">{serviceErrors.category}</p>
                )}
              </div>
              
              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  disabled={isUpdatingService}
                  className="flex-1 bg-gradient-to-r from-[#4A5C6A] to-[#9BA8AB] text-white py-3 px-6 rounded-lg font-semibold hover:from-[#253745] hover:to-[#4A5C6A] transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-[#4A5C6A]/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                >
                  {isUpdatingService ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Modification...</span>
                    </>
                  ) : (
                    'Modifier le service'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditServiceModal(false);
                    setEditingService(null);
                    setEditServiceForm({ title: '', description: '', pricePerHour: '', category: '', duration: '' });
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300"
                >
                  Annuler
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
              {toast.type === 'success' ? (
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
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
                    onClick={(e) => generateNewAvatar(e)}
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
                      // Ne pas changer l'avatar quand on modifie le username
                      if (profileErrors.username) setProfileErrors({ ...profileErrors, username: '' });
                    }}
                    className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4A5C6A] focus:border-transparent ${
                      profileErrors.username ? 'border-red-500' : 'border-white/20'
                    }`}
                    placeholder="Nom d'utilisateur"
                    required
                  />
                  {profileErrors.username && (
                    <p className="text-red-400 text-sm mt-1">{profileErrors.username}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => {
                      setProfileForm({ ...profileForm, email: e.target.value });
                      if (profileErrors.email) setProfileErrors({ ...profileErrors, email: '' });
                    }}
                    className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4A5C6A] focus:border-transparent ${
                      profileErrors.email ? 'border-red-500' : 'border-white/20'
                    }`}
                    placeholder="Email"
                    required
                  />
                  {profileErrors.email && (
                    <p className="text-red-400 text-sm mt-1">{profileErrors.email}</p>
                  )}
                </div>
              </div>


              {/* Changement de mot de passe */}
              <div className="border-t border-white/10 pt-6">
                <h3 className="text-lg font-semibold text-white mb-4">Changer le mot de passe</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      value={profileForm.password}
                      onChange={(e) => {
                        setProfileForm({ ...profileForm, password: e.target.value });
                        if (profileErrors.password) setProfileErrors({ ...profileErrors, password: '' });
                      }}
                      className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4A5C6A] focus:border-transparent ${
                        profileErrors.password ? 'border-red-500' : 'border-white/20'
                      }`}
                      placeholder="Laisser vide pour ne pas changer"
                    />
                    {profileErrors.password && (
                      <p className="text-red-400 text-sm mt-1">{profileErrors.password}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      Minimum 6 caractères, avec majuscule, minuscule et chiffre
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Confirmer le mot de passe
                    </label>
                    <input
                      type="password"
                      value={profileForm.confirmPassword}
                      onChange={(e) => {
                        setProfileForm({ ...profileForm, confirmPassword: e.target.value });
                        if (profileErrors.confirmPassword) setProfileErrors({ ...profileErrors, confirmPassword: '' });
                      }}
                      className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4A5C6A] focus:border-transparent ${
                        profileErrors.confirmPassword ? 'border-red-500' : 'border-white/20'
                      }`}
                      placeholder="Confirmer le nouveau mot de passe"
                    />
                    {profileErrors.confirmPassword && (
                      <p className="text-red-400 text-sm mt-1">{profileErrors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileModal(false);
                    setProfileErrors({});
                  }}
                  className="flex-1 px-4 py-3 text-gray-300 hover:text-white transition-colors"
                  disabled={isUpdatingProfile}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-[#4A5C6A] to-[#9BA8AB] text-white rounded-lg font-semibold hover:from-[#253745] hover:to-[#4A5C6A] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isUpdatingProfile ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Sauvegarde...</span>
                    </>
                  ) : (
                    'Sauvegarder'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Review Modal */}
      <CreateReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onSubmit={handleCreateReview}
        revieweeId={selectedReviewTarget?.revieweeId || ''}
        revieweeName={selectedReviewTarget?.revieweeUsername || ''}
        serviceId={selectedReviewTarget?.serviceId}
        serviceTitle={selectedReviewTarget?.serviceTitle}
        bookingId={selectedReviewTarget?.bookingId}
      />
    </div>
  );
}