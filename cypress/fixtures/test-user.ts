export const TEST_USER = {
  id: 'test-user-id-123',
  email: 'teacher@test.com',
  name: 'Test Teacher',
  role: 'teacher' as const,
  trainerId: 1,
  password: 'testpassword123'
};

export const TEST_STUDENT = {
  id: 'test-student-id-456',
  email: 'student@test.com',
  name: 'Test Student',
  role: 'student' as const,
  password: 'testpassword123'
};