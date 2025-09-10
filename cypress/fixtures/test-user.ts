export interface TestUser {
  id: string;
  email: string;
  name: string;
  role: string;
  trainerId: number;
}

export const TEST_USER: TestUser = {
  id: 'test-user-e2e-123',
  email: 'test-teacher@example.com',
  name: 'Test Teacher',
  role: 'teacher',
  trainerId: 999
};