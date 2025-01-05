/*
  # Initial Schema Setup for LinkTree Clone

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key) - matches auth.users id
      - `username` (text, unique) - custom username for profile
      - `display_name` (text) - display name shown on profile
      - `avatar_url` (text) - profile picture URL
      - `bio` (text) - user's biography or description
      - `theme` (jsonb) - user's selected color theme for their profile
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `links`
      - `id` (uuid, primary key)
      - `profile_id` (uuid) - references profiles.id
      - `url` (text) - the actual URL
      - `title` (text) - custom title for the link
      - `display_order` (integer) - display order of links
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for CRUD operations
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  username text UNIQUE NOT NULL,
  display_name text,
  avatar_url text,
  bio text,
  theme jsonb DEFAULT '{"primary":"#FF6B6B","secondary":"#FFF3F3"}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add theme constraint
ALTER TABLE profiles
ADD CONSTRAINT valid_theme 
CHECK (
    (theme ? 'primary') AND 
    (theme ? 'secondary') AND 
    jsonb_typeof(theme->'primary') = 'string' AND 
    jsonb_typeof(theme->'secondary') = 'string'
);

-- Create links table
CREATE TABLE IF NOT EXISTS links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  url text NOT NULL,
  title text,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE links ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Links policies
CREATE POLICY "Public links are viewable by everyone"
  ON links FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own links"
  ON links FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update own links"
  ON links FOR UPDATE
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can delete own links"
  ON links FOR DELETE
  USING (auth.uid() = profile_id);

-- Add comments for documentation
COMMENT ON COLUMN profiles.bio IS 'User''s biography or description';
COMMENT ON COLUMN profiles.theme IS 'User''s selected color theme for their profile';