import { IsString, IsNumber, IsPositive, IsOptional, Min, Max, MaxLength } from 'class-validator';

export class CreateTransactionDto {
  @IsString({ message: 'L\'ID de l\'expéditeur doit être une chaîne de caractères' })
  senderId: string;

  @IsString({ message: 'L\'ID du destinataire doit être une chaîne de caractères' })
  receiverId: string;

  @IsNumber({}, { message: 'Le montant doit être un nombre' })
  @IsPositive({ message: 'Le montant doit être positif' })
  @Min(0.01, { message: 'Le montant minimum est de 0.01 crédit' })
  @Max(100000, { message: 'Le montant maximum est de 100000 crédits' })
  amount: number;

  @IsOptional()
  @IsString({ message: 'La description doit être une chaîne de caractères' })
  @MaxLength(500, { message: 'La description ne peut pas dépasser 500 caractères' })
  description?: string;
}
