/*
  # Fix existing Fan Wars schema

  This migration handles the existing database schema and ensures all required
  components are properly configured without conflicts.

  1. Tables
     - Ensures wars and comments tables exist with proper structure
     - Adds missing columns if needed
  
  2. Security
     - Drops and recreates RLS policies to avoid conflicts
     - Ensures proper anonymous access permissions
  
  3. Performance
     - Creates necessary indexes for optimal query performance
  
  4. Triggers
     - Sets up automatic comment counting functionality
  
  5. Sample Data
     - Adds initial cricket rivalry wars for testing
*/

-- Ensure tables exist with proper structure
CREATE TABLE IF NOT EXISTS wars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team1 text NOT NULL,
  team2 text NOT NULL,
  created_at timestamptz DEFAULT now(),
  total_comments integer DEFAULT 0
);

CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  war_id uuid NOT NULL REFERENCES wars(id) ON DELETE CASCADE,
  content text NOT NULL,
  votes integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Add missing columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wars' AND column_name = 'total_comments'
  ) THEN
    ALTER TABLE wars ADD COLUMN total_comments integer DEFAULT 0;
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE wars ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can read wars" ON wars;
DROP POLICY IF EXISTS "Anyone can create wars" ON wars;
DROP POLICY IF EXISTS "Anyone can view wars" ON wars;
DROP POLICY IF EXISTS "Anyone can read comments" ON comments;
DROP POLICY IF EXISTS "Anyone can create comments" ON comments;
DROP POLICY IF EXISTS "Anyone can view comments" ON comments;
DROP POLICY IF EXISTS "Anyone can update comment votes" ON comments;

-- Create fresh policies for anonymous access
CREATE POLICY "Anyone can view wars"
  ON wars
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create wars"
  ON wars
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can view comments"
  ON comments
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create comments"
  ON comments
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update comment votes"
  ON comments
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance (IF NOT EXISTS prevents conflicts)
CREATE INDEX IF NOT EXISTS wars_created_at_idx ON wars(created_at DESC);
CREATE INDEX IF NOT EXISTS wars_total_comments_idx ON wars(total_comments DESC);
CREATE INDEX IF NOT EXISTS comments_war_id_idx ON comments(war_id);
CREATE INDEX IF NOT EXISTS comments_created_at_idx ON comments(created_at DESC);
CREATE INDEX IF NOT EXISTS comments_votes_idx ON comments(votes DESC);

-- Function to update total_comments count
CREATE OR REPLACE FUNCTION update_war_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE wars SET total_comments = total_comments + 1 WHERE id = NEW.war_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE wars SET total_comments = total_comments - 1 WHERE id = OLD.war_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update comment counts
DROP TRIGGER IF EXISTS update_war_comments_trigger ON comments;
CREATE TRIGGER update_war_comments_trigger
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_war_comments_count();

-- Update existing wars to have correct comment counts
UPDATE wars SET total_comments = (
  SELECT COUNT(*) FROM comments WHERE comments.war_id = wars.id
);

-- Insert sample wars only if they don't exist
INSERT INTO wars (team1, team2) 
SELECT 'CSK', 'RCB'
WHERE NOT EXISTS (SELECT 1 FROM wars WHERE team1 = 'CSK' AND team2 = 'RCB');

INSERT INTO wars (team1, team2) 
SELECT 'MI', 'CSK'
WHERE NOT EXISTS (SELECT 1 FROM wars WHERE team1 = 'MI' AND team2 = 'CSK');

INSERT INTO wars (team1, team2) 
SELECT 'Virat Kohli', 'Rohit Sharma'
WHERE NOT EXISTS (SELECT 1 FROM wars WHERE team1 = 'Virat Kohli' AND team2 = 'Rohit Sharma');

INSERT INTO wars (team1, team2) 
SELECT 'RCB', 'KKR'
WHERE NOT EXISTS (SELECT 1 FROM wars WHERE team1 = 'RCB' AND team2 = 'KKR');

INSERT INTO wars (team1, team2) 
SELECT 'Dhoni', 'Virat'
WHERE NOT EXISTS (SELECT 1 FROM wars WHERE team1 = 'Dhoni' AND team2 = 'Virat');

INSERT INTO wars (team1, team2) 
SELECT 'Mumbai Indians', 'Delhi Capitals'
WHERE NOT EXISTS (SELECT 1 FROM wars WHERE team1 = 'Mumbai Indians' AND team2 = 'Delhi Capitals');