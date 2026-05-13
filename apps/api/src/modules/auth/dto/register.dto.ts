import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { UserRole } from '@prisma/client';

export class RegisterDto {
  @ApiProperty({ example: 'kullanici@example.com' })
  @IsEmail({}, { message: 'Geçerli bir email adresi girin.' })
  email!: string;

  @ApiProperty({
    example: 'Guvenli!Sifre123',
    description: 'En az 8 karakter, büyük/küçük harf ve rakam içermeli',
  })
  @IsString()
  @MinLength(8, { message: 'Şifre en az 8 karakter olmalı.' })
  @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Şifre büyük harf, küçük harf ve rakam içermeli.',
  })
  password!: string;

  @ApiProperty({ enum: UserRole, example: UserRole.CARGO_OWNER })
  @IsEnum(UserRole)
  role!: UserRole;

  @ApiProperty({ example: 'Ahmet' })
  @IsString()
  @MinLength(2)
  firstName!: string;

  @ApiProperty({ example: 'Yıldız' })
  @IsString()
  @MinLength(2)
  lastName!: string;

  @ApiProperty({ example: '+905551234567', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^\+?[1-9]\d{9,14}$/, { message: 'Geçerli bir telefon numarası girin.' })
  phone?: string;
}
