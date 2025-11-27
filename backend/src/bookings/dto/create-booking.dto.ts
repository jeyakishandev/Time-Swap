import { IsString, IsNumber, IsOptional, IsDateString, Min, Max, MaxLength } from 'class-validator';

export class CreateBookingDto {
  @IsString({ message: 'L\'ID du service doit être une chaîne de caractères' })
  serviceId: string;

  @IsNumber({}, { message: 'Le nombre d\'heures doit être un nombre' })
  @Min(0.5, { message: 'Le nombre d\'heures doit être d\'au moins 0.5' })
  @Max(168, { message: 'Le nombre d\'heures ne peut pas dépasser 168 (1 semaine)' })
  hours: number;

  @IsOptional()
  @IsString({ message: 'Les notes doivent être une chaîne de caractères' })
  @MaxLength(500, { message: 'Les notes ne peuvent pas dépasser 500 caractères' })
  notes?: string;

  @IsOptional()
  @IsDateString({}, { message: 'La date planifiée doit être une date valide au format ISO' })
  scheduledAt?: string;
}
