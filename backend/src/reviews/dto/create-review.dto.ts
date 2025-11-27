import { IsInt, IsString, IsOptional, Min, Max, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateReviewDto {
  @IsInt({ message: 'La note doit être un nombre entier' })
  @Min(1, { message: 'La note minimum est 1' })
  @Max(5, { message: 'La note maximum est 5' })
  @IsNotEmpty({ message: 'La note est requise' })
  rating: number;

  @IsOptional()
  @IsString({ message: 'Le commentaire doit être une chaîne de caractères' })
  @MaxLength(1000, { message: 'Le commentaire ne peut pas dépasser 1000 caractères' })
  comment?: string;

  @IsString({ message: 'L\'ID de la personne évaluée doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'L\'ID de la personne évaluée est requis' })
  revieweeId: string;

  @IsOptional()
  @IsString({ message: 'L\'ID du service doit être une chaîne de caractères' })
  serviceId?: string;

  @IsOptional()
  @IsString({ message: 'L\'ID de la réservation doit être une chaîne de caractères' })
  bookingId?: string;
}
