# Teacher Master Data Extension Plan

## Current State Analysis

The current Trainer model in [`prisma/schema.prisma`](prisma/schema.prisma:93) contains basic personal information but lacks essential master data required for contracts and billing:

**Existing Trainer Fields:**
- `trainerId` - Primary key
- `firstName`, `lastName` - Personal names
- `email` - Contact email (unique)
- `phoneNumber` - Contact phone
- `bio` - Professional biography
- `link` - Website/profile link
- `slug` - URL identifier
- `avatarFileId` - Profile image reference

## Required Master Data Fields

### 1. Address Information (Essential for Contracts)
- `streetAddress` - Full street address
- `city` - City name
- `postalCode` - Postal/ZIP code  
- `country` - Country (default: "Germany")
- `addressVerified` - Boolean flag for address validation

### 2. Billing & Tax Information
- `taxId` - Tax identification number (Steuernummer)
- `vatId` - VAT identification number (USt-IdNr) - optional
- `billingEmail` - Separate email for invoices
- `paymentTerms` - Payment terms (e.g., "net 30")

### 3. Bank Account Details
- `bankName` - Bank institution name
- `iban` - International Bank Account Number
- `bic` - Bank Identifier Code
- `accountHolder` - Name on bank account

### 4. Company/Professional Details
- `companyName` - Legal business name
- `companyRegistration` - Commercial register number
- `legalForm` - Business legal structure (e.g., "Einzelunternehmer", "GmbH")
- `professionalTitle` - Professional qualification titles

## Database Schema Options

### Option 1: Extend Existing Trainer Model
```prisma
model Trainer {
  // Existing fields...
  streetAddress   String?
  city            String?
  postalCode      String?
  country         String?   @default("Germany")
  taxId           String?
  vatId           String?
  billingEmail    String?
  bankName        String?
  iban            String?
  bic             String?
  accountHolder   String?
  companyName     String?
  companyRegistration String?
  legalForm       String?
  professionalTitle String?
  addressVerified Boolean   @default(false)
}
```

### Option 2: Create Separate BillingDetails Table
```prisma
model BillingDetails {
  id                  Int     @id @default(autoincrement())
  trainerId           Int     @unique
  streetAddress       String?
  city                String?
  postalCode          String?
  country             String? @default("Germany")
  taxId               String?
  vatId               String?
  billingEmail        String?
  bankName            String?
  iban                String?
  bic                 String?
  accountHolder       String?
  companyName         String?
  companyRegistration String?
  legalForm           String?
  professionalTitle   String?
  addressVerified     Boolean @default(false)
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  
  trainer Trainer @relation(fields: [trainerId], references: [trainerId])
  
  @@map("billing_details")
}
```

**Recommendation:** Option 2 (Separate table) is preferred because:
- Better data organization and separation of concerns
- Easier to maintain and extend
- Clear audit trail with createdAt/updatedAt
- Optional relationship (not all trainers need billing details)

## Form Design & UI Structure

### New Component: `BillingDetailsForm`
Location: [`src/app/profil/_components/BillingDetailsForm.tsx`](src/app/profil/_components/BillingDetailsForm.tsx:1)

**Form Sections:**
1. **Address Information** - Required for contracts
2. **Company Details** - Professional/legal information  
3. **Bank Information** - Payment processing
4. **Tax Information** - Compliance requirements

**UI Design Principles:**
- Use same styling as existing [`EditProfileForm`](src/app/profil/_components/EditProfileForm.tsx:1)
- Progressive disclosure for optional fields
- Validation indicators for required fields
- Save/cancel functionality per section

### Integration with Profile Page
Modify [`src/app/profil/page.tsx`](src/app/profil/page.tsx:37) to include:

```tsx
// Add new import
import BillingDetailsForm from "./_components/BillingDetailsForm";

// In the return statement, add new section
<div className="bg-white rounded-lg p-6 mt-6">
  <h2 className="text-xl font-light mb-4">Rechnungsdaten & Vertragsinformationen</h2>
  <BillingDetailsForm trainer={trainerData} />
</div>
```

## API & Data Handling

### Server Actions
Create new server actions in [`src/lib/actions.ts`](src/lib/actions.ts:1) (or appropriate location):

```typescript
export async function updateBillingDetails(formData: FormData) {
  // Validate and update billing details
  // Handle both create and update scenarios
}

export async function validateAddress(addressData: any) {
  // Optional: Integrate with address validation service
}
```

### Validation Requirements
- **IBAN Validation**: Format and checksum validation
- **Tax ID Validation**: Country-specific format validation
- **Required Fields**: streetAddress, city, postalCode, country, taxId
- **Data Encryption**: Sensitive fields like IBAN should be encrypted

## Implementation Steps

### Phase 1: Database Migration
1. Create Prisma migration for new BillingDetails model
2. Add relationship to Trainer model
3. Run migration and update Prisma client

### Phase 2: Backend Implementation
1. Create server actions for CRUD operations
2. Implement validation logic
3. Add encryption for sensitive data

### Phase 3: Frontend Implementation
1. Create BillingDetailsForm component
2. Integrate with profile page
3. Add form validation and error handling
4. Implement save/load functionality

### Phase 4: Testing & Validation
1. Test form submission and data persistence
2. Validate encryption and security
3. Test edge cases and error scenarios

## Security Considerations

- Encrypt sensitive fields (IBAN, BIC, tax numbers) at rest
- Implement proper access controls
- Add audit logging for changes to billing data
- Regular security reviews of financial data handling

## Timeline Estimate

- **Database Changes**: 2-4 hours
- **Backend Implementation**: 4-6 hours  
- **Frontend Implementation**: 6-8 hours
- **Testing & Validation**: 4-6 hours
- **Total**: 16-24 hours

## Next Steps

1. Confirm database approach (Option 1 vs Option 2)
2. Finalize field requirements
3. Begin implementation with database migration
4. Implement backend functionality
5. Build and integrate frontend components

This plan provides a comprehensive foundation for extending the teacher database with essential master data for contracts and billing operations.