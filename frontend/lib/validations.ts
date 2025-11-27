import { z } from 'zod';

// Schéma de validation pour le transfert
export const transferSchema = z.object({
  receiverId: z.string().min(1, 'Sélectionnez un destinataire'),
  amount: z.string()
    .min(1, 'Le montant est requis')
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: 'Le montant doit être un nombre positif',
    })
    .refine((val) => parseFloat(val) >= 0.01, {
      message: 'Le montant minimum est de 0.01 crédit',
    }),
  description: z.string().optional(),
});

// Schéma de validation pour la création de service
export const serviceSchema = z.object({
  title: z.string()
    .min(3, 'Le titre doit contenir au moins 3 caractères')
    .max(100, 'Le titre ne peut pas dépasser 100 caractères'),
  description: z.string()
    .min(10, 'La description doit contenir au moins 10 caractères')
    .max(500, 'La description ne peut pas dépasser 500 caractères'),
  price: z.string()
    .min(1, 'Le prix est requis')
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: 'Le prix doit être un nombre positif',
    }),
  category: z.string().min(1, 'Sélectionnez une catégorie'),
  duration: z.string().optional(),
});

// Schéma de validation pour la réservation
export const bookingSchema = z.object({
  serviceId: z.string().min(1, 'Service requis'),
  message: z.string().max(500, 'Le message ne peut pas dépasser 500 caractères').optional(),
  preferredDate: z.string().optional(),
});

// Schéma de validation pour le profil
export const profileSchema = z.object({
  username: z.string()
    .min(3, 'Le nom d\'utilisateur doit contenir au moins 3 caractères')
    .max(30, 'Le nom d\'utilisateur ne peut pas dépasser 30 caractères')
    .regex(/^[a-zA-Z0-9_]+$/, 'Le nom d\'utilisateur ne peut contenir que des lettres, chiffres et underscores'),
  email: z.string()
    .email('Email invalide')
    .min(1, 'L\'email est requis'),
  bio: z.string().max(500, 'La bio ne peut pas dépasser 500 caractères').optional(),
  phone: z.string().max(20, 'Le téléphone ne peut pas dépasser 20 caractères').optional(),
  location: z.string().max(100, 'La localisation ne peut pas dépasser 100 caractères').optional(),
});

// Types dérivés des schémas
export type TransferFormData = z.infer<typeof transferSchema>;
export type ServiceFormData = z.infer<typeof serviceSchema>;
export type BookingFormData = z.infer<typeof bookingSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;

