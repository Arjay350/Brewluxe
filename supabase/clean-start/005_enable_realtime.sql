-- ==============================================================================
-- 005_enable_realtime.sql
-- Enables Supabase Realtime for the public.orders table.
-- Allows the staff queue (/staff/orders) and customer order tracker to receive
-- instant live status updates without manual browser refresh.
-- ==============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  END IF;
END $$;

-- Verification check: Verify orders table is in the realtime publication
SELECT pubname, schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' AND tablename = 'orders';
