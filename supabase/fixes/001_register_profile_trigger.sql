-- Fix 001: Harden create_profile_for_new_user trigger on auth.users
-- Purpose: Ensure new accounts always receive the 'CUSTOMER' role and gracefully handle conflicts without failing signups.

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, email, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', ''),
    new.email,
    new.raw_user_meta_data ->> 'phone',
    'CUSTOMER'
  )
  on conflict (id) do update set
    display_name = excluded.display_name,
    email = excluded.email,
    phone = coalesce(excluded.phone, public.profiles.phone);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.create_profile_for_new_user();
