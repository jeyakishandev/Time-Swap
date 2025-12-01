import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  receiverId: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1, { message: 'Le message ne peut pas être vide' })
  content: string;
}

