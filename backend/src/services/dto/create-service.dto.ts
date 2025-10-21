import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class CreateServiceDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  category: string;

  @IsNumber()
  pricePerHour: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}



