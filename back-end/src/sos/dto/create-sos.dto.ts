import { IsEnum, IsString } from 'class-validator';
import { EmergencyType } from '@prisma/client';

export class CreateSosDto {
  @IsEnum(EmergencyType)
  type!: EmergencyType;

  @IsString()
  message!: string;
}
