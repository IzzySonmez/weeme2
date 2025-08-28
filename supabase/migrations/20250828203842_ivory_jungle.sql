/*
  # Create AI content table

  1. New Tables
    - `ai_content`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `platform` (enum: linkedin, instagram, twitter, facebook)
      - `prompt` (text)
      - `content` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `ai_content` table
    - Add policy for users to manage their own AI content
*/

-- Create platform enum
CREATE TYPE social_platform AS ENUM ('linkedin', 'instagram', 'twitter', 'facebook');

-- Create ai_content table
CREATE TABLE IF NOT EXISTS ai_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  platform social_platform NOT NULL,
  prompt text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE ai_content ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own AI content"
  ON ai_content
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own AI content"
  ON ai_content
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own AI content"
  ON ai_content
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_ai_content_user_id ON ai_content(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_content_platform ON ai_content(platform);
CREATE INDEX IF NOT EXISTS idx_ai_content_created_at ON ai_content(created_at DESC);