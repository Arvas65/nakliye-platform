import { z } from 'zod';

export const cargoTypeSchema = z.enum([
  'GENERAL',
  'PALLETIZED',
  'FRAGILE',
  'PERISHABLE',
  'REFRIGERATED',
  'HAZARDOUS',
  'OVERSIZED',
  'LIVE_ANIMAL',
  'VEHICLE',
  'CONTAINER',
  'OTHER',
]);
export type CargoType = z.infer<typeof cargoTypeSchema>;

export const cargoStatusSchema = z.enum([
  'DRAFT',
  'OPEN',
  'MATCHED',
  'IN_TRANSIT',
  'DELIVERED',
  'COMPLETED',
  'CANCELLED',
  'EXPIRED',
]);
export type CargoStatus = z.infer<typeof cargoStatusSchema>;

export const vehicleTypeSchema = z.enum([
  'VAN',
  'TRUCK_SMALL',
  'TRUCK_MEDIUM',
  'TRUCK_LARGE',
  'SEMI_TRAILER',
  'REFRIGERATED',
  'TANKER',
  'CONTAINER',
  'FLATBED',
  'OTHER',
]);
export type VehicleType = z.infer<typeof vehicleTypeSchema>;

export const createCargoSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(10),
  cargoType: cargoTypeSchema,
  vehicleTypeRequired: vehicleTypeSchema.optional(),
  weightKg: z.number().int().positive(),
  volumeM3: z.number().positive().optional(),
  pickupAddress: z.string(),
  pickupCity: z.string(),
  pickupDistrict: z.string().optional(),
  pickupLat: z.number().min(-90).max(90),
  pickupLng: z.number().min(-180).max(180),
  pickupDate: z.string().datetime(),
  dropoffAddress: z.string(),
  dropoffCity: z.string(),
  dropoffDistrict: z.string().optional(),
  dropoffLat: z.number().min(-90).max(90),
  dropoffLng: z.number().min(-180).max(180),
  dropoffDate: z.string().datetime().optional(),
  budget: z.number().positive(),
  currency: z.string().length(3).default('TRY'),
});
export type CreateCargoInput = z.infer<typeof createCargoSchema>;
