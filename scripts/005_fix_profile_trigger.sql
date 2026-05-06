-- Fix trigger to match actual database schema
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    username,
    email,
    selected_avatar,
    xp,
    streak,
    longest_streak,
    hearts,
    max_hearts,
    coins,
    gems,
    league,
    league_xp,
    current_section,
    current_unit,
    completed_lessons,
    unlocked_avatars,
    claimed_quests,
    opened_chests,
    achievements,
    daily_challenges,
    completed_challenges,
    is_premium,
    theme,
    notifications,
    haptics,
    completed_onboarding,
    lessons_completed_today,
    created_at,
    last_active
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)),
    new.email,
    'bull',
    0,
    0,
    0,
    5,
    5,
    500,
    0,
    'bronze',
    0,
    1,
    1,
    ARRAY[]::text[],
    ARRAY['bull']::text[],
    ARRAY[]::text[],
    ARRAY[]::text[],
    ARRAY[]::text[],
    ARRAY[]::text[],
    ARRAY[]::text[],
    false,
    'dark',
    true,
    true,
    false,
    0,
    now(),
    now()
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- Recreate trigger
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
