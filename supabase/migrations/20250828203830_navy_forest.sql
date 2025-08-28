/*
  # Create SEO reports table

  1. New Tables
    - `seo_reports`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `website_url` (text)
      - `score` (integer)
      - `positives` (text array)
      - `negatives` (text array)
      - `suggestions` (text array)
      - `report_data` (jsonb)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `seo_reports` table
    - Add policy for users to access their own reports
*/

-- Create seo_reports table
CREATE TABLE IF NOT EXISTS seo_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  website_url text NOT NULL,
  score integer NOT NULL DEFAULT 0,
  positives text[] DEFAULT '{}',
  negatives text[] DEFAULT '{}',
  suggestions text[] DEFAULT '{}',
  report_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE seo_reports ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own reports"
  ON seo_reports
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reports"
  ON seo_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reports"
  ON seo_reports
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reports"
  ON seo_reports
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_seo_reports_user_id ON seo_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_seo_reports_created_at ON seo_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_seo_reports_website_url ON seo_reports(website_url);