import { PrismaClient, UserRole, VehicleType, CargoType, CargoStatus } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seed başlatılıyor...');

  // Admin
  const adminPasswordHash = await argon2.hash('Admin123!');
  await prisma.user.upsert({
    where: { email: 'admin@nakliye.local' },
    update: {},
    create: {
      email: 'admin@nakliye.local',
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
      firstName: 'Sistem',
      lastName: 'Yöneticisi',
      emailVerifiedAt: new Date(),
      profile: { create: {} },
    },
  });

  // Yük sahibi örnek
  const ownerHash = await argon2.hash('Owner123!');
  const owner = await prisma.user.upsert({
    where: { email: 'owner@nakliye.local' },
    update: {},
    create: {
      email: 'owner@nakliye.local',
      passwordHash: ownerHash,
      role: UserRole.CARGO_OWNER,
      firstName: 'Ahmet',
      lastName: 'Yıldız',
      emailVerifiedAt: new Date(),
      profile: {
        create: {
          companyName: 'Yıldız Tekstil A.Ş.',
          city: 'İstanbul',
          district: 'Beyoğlu',
        },
      },
    },
  });

  // Nakliyeci örnek
  const carrierHash = await argon2.hash('Carrier123!');
  await prisma.user.upsert({
    where: { email: 'carrier@nakliye.local' },
    update: {},
    create: {
      email: 'carrier@nakliye.local',
      passwordHash: carrierHash,
      role: UserRole.TRANSPORTER,
      firstName: 'Mehmet',
      lastName: 'Demir',
      emailVerifiedAt: new Date(),
      profile: {
        create: {
          companyName: 'Demir Nakliyat',
          city: 'Ankara',
          district: 'Çankaya',
          yearsOfExperience: 12,
          driverLicenseClass: 'E',
        },
      },
      vehicles: {
        create: {
          plateNumber: '06 ABC 123',
          type: VehicleType.TRUCK_MEDIUM,
          brand: 'Ford',
          model: 'Cargo 1846T',
          year: 2022,
          capacityKg: 18000,
          volumeM3: 50,
          hasGps: true,
          hasInsurance: true,
        },
      },
    },
  });

  // Örnek ilan
  await prisma.cargoPost.create({
    data: {
      ownerId: owner.id,
      title: 'İstanbul - Ankara 10 ton tekstil',
      description: '10 ton paketlenmiş tekstil ürünü, paletli, brandalı kamyon gerekli.',
      cargoType: CargoType.PALLETIZED,
      vehicleTypeRequired: VehicleType.TRUCK_MEDIUM,
      weightKg: 10000,
      volumeM3: 30,
      pickupAddress: 'İkitelli OSB, Başakşehir / İstanbul',
      pickupCity: 'İstanbul',
      pickupDistrict: 'Başakşehir',
      pickupLat: 41.0769,
      pickupLng: 28.7639,
      pickupDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      dropoffAddress: 'Ostim OSB, Yenimahalle / Ankara',
      dropoffCity: 'Ankara',
      dropoffDistrict: 'Yenimahalle',
      dropoffLat: 39.981,
      dropoffLng: 32.7474,
      distanceKm: 450,
      budget: 18000,
      currency: 'TRY',
      status: CargoStatus.OPEN,
    },
  });

  console.log('✅ Seed tamamlandı.');
  console.log(`   Admin:    admin@nakliye.local    / Admin123!`);
  console.log(`   Owner:    owner@nakliye.local    / Owner123!`);
  console.log(`   Carrier:  carrier@nakliye.local  / Carrier123!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
