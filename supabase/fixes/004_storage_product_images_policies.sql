-- Fix 004: Storage policies for product-images bucket
-- Ensures public read access and restricts uploads/deletes to ADMIN and SUPER_ADMIN.

-- Ensure bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Ensure RLS is enabled on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 1. Public Read Policy
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
CREATE POLICY "Public can view product images" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'product-images');

-- 2. Admin & Super Admin Upload (INSERT) Policy
DROP POLICY IF EXISTS "Staff can upload product images" ON storage.objects;
CREATE POLICY "Staff can upload product images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'product-images'
    AND public.current_brewluxe_role() IN ('ADMIN', 'SUPER_ADMIN')
  );

-- 3. Admin & Super Admin Update Policy
DROP POLICY IF EXISTS "Staff can update product images" ON storage.objects;
CREATE POLICY "Staff can update product images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'product-images'
    AND public.current_brewluxe_role() IN ('ADMIN', 'SUPER_ADMIN')
  );

-- 4. Admin & Super Admin Delete Policy
DROP POLICY IF EXISTS "Staff can delete product images" ON storage.objects;
CREATE POLICY "Staff can delete product images" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'product-images'
    AND public.current_brewluxe_role() IN ('ADMIN', 'SUPER_ADMIN')
  );
