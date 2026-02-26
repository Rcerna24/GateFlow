import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'student@vsu.edu.ph' })
  @IsEmail()
  email!: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ example: 'Maria' })
  @IsString()
  firstName!: string;

  @ApiProperty({ example: 'Santos' })
  @IsString()
  lastName!: string;

  @ApiProperty({ enum: ['STUDENT', 'FACULTY', 'STAFF'], enumName: 'Role' })
  @IsEnum(Role)
  role!: Role;

  @ApiPropertyOptional({ example: '+639001234567' })
  @IsOptional()
  @IsString()
  contactNumber?: string;
}
