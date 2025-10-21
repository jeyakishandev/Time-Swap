import { IsString, IsNumber, IsOptional, IsDateString, Min } from 'class-validator';

export class CreateBookingDto {
  @IsString()
  serviceId: string;

  @IsNumber()
  @Min(0.5)
  hours: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
}
