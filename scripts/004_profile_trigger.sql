-- Trigger to auto-create profile when user signs up
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
    display_name,
    avatar_id,
    xp,
    level,
    streak,
    current_streak,
    longest_streak,
    hearts,
    coins,
    gems,
    completed_lessons,
    unlocked_avatars,
    claimed_quests,
    opened_chests,
    is_premium,
    preferred_language
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    'bull',
    0,
    1,
    0,
    0,
    0,
    5,
    100,
    0,
    '[]'::jsonb,
    '["bull"]'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    false,
    'fr'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
