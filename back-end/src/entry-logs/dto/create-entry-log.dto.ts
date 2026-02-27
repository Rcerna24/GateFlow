import { IsEnum, IsString } from 'class-validator';
import { EntryType } from '@prisma/client';

export class CreateEntryLogDto {
  @IsString()
  qrToken!: string;

  @IsEnum(EntryType)
  type!: EntryType;

  @IsString()
  location!: string;
}
