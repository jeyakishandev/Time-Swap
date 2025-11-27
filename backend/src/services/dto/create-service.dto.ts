import { IsString, IsNumber, IsBoolean, IsOptional, MinLength, MaxLength, Min, Max } from 'class-validator';

export class CreateServiceDto {
  @IsString({ message: 'Le titre doit être une chaîne de caractères' })
  @MinLength(3, { message: 'Le titre doit contenir au moins 3 caractères' })
  @MaxLength(100, { message: 'Le titre ne peut pas dépasser 100 caractères' })
  title: string;

  @IsString({ message: 'La description doit être une chaîne de caractères' })
  @MinLength(10, { message: 'La description doit contenir au moins 10 caractères' })
  @MaxLength(500, { message: 'La description ne peut pas dépasser 500 caractères' })
  description: string;

  @IsString({ message: 'La catégorie doit être une chaîne de caractères' })
  @MinLength(2, { message: 'La catégorie doit contenir au moins 2 caractères' })
  category: string;

  @IsNumber({}, { message: 'Le prix par heure doit être un nombre' })
  @Min(0.01, { message: 'Le prix par heure doit être supérieur à 0.01' })
  @Max(10000, { message: 'Le prix par heure ne peut pas dépasser 10000' })
  pricePerHour: number;

  @IsOptional()
  @IsBoolean({ message: 'isActive doit être un booléen' })
  isActive?: boolean;
}



