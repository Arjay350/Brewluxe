-- Fix 005 Undo: Revert ban and delete functions

DROP FUNCTION IF EXISTS public.set_brewluxe_account_ban(uuid, boolean);
DROP FUNCTION IF EXISTS public.delete_brewluxe_account(uuid);

-- Restore original list_brewluxe_accounts without is_banned column
CREATE OR REPLACE FUNCTION public.list_brewluxe_accounts()
RETURNS TABLE (
  id uuid,
  display_name text,
  email text,
  phone text,
  role text,
  created_at timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF public.current_brewluxe_role() <> 'SUPER_ADMIN' THEN
    RAISE EXCEPTION 'Only a super admin can manage account roles.';
  END IF;

  RETURN QUERY
    SELECT p.id, p.display_name, p.email, p.phone, p.role, p.created_at
    FROM public.profiles p
    ORDER BY p.created_at DESC;
END;
$$;
