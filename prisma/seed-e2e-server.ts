import { db } from '@/config';
import bcrypt from 'bcryptjs';
import { TEST_USER } from '../cypress/fixtures/test-user';

export { TEST_USER };

export function seedE2ETestData() {
  console.log('🌱 Seeding E2E test data...');
  
  try {
    // Clean up any existing test data first
    cleanupTestData();
    
    // Ensure cities table has test data
    console.log('📍 Inserting cities...');
    const citiesResult = db.prepare(`
      INSERT OR IGNORE INTO cities (slug, city)
      VALUES
      ('hamburg', 'Hamburg'),
      ('berlin', 'Berlin'),
      ('munchen', 'München'),
      ('koln', 'Köln'),
      ('frankfurt', 'Frankfurt')
    `).run();
    console.log(`   Cities inserted: ${citiesResult.changes} rows`);
    
    // Create test user
    console.log('👤 Creating test user...');
    const hashedPassword = bcrypt.hashSync('testpassword123', 10);
    
    const userResult = db.prepare(`
      INSERT INTO User (id, name, email, role, password_hash)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      TEST_USER.id,
      TEST_USER.name,
      TEST_USER.email,
      TEST_USER.role,
      hashedPassword
    );
    console.log(`   User inserted: ${userResult.changes} rows`);
    
    // Verify user was created
    const createdUser = db.prepare('SELECT id, email, name, role FROM User WHERE email = ?').get(TEST_USER.email);
    if (!createdUser) {
      throw new Error('User was not created successfully');
    }
    console.log(`   User verified: ${createdUser.email}`);
    
    // Create trainer profile for the test user
    console.log('🏃 Creating trainer profile...');
    const trainerResult = db.prepare(`
      INSERT INTO Trainers (trainer_id, first_name, last_name, email, slug)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      TEST_USER.trainerId,
      'Test',
      'Teacher',
      TEST_USER.email,
      'test-teacher'
    );
    console.log(`   Trainer inserted: ${trainerResult.changes} rows`);
    
    console.log('✅ E2E test data seeded successfully');
    console.log(`   User: ${TEST_USER.email}`);
    console.log(`   Trainer ID: ${TEST_USER.trainerId}`);
    console.log(`   Cities: Hamburg, Berlin, München, Köln, Frankfurt`);
    
  } catch (error) {
    console.error('❌ Error seeding E2E test data:', error);
    console.error('Error details:', error.message);
    throw error;
  }
}

export function cleanupTestData() {
  console.log('🧹 Cleaning up test data...');
  
  try {
    // Delete in correct order to respect foreign key constraints
    
    // Delete events created by test trainer
    db.prepare('DELETE FROM Events WHERE trainer_id = ?').run(TEST_USER.trainerId);
    
    // Delete test trainer
    db.prepare('DELETE FROM Trainers WHERE trainer_id = ?').run(TEST_USER.trainerId);
    
    // Delete test user sessions
    db.prepare('DELETE FROM Session WHERE userId = ?').run(TEST_USER.id);
    
    // Delete test user accounts
    db.prepare('DELETE FROM Account WHERE userId = ?').run(TEST_USER.id);
    
    // Delete test user
    db.prepare('DELETE FROM User WHERE id = ?').run(TEST_USER.id);
    
    console.log('✅ Test data cleaned up successfully');
    
  } catch (error) {
    console.error('❌ Error cleaning up test data:', error);
    // Don't throw error for cleanup failures
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedE2ETestData();
}