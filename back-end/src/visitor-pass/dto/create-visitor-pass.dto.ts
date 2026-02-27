import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateVisitorPassDto {
  @ApiProperty({ example: 'Juan Dela Cruz' })
  @IsString()
  fullName!: string;

  @ApiProperty({ example: '+639001234567' })
  @IsString()
  contactNumber!: string;

  @ApiProperty({ example: 'Meeting with department head' })
  @IsString()
  purpose!: string;

  @ApiProperty({ example: 'Dr. Maria Santos' })
  @IsString()
  personToVisit!: string;

  @ApiProperty({ example: '2026-03-01T08:00:00.000Z' })
  @IsDateString()
  visitDate!: string;

  @ApiProperty({ example: '2026-03-01T08:00:00.000Z' })
  @IsDateString()
  timeWindowStart!: string;

  @ApiProperty({ example: '2026-03-01T17:00:00.000Z' })
  @IsDateString()
  timeWindowEnd!: string;

  @ApiPropertyOptional({ example: 'visitor@email.com' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ example: '123 Main St, Baybay City' })
  @IsOptional()
  @IsString()
  address?: string;
}
