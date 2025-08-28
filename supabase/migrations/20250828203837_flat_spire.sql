/*
  # Create tracking codes table

  1. New Tables
    - `tracking_codes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `website_url` (text)
      - `code` (text, unique)
      - `is_active` (boolean)
      - `scan_frequency` (enum)
      - `last_scan` (timestamp)
      - `next_scan` (timestamp)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `tracking_codes` table
    - Add policy for users to manage their own tracking codes
*/

-- Create scan frequency enum
CREATE TYPE scan_frequency AS ENUM ('weekly', 'biweekly', 'monthly');

-- Create tracking_codes table
CREATE TABLE IF NOT EXISTS tracking_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  website_url text NOT NULL,
  code text UNIQUE NOT NULL,
  is_active boolean DEFAULT true,
  scan_frequency scan_frequency DEFAULT 'weekly',
  last_scan timestamptz DEFAULT now(),
  next_scan timestamptz DEFAULT (now() + interval '7 days'),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE tracking_codes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own tracking codes"
  ON tracking_codes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tracking codes"
  ON tracking_codes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tracking codes"
  ON tracking_codes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tracking codes"
  ON tracking_codes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tracking_codes_user_id ON tracking_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_tracking_codes_code ON tracking_codes(code);
CREATE INDEX IF NOT EXISTS idx_tracking_codes_next_scan ON tracking_codes(next_scan);