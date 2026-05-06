-- Add onboarding-related columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_source TEXT,
ADD COLUMN IF NOT EXISTS onboarding_goals TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS onboarding_level TEXT,
ADD COLUMN IF NOT EXISTS daily_goal INTEGER DEFAULT 10;

-- Update the coins default to 500 for new users
ALTER TABLE public.profiles ALTER COLUMN coins SET DEFAULT 500;
