-- Create profiles table for user data persistence
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  email TEXT,
  xp INTEGER DEFAULT 0,
  hearts INTEGER DEFAULT 5,
  max_hearts INTEGER DEFAULT 5,
  streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_lesson_date DATE,
  lessons_completed_today INTEGER DEFAULT 0,
  lessons_completed_today_date DATE,
  league TEXT DEFAULT 'bronze',
  league_xp INTEGER DEFAULT 0,
  gems INTEGER DEFAULT 0,
  coins INTEGER DEFAULT 100,
  completed_lessons TEXT[] DEFAULT '{}',
  current_section INTEGER DEFAULT 1,
  current_unit INTEGER DEFAULT 1,
  is_premium BOOLEAN DEFAULT FALSE,
  premium_until TIMESTAMPTZ,
  theme TEXT DEFAULT 'dark',
  notifications BOOLEAN DEFAULT TRUE,
  haptics BOOLEAN DEFAULT TRUE,
  achievements TEXT[] DEFAULT '{}',
  daily_challenges TEXT[] DEFAULT '{}',
  completed_challenges TEXT[] DEFAULT '{}',
  unlocked_avatars TEXT[] DEFAULT ARRAY['bull'],
  selected_avatar TEXT DEFAULT 'bull',
  opened_chests TEXT[] DEFAULT '{}',
  claimed_quests TEXT[] DEFAULT '{}',
  completed_onboarding BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_active TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "profiles_select_own" ON public.profiles 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles 
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_delete_own" ON public.profiles 
  FOR DELETE USING (auth.uid() = id);

-- Create trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'username', split_part(NEW.email, '@', 1)),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Drop existing trigger if exists and create new one
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
