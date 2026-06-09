CREATE TABLE entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  raw_text TEXT NOT NULL,
  extracted_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- GIN index for fast JSONB queries
CREATE INDEX idx_entries_extracted_data ON entries USING GIN (extracted_data);
