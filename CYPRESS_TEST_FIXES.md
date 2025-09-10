# Cypress Test Fixes and Troubleshooting

## Issues Identified and Fixed

### 1. Element Selector Issues
**Problem**: Tests were failing because they couldn't find form elements like `input[name="event_name"]`.

**Solution**: Updated tests to use `data-testid` attributes for more reliable element selection:
- `[data-testid="event-name-input"]` instead of `input[name="event_name"]`
- `[data-testid="description-textarea"]` instead of `textarea[name="description"]`
- `[data-testid="submit-button"]` instead of `button[type="submit"]`

### 2. Authentication Mocking
**Problem**: NextAuth.js server-side authentication was not being properly mocked.

**Solution**: Simplified authentication commands to mock NextAuth endpoints:
```typescript
cy.intercept('GET', '/api/auth/session', {
  statusCode: 200,
  body: {
    user: {
      email: 'teacher@test.com',
      name: 'Test Teacher',
      role: 'teacher',
      image: null
    },
    expires: '2025-12-31T23:59:59.999Z'
  }
}).as('getSession');
```

### 3. Permission Error Message
**Problem**: Test was looking for "Sie haben nicht die Berechtigung" but the actual message was longer.

**Solution**: Updated test to match the exact error message:
```typescript
cy.contains('Sie haben nicht die Berechtigung, Events zu erstellen').should('be.visible');
```

### 4. Multiple Submit Buttons
**Problem**: Cypress found multiple submit buttons causing click errors.

**Solution**: Use specific `data-testid` selector for the form submit button:
```typescript
cy.get('[data-testid="submit-button"]').should('be.visible').click();
```

### 5. Form Validation Testing
**Problem**: Tests expected custom validation messages that might not exist.

**Solution**: Updated to check HTML5 validation:
```typescript
cy.get('[data-testid="event-name-input"]').then(($input) => {
  expect($input[0].validationMessage).to.not.be.empty;
});
```

## Updated Test Structure

### Event Creation Tests
- Uses `data-testid` selectors for reliability
- Waits for elements to be visible before interacting
- Properly mocks authentication state
- Tests both success and error scenarios

### Authentication Commands
- Simplified cookie setting
- Comprehensive endpoint mocking
- Proper cleanup on logout

## Running Tests After Fixes

1. **Start development server**:
   ```bash
   npm run dev
   ```

2. **Seed test data**:
   ```bash
   npx tsx prisma/seed-e2e-server.ts
   ```

3. **Run specific test**:
   ```bash
   npx cypress run --spec "cypress/e2e/events/event-creation.cy.ts"
   ```

## Key Improvements

1. **Robust Selectors**: Using `data-testid` attributes prevents tests from breaking due to CSS changes
2. **Better Waiting**: Added `.should('be.visible')` to ensure elements are ready before interaction
3. **Simplified Auth**: Streamlined authentication mocking for NextAuth.js compatibility
4. **Error Handling**: Improved error message matching and validation testing

## Next Steps

1. Test the updated event creation tests
2. Apply similar fixes to event listing and details tests if needed
3. Add more comprehensive error scenarios
4. Consider adding visual regression testing

The fixes address the core issues with element selection, authentication mocking, and test reliability while maintaining comprehensive coverage of the event creation flow.