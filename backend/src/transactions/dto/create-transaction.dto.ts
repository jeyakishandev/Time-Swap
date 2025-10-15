import { IsString, IsNumber, IsPositive, IsOptional } from 'class-validator';

export class CreateTransactionDto {
  @IsString()
  senderId: string;

  @IsString()
  receiverId: string;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsOptional()
  @IsString()
  description?: string;
}
