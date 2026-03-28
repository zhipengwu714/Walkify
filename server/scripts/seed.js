import { db } from '../db/index.js';
import { seedRestrooms } from './seed-restrooms.js';
import { seedPedestrianCounts } from './seed-pedestrian.js';
import { seedSafetyData } from './seed-safety.js';

async function seed() {
  console.log('Starting data seed...\n');

  try {
    console.log('=== Seeding Restrooms ===');
    await seedRestrooms();

    console.log('\n=== Seeding Pedestrian Counts ===');
    await seedPedestrianCounts();

    console.log('\n=== Seeding Safety Data ===');
    await seedSafetyData();

    console.log('\nAll data seeded successfully!');
  } catch (err) {
    console.error('Seed failed:', err);
  } finally {
    db.close();
  }
}

seed();
