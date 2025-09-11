import { db } from '@/config';
import bcrypt from 'bcryptjs';
import { TEST_USER, TEST_STUDENT } from '../cypress/fixtures/test-user';

export { TEST_USER, TEST_STUDENT };

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
    
    // Create test users
    console.log('👤 Creating test users...');
    const hashedPassword = bcrypt.hashSync('testpassword123', 10);
    
    // Create teacher user
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
    console.log(`   Teacher user inserted: ${userResult.changes} rows`);
    
    // Create student user
    const studentResult = db.prepare(`
      INSERT INTO User (id, name, email, role, password_hash)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      TEST_STUDENT.id,
      TEST_STUDENT.name,
      TEST_STUDENT.email,
      TEST_STUDENT.role,
      hashedPassword
    );
    console.log(`   Student user inserted: ${studentResult.changes} rows`);
    
    // Verify users were created
    const createdUser = db.prepare('SELECT id, email, name, role FROM User WHERE email = ?').get(TEST_USER.email) as any;
    const createdStudent = db.prepare('SELECT id, email, name, role FROM User WHERE email = ?').get(TEST_STUDENT.email) as any;
    if (!createdUser || !createdStudent) {
      throw new Error('Users were not created successfully');
    }
    console.log(`   Teacher verified: ${createdUser.email}`);
    console.log(`   Student verified: ${createdStudent.email}`);
    
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
    
    // Create test events
    console.log('📅 Creating test events...');
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30); // 30 days from now
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 30); // 30 days ago
    
    const futureEventResult = db.prepare(`
      INSERT INTO Events (
        event_name, trainer_id, description, start_date, start_time, end_time,
        city_slug, slug, max_participants, price, active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'Future Yoga Workshop',
      TEST_USER.trainerId,
      'A wonderful yoga workshop for all levels',
      futureDate.toISOString().split('T')[0],
      '10:00:00',
      '11:30:00',
      'hamburg',
      'future-yoga-workshop',
      20,
      49.99,
      1
    );
    console.log(`   Future event inserted: ${futureEventResult.changes} rows`);
    
    const pastEventResult = db.prepare(`
      INSERT INTO Events (
        event_name, trainer_id, description, start_date, start_time, end_time,
        city_slug, slug, max_participants, price, active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'Past Yoga Workshop',
      TEST_USER.trainerId,
      'A past yoga workshop',
      pastDate.toISOString().split('T')[0],
      '10:00:00',
      '11:30:00',
      'berlin',
      'past-yoga-workshop',
      15,
      39.99,
      1
    );
    console.log(`   Past event inserted: ${pastEventResult.changes} rows`);
    
    console.log('✅ E2E test data seeded successfully');
    console.log(`   User: ${TEST_USER.email}`);
    console.log(`   Trainer ID: ${TEST_USER.trainerId}`);
    console.log(`   Cities: Hamburg, Berlin, München, Köln, Frankfurt`);
    console.log(`   Events: Future Yoga Workshop, Past Yoga Workshop`);
    
  } catch (error) {
    console.error('❌ Error seeding E2E test data:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
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
    db.prepare('DELETE FROM Session WHERE userId = ?').run(TEST_STUDENT.id);
    
    // Delete test user accounts
    db.prepare('DELETE FROM Account WHERE userId = ?').run(TEST_USER.id);
    db.prepare('DELETE FROM Account WHERE userId = ?').run(TEST_STUDENT.id);
    
    // Delete test users
    db.prepare('DELETE FROM User WHERE id = ?').run(TEST_USER.id);
    db.prepare('DELETE FROM User WHERE id = ?').run(TEST_STUDENT.id);
    
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