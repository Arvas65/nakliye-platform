import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { CargoType, VehicleType } from '@prisma/client';

export class CreateCargoDto {
  @ApiProperty()
  @IsString()
  @MinLength(5)
  title!: string;

  @ApiProperty()
  @IsString()
  @MinLength(10)
  description!: string;

  @ApiProperty({ enum: CargoType })
  @IsEnum(CargoType)
  cargoType!: CargoType;

  @ApiPropertyOptional({ enum: VehicleType })
  @IsOptional()
  @IsEnum(VehicleType)
  vehicleTypeRequired?: VehicleType;

  @ApiProperty()
  @IsInt()
  @Min(1)
  weightKg!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  volumeM3?: number;

  // ---- Pickup ----
  @ApiProperty()
  @IsString()
  pickupAddress!: string;

  @ApiProperty()
  @IsString()
  pickupCity!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pickupDistrict?: string;

  @ApiProperty()
  @IsLatitude()
  @Type(() => Number)
  pickupLat!: number;

  @ApiProperty()
  @IsLongitude()
  @Type(() => Number)
  pickupLng!: number;

  @ApiProperty()
  @IsDateString()
  pickupDate!: string;

  // ---- Dropoff ----
  @ApiProperty()
  @IsString()
  dropoffAddress!: string;

  @ApiProperty()
  @IsString()
  dropoffCity!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dropoffDistrict?: string;

  @ApiProperty()
  @IsLatitude()
  @Type(() => Number)
  dropoffLat!: number;

  @ApiProperty()
  @IsLongitude()
  @Type(() => Number)
  dropoffLng!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dropoffDate?: string;

  // ---- Fiyat ----
  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  budget!: number;

  @ApiPropertyOptional({ default: 'TRY' })
  @IsOptional()
  @IsString()
  currency?: string;
}
