-- Migration: Add guest payment support
-- Split full_name into first_name and last_name, add is_guest flag

-- Add new columns to participants table
ALTER TABLE participants ADD COLUMN first_name TEXT;
ALTER TABLE participants ADD COLUMN last_name TEXT;
ALTER TABLE participants ADD COLUMN is_guest INTEGER DEFAULT 0; -- 0 = false, 1 = true

-- Update existing participants to split full_name (basic split on first space)
UPDATE participants 
SET 
  first_name = CASE 
    WHEN full_name LIKE '% %' THEN SUBSTR(full_name, 1, INSTR(full_name, ' ') - 1)
    ELSE full_name
  END,
  last_name = CASE 
    WHEN full_name LIKE '% %' THEN SUBSTR(full_name, INSTR(full_name, ' ') + 1)
    ELSE ''
  END
WHERE full_name IS NOT NULL;

-- Add payment_status to event_registrations for better tracking
ALTER TABLE event_registrations ADD COLUMN payment_status TEXT DEFAULT 'pending';

-- Update existing registrations to match current payment status
UPDATE event_registrations 
SET payment_status = CASE 
  WHEN paid_amount >= total_amount AND total_amount > 0 THEN 'paid'
  WHEN paid_amount > 0 THEN 'partial'
  ELSE 'pending'
END;