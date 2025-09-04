-- Create subgroups table in Supabase
CREATE TABLE IF NOT EXISTS subgroups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#3b82f6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_subgroups_user_id ON subgroups(user_id);

-- Enable Row Level Security
ALTER TABLE subgroups ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own subgroups" ON subgroups
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subgroups" ON subgroups
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subgroups" ON subgroups
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subgroups" ON subgroups
  FOR DELETE USING (auth.uid() = user_id);

-- Update the newnotes table to properly reference subgroups
-- First, ensure the subgroup_id column exists and is properly typed
ALTER TABLE newnotes ADD COLUMN IF NOT EXISTS subgroup_id UUID REFERENCES subgroups(id) ON DELETE SET NULL;

-- Create index for the foreign key
CREATE INDEX IF NOT EXISTS idx_newnotes_subgroup_id ON newnotes(subgroup_id);


-- second profiles
create table public.profiles (
  id uuid not null,
  email text not null,
  full_name text null,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint profiles_pkey primary key (id),
  constraint profiles_email_key unique (email),
  constraint profiles_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;