const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

const SALT_ROUNDS = 10;
const DEFAULT_PASSWORD = 'password123'; // Use this to log in with seed accounts

async function main() {
  console.log('🌱 Seeding database with properly hashed passwords...');

  // Clear existing data to avoid duplicates
  await prisma.volunteerTask.deleteMany();
  await prisma.ngoRequest.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.donation.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);

  const donor = await prisma.user.create({
    data: {
      role: 'donor',
      name_or_org: 'Downtown Cafe',
      email: 'hello@downtowncafe.com',
      password_hash: hashedPassword,
      is_verified: true,
      lat: 40.7128,
      lng: -74.0060,
      address: '123 Donut Street, NY'
    }
  });

  const ngo = await prisma.user.create({
    data: {
      role: 'ngo',
      name_or_org: 'City Rescue Shelter',
      email: 'admin@cityrescue.org',
      password_hash: hashedPassword,
      is_verified: true,
      lat: 40.7580,
      lng: -73.9855,
      address: '456 Mission Ave, NY'
    }
  });

  const volunteer = await prisma.user.create({
    data: {
      role: 'volunteer',
      name_or_org: 'Sarah Jenkins',
      email: 'sarah.volunteers@email.com',
      password_hash: hashedPassword,
      is_verified: true,
      lat: 40.7300,
      lng: -73.9900
    }
  });

  console.log(`✅ Users created (password for all: "${DEFAULT_PASSWORD}")`);
  console.log(`   Donor:     hello@downtowncafe.com`);
  console.log(`   NGO:       admin@cityrescue.org`);
  console.log(`   Volunteer: sarah.volunteers@email.com`);

  // Seed multiple realistic donations
  const donations = await Promise.all([
    prisma.donation.create({ data: {
      donor_id: donor.id, food_type: '30x Biryani Trays', quantity: 30,
      expiry_time: new Date(Date.now() + 1000 * 60 * 60 * 3),
      pickup_lat: 40.7128, pickup_lng: -74.0060, status: 'pending'
    }}),
    prisma.donation.create({ data: {
      donor_id: donor.id, food_type: '20x Artisan Sandwiches', quantity: 20,
      expiry_time: new Date(Date.now() + 1000 * 60 * 60 * 5),
      pickup_lat: 40.7150, pickup_lng: -74.0100, status: 'pending'
    }}),
    prisma.donation.create({ data: {
      donor_id: donor.id, food_type: '50x Dal & Rice Packets', quantity: 50,
      expiry_time: new Date(Date.now() + 1000 * 60 * 60 * 2),
      pickup_lat: 40.7200, pickup_lng: -74.0050, status: 'pending'
    }}),
  ]);

  console.log(`✅ Seeded ${donations.length} pending donations`);
  console.log('🎉 Seeding complete!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
