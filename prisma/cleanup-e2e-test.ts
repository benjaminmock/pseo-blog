import { cleanupTestData } from './seed-e2e-test';

// Run cleanup if this file is executed directly
if (require.main === module) {
  try {
    cleanupTestData();
    console.log('✅ E2E test cleanup completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ E2E test cleanup failed:', error);
    process.exit(1);
  }
}