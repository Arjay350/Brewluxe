-- Fix 005: Account Ban and Delete Capabilities
-- Allows Super Admins & Admins to ban or permanently delete accounts with audit logging.

-- 1. Add is_banned column to public.profiles if it doesn't already exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_banned boolean NOT NULL DEFAULT false;

-- 2. Update list_brewluxe_accounts to return is_banned status
CREATE OR REPLACE FUNCTION public.list_brewluxe_accounts()
RETURNS TABLE (
  id uuid,
  display_name text,
  email text,
  phone text,
  role text,
  is_banned boolean,
  created_at timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF public.current_brewluxe_role() NOT IN ('SUPER_ADMIN', 'ADMIN') THEN
    RAISE EXCEPTION 'Only administrators can manage accounts.';
  END IF;

  RETURN QUERY
    SELECT
      p.id,
      p.display_name,
      p.email,
      p.phone,
      p.role,
      COALESCE(p.is_banned, false) AS is_banned,
      p.created_at
    FROM public.profiles p
    ORDER BY p.created_at DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.list_brewluxe_accounts() FROM public;
GRANT EXECUTE ON FUNCTION public.list_brewluxe_accounts() TO authenticated;

-- 3. Stored function to Ban or Unban an account
CREATE OR REPLACE FUNCTION public.set_brewluxe_account_ban(
  p_user_id uuid,
  p_banned boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_email text;
  v_role text;
  v_actor_email text;
BEGIN
  IF public.current_brewluxe_role() NOT IN ('SUPER_ADMIN', 'ADMIN') THEN
    RAISE EXCEPTION 'Only administrators can ban or unban accounts.';
  END IF;

  IF p_user_id = auth.uid() THEN
    RAISE EXCEPTION 'You cannot ban your own account.';
  END IF;

  SELECT email, role INTO v_email, v_role
  FROM public.profiles
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Account not found.';
  END IF;

  IF v_role = 'SUPER_ADMIN' AND public.current_brewluxe_role() <> 'SUPER_ADMIN' THEN
    RAISE EXCEPTION 'Only a super admin can ban administrative accounts.';
  END IF;

  -- Update is_banned flag on profile
  UPDATE public.profiles
  SET is_banned = p_banned, updated_at = now()
  WHERE id = p_user_id;

  -- Set or remove ban on auth.users directly
  IF p_banned THEN
    UPDATE auth.users
    SET banned_until = '3000-01-01 00:00:00+00'::timestamptz
    WHERE id = p_user_id;
  ELSE
    UPDATE auth.users
    SET banned_until = NULL
    WHERE id = p_user_id;
  END IF;

  -- Record action in audit log
  SELECT email INTO v_actor_email FROM auth.users WHERE id = auth.uid();
  INSERT INTO public.audit_logs(actor_id, actor_email, action, entity_type, entity_id, details)
  VALUES (
    auth.uid(),
    COALESCE(v_actor_email, ''),
    CASE WHEN p_banned THEN 'account.banned' ELSE 'account.unbanned' END,
    'account',
    p_user_id::text,
    jsonb_build_object('email', v_email, 'is_banned', p_banned)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.set_brewluxe_account_ban(uuid, boolean) FROM public;
GRANT EXECUTE ON FUNCTION public.set_brewluxe_account_ban(uuid, boolean) TO authenticated;

-- 4. Stored function to Permanently Delete an account
CREATE OR REPLACE FUNCTION public.delete_brewluxe_account(
  p_user_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_email text;
  v_role text;
  v_actor_email text;
BEGIN
  IF public.current_brewluxe_role() NOT IN ('SUPER_ADMIN', 'ADMIN') THEN
    RAISE EXCEPTION 'Only administrators can delete accounts.';
  END IF;

  IF p_user_id = auth.uid() THEN
    RAISE EXCEPTION 'You cannot delete your own account.';
  END IF;

  SELECT email, role INTO v_email, v_role
  FROM public.profiles
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Account not found.';
  END IF;

  IF v_role = 'SUPER_ADMIN' AND public.current_brewluxe_role() <> 'SUPER_ADMIN' THEN
    RAISE EXCEPTION 'Only a super admin can delete administrative accounts.';
  END IF;

  -- Delete from auth.users (cascades to profiles & orders via FK cascade)
  DELETE FROM auth.users WHERE id = p_user_id;
  DELETE FROM public.profiles WHERE id = p_user_id;

  -- Record action in audit log
  SELECT email INTO v_actor_email FROM auth.users WHERE id = auth.uid();
  INSERT INTO public.audit_logs(actor_id, actor_email, action, entity_type, entity_id, details)
  VALUES (
    auth.uid(),
    COALESCE(v_actor_email, ''),
    'account.deleted',
    'account',
    p_user_id::text,
    jsonb_build_object('email', v_email, 'role', v_role)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.delete_brewluxe_account(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.delete_brewluxe_account(uuid) TO authenticated;
