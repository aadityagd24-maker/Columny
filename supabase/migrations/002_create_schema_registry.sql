CREATE TABLE schema_registry (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  field_name TEXT UNIQUE NOT NULL,       -- e.g., "company", "action", "device_type"
  field_type TEXT NOT NULL DEFAULT 'text', -- text, number, date, boolean
  display_name TEXT,                      -- e.g., "Company Name"
  created_at TIMESTAMPTZ DEFAULT now()
);
