-- Run this once in the Supabase SQL Editor to create customer profiles.
-- Supabase Auth stores credentials in auth.users; this table stores app profile data.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  email text not null,
  phone text,
  address text,
  role text not null default 'CUSTOMER' check (role in ('CUSTOMER', 'EMPLOYEE', 'ADMIN')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists address text;
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('SUPER_ADMIN', 'ADMIN', 'EMPLOYEE', 'CUSTOMER'));

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
  on public.profiles for select to authenticated using ((select auth.uid()) = id);
drop policy if exists "Users can update their own display name" on public.profiles;
create policy "Users can update their own display name"
  on public.profiles for update to authenticated using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, email, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', ''),
    new.email,
    new.raw_user_meta_data ->> 'phone'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.create_profile_for_new_user();

-- Create profiles for accounts that existed before this trigger was installed.
insert into public.profiles (id, display_name, email, phone)
select u.id, coalesce(u.raw_user_meta_data ->> 'display_name', ''), u.email,
       u.raw_user_meta_data ->> 'phone'
from auth.users u
on conflict (id) do nothing;

revoke update on public.profiles from authenticated;
grant select on public.profiles to authenticated;
grant update (display_name) on public.profiles to authenticated;

-- Roles are managed in profiles, not signup metadata. Bootstrap the first admin
-- manually from the SQL Editor, replacing the email with your own account:
-- update public.profiles set role = 'SUPER_ADMIN' where email = 'your-super-admin@email.com';
create or replace function public.current_brewluxe_role()
returns text language sql stable security definer set search_path = ''
as $$ select coalesce((select p.role from public.profiles p where p.id = auth.uid()), 'CUSTOMER') $$;
revoke all on function public.current_brewluxe_role() from public;
grant execute on function public.current_brewluxe_role() to authenticated;

create or replace function public.list_brewluxe_accounts()
returns table (id uuid, display_name text, email text, phone text, role text, created_at timestamptz)
language plpgsql stable security definer set search_path = ''
as $$
begin
  if public.current_brewluxe_role() <> 'SUPER_ADMIN' then
    raise exception 'Only a super admin can manage account roles.';
  end if;
  return query
    select p.id, p.display_name, p.email, p.phone, p.role, p.created_at
    from public.profiles p order by p.created_at desc;
end;
$$;
revoke all on function public.list_brewluxe_accounts() from public;
grant execute on function public.list_brewluxe_accounts() to authenticated;

create or replace function public.set_brewluxe_account_role(p_user_id uuid, p_role text)
returns void language plpgsql security definer set search_path = ''
as $$
begin
  if public.current_brewluxe_role() <> 'SUPER_ADMIN' then
    raise exception 'Only a super admin can manage account roles.';
  end if;
  if p_user_id = auth.uid() then
    raise exception 'You cannot change your own role.';
  end if;
  if p_role not in ('SUPER_ADMIN', 'ADMIN', 'EMPLOYEE', 'CUSTOMER') then
    raise exception 'Select a valid account role.';
  end if;
  update public.profiles set role = p_role, updated_at = now() where id = p_user_id;
  if not found then raise exception 'Account not found.'; end if;
end;
$$;
revoke all on function public.set_brewluxe_account_role(uuid,text) from public;
grant execute on function public.set_brewluxe_account_role(uuid,text) to authenticated;

create or replace function public.guard_employee_product_update()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  if public.current_brewluxe_role() = 'EMPLOYEE' and (
    new.id is distinct from old.id or new.name is distinct from old.name
    or new.category is distinct from old.category or new.price is distinct from old.price
    or new.description is distinct from old.description or new.image is distinct from old.image
    or new.featured is distinct from old.featured or new.created_at is distinct from old.created_at
  ) then raise exception 'Employees may only change product availability.'; end if;
  return new;
end;
$$;
create table if not exists public.products (
  id bigint generated by default as identity primary key,
  name text not null,
  category text not null,
  description text not null default '',
  price numeric(10,2) not null check (price >= 0),
  image text not null default '',
  featured boolean not null default false,
  available boolean not null default true,
  created_at timestamptz not null default now()
);
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'products' and column_name = 'id' and is_identity = 'YES'
  ) then
    alter table public.products alter column id add generated by default as identity;
  end if;
end;
$$;
alter table public.products enable row level security;
drop trigger if exists guard_employee_product_update on public.products;
create trigger guard_employee_product_update before update on public.products
  for each row execute procedure public.guard_employee_product_update();
drop policy if exists "Anyone can read available products" on public.products;
drop policy if exists "Staff can read all products" on public.products;
drop policy if exists "Admins can insert products" on public.products;
drop policy if exists "Admins and employees can update products" on public.products;
drop policy if exists "Admins can delete products" on public.products;
create policy "Anyone can read available products" on public.products
  for select to anon, authenticated using (available = true);
create policy "Staff can read all products" on public.products
  for select to authenticated using (public.current_brewluxe_role() in ('SUPER_ADMIN', 'ADMIN', 'EMPLOYEE'));
create policy "Admins can insert products" on public.products
  for insert to authenticated with check (public.current_brewluxe_role() in ('SUPER_ADMIN', 'ADMIN'));
create policy "Admins and employees can update products" on public.products
  for update to authenticated using (public.current_brewluxe_role() in ('SUPER_ADMIN', 'ADMIN', 'EMPLOYEE'))
  with check (public.current_brewluxe_role() in ('SUPER_ADMIN', 'ADMIN', 'EMPLOYEE'));
create policy "Admins can delete products" on public.products
  for delete to authenticated using (public.current_brewluxe_role() in ('SUPER_ADMIN', 'ADMIN'));
grant select, insert, update, delete on public.products to authenticated;
grant select on public.products to anon;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  customer_name text not null,
  phone text not null,
  address text not null,
  payment_method text not null check (payment_method in ('GCash', 'QR Payment', 'Cash on Delivery')),
  payment_reference text,
  subtotal numeric(10,2) not null check (subtotal >= 0),
  delivery_fee numeric(10,2) not null default 50 check (delivery_fee >= 0),
  total numeric(10,2) not null check (total >= 0),
  status text not null default 'Pending' check (status in ('Pending', 'Confirmed', 'Preparing', 'Ready', 'Out for delivery', 'Completed', 'Cancelled')),
  created_at timestamptz not null default now()
);
alter table public.orders enable row level security;
drop policy if exists "Customers can view their own orders" on public.orders;
create policy "Customers can view their own orders" on public.orders
  for select to authenticated using ((select auth.uid()) = user_id);
grant select on public.orders to authenticated;

create table if not exists public.order_items (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id bigint references public.products(id) on delete set null,
  product_name text not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(10,2) not null check (unit_price >= 0),
  size text not null default 'Regular',
  addons text[] not null default '{}'
);
alter table public.order_items enable row level security;
drop policy if exists "Customers can view items from their own orders" on public.order_items;
create policy "Customers can view items from their own orders" on public.order_items
  for select to authenticated using (exists (
    select 1 from public.orders o where o.id = order_id and o.user_id = (select auth.uid())
  ));
grant select on public.order_items to authenticated;

create or replace function public.create_brewluxe_order(
  p_customer_name text,
  p_phone text,
  p_address text,
  p_payment_method text,
  p_payment_reference text,
  p_items jsonb
) returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  v_order_id uuid;
  v_subtotal numeric(10,2) := 0;
  v_delivery_fee numeric(10,2) := 50;
  v_item jsonb;
  v_product public.products%rowtype;
  v_quantity integer;
  v_addons text[];
  v_unit_price numeric(10,2);
begin
  if auth.uid() is null then raise exception 'Please sign in before checking out.'; end if;
  if length(trim(p_customer_name)) < 2 or length(trim(p_phone)) < 7 or length(trim(p_address)) < 8 then
    raise exception 'Please provide valid delivery details.';
  end if;
  if p_payment_method not in ('GCash', 'QR Payment', 'Cash on Delivery') then
    raise exception 'Select a supported payment method.';
  end if;
  if p_payment_method in ('GCash', 'QR Payment') and coalesce(trim(p_payment_reference), '') = '' then
    raise exception 'Enter a payment reference for this demo payment.';
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Your cart is empty.';
  end if;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_quantity := (v_item ->> 'quantity')::integer;
    if v_quantity < 1 or v_quantity > 50 then raise exception 'Invalid item quantity.'; end if;
    if lower(coalesce(v_item ->> 'size', 'Regular')) not in ('regular', 'large') then raise exception 'Select a valid product size.'; end if;
    select coalesce(array_agg(value), '{}') into v_addons from jsonb_array_elements_text(coalesce(v_item -> 'addons', '[]'::jsonb));
    if exists (select 1 from unnest(v_addons) addon where addon not in ('Espresso Shot', 'Extra Whip', 'Pearls', 'Caramel Drizzle')) then
      raise exception 'Invalid product add-on.';
    end if;
    select * into v_product from public.products
      where id = (v_item ->> 'product_id')::bigint and available = true for share;
    if not found then raise exception 'A product in your cart is no longer available.'; end if;
    if v_product.category = 'Pastries' and lower(coalesce(v_item ->> 'size', 'Regular')) = 'large' then
      raise exception 'Pastries do not support size selection.';
    end if;
    v_unit_price := v_product.price + coalesce((select sum(case addon when 'Espresso Shot' then 20 when 'Extra Whip' then 15 else 15 end) from unnest(v_addons) addon), 0);
    if lower(coalesce(v_item ->> 'size', 'Regular')) = 'large' then
      v_unit_price := v_unit_price + 20;
    end if;
    v_subtotal := v_subtotal + (v_unit_price * v_quantity);
  end loop;

  insert into public.orders (user_id, customer_name, phone, address, payment_method,
    payment_reference, subtotal, delivery_fee, total)
  values (auth.uid(), trim(p_customer_name), trim(p_phone), trim(p_address), p_payment_method,
    nullif(trim(p_payment_reference), ''), v_subtotal, v_delivery_fee, v_subtotal + v_delivery_fee)
  returning id into v_order_id;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_quantity := (v_item ->> 'quantity')::integer;
    if lower(coalesce(v_item ->> 'size', 'Regular')) not in ('regular', 'large') then raise exception 'Select a valid product size.'; end if;
    select coalesce(array_agg(value), '{}') into v_addons from jsonb_array_elements_text(coalesce(v_item -> 'addons', '[]'::jsonb));
    select * into v_product from public.products where id = (v_item ->> 'product_id')::bigint;
    v_unit_price := v_product.price + coalesce((select sum(case addon when 'Espresso Shot' then 20 when 'Extra Whip' then 15 else 15 end) from unnest(v_addons) addon), 0);
    if lower(coalesce(v_item ->> 'size', 'Regular')) = 'large' then
      v_unit_price := v_unit_price + 20;
    end if;
    insert into public.order_items (order_id, product_id, product_name, quantity, unit_price, size, addons)
      values (v_order_id, v_product.id, v_product.name, v_quantity, v_unit_price, coalesce(v_item ->> 'size', 'Regular'), v_addons);
  end loop;
  return v_order_id;
end;
$$;
revoke all on function public.create_brewluxe_order(text,text,text,text,text,jsonb) from public;
grant execute on function public.create_brewluxe_order(text,text,text,text,text,jsonb) to authenticated;

create table if not exists public.contact_messages (
  id bigint generated always as identity primary key,
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  created_at timestamptz not null default now()
);
alter table public.contact_messages enable row level security;
drop policy if exists "Anyone can send a contact message" on public.contact_messages;
create policy "Anyone can send a contact message" on public.contact_messages
  for insert to anon, authenticated with check (
    length(trim(name)) between 2 and 100 and length(trim(subject)) between 2 and 150
    and length(trim(message)) between 10 and 5000
  );
grant insert on public.contact_messages to anon, authenticated;

-- Staff order queue, customer profile fields, and privileged audit history.
drop policy if exists "Users can update their own display name" on public.profiles;
create policy "Users can update their own profile fields"
  on public.profiles for update to authenticated using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);
revoke update on public.profiles from authenticated;
grant update (display_name, phone, address, updated_at) on public.profiles to authenticated;

drop policy if exists "Staff can view all orders" on public.orders;
create policy "Staff can view all orders" on public.orders for select to authenticated
  using (public.current_brewluxe_role() in ('EMPLOYEE', 'ADMIN', 'SUPER_ADMIN'));
drop policy if exists "Customers can view their own orders" on public.orders;
create policy "Customers can view their own orders" on public.orders for select to authenticated
  using ((select auth.uid()) = user_id);
drop policy if exists "Staff can view all order items" on public.order_items;
create policy "Staff can view all order items" on public.order_items for select to authenticated
  using (public.current_brewluxe_role() in ('EMPLOYEE', 'ADMIN', 'SUPER_ADMIN'));

create table if not exists public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid,
  actor_email text not null default '',
  action text not null,
  entity_type text not null,
  entity_id text not null default '',
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.audit_logs enable row level security;
drop policy if exists "Super admins can read audit logs" on public.audit_logs;
create policy "Super admins can read audit logs" on public.audit_logs for select to authenticated
  using (public.current_brewluxe_role() = 'SUPER_ADMIN');
grant select on public.audit_logs to authenticated;

create or replace function public.update_brewluxe_order_status(p_order_id uuid, p_status text)
returns void language plpgsql security definer set search_path = '' as $$
declare v_old text; v_email text;
begin
  if public.current_brewluxe_role() not in ('EMPLOYEE','ADMIN','SUPER_ADMIN') then
    raise exception 'Only staff can update order status.';
  end if;
  if p_status not in ('Confirmed','Preparing','Ready','Out for delivery','Completed','Cancelled') then
    raise exception 'Select a valid order status.';
  end if;
  select status into v_old from public.orders where id = p_order_id for update;
  if not found then raise exception 'Order not found.'; end if;
  if v_old in ('Completed','Cancelled') then raise exception 'This order is already closed.'; end if;
  if not (
    (v_old = 'Pending' and p_status in ('Confirmed','Cancelled')) or
    (v_old = 'Confirmed' and p_status in ('Preparing','Cancelled')) or
    (v_old = 'Preparing' and p_status = 'Ready') or
    (v_old = 'Ready' and p_status in ('Out for delivery','Completed')) or
    (v_old = 'Out for delivery' and p_status = 'Completed')
  ) then raise exception 'That order status transition is not allowed.'; end if;
  if (public.current_brewluxe_role() = 'EMPLOYEE' and p_status in ('Cancelled','Out for delivery')) then
    raise exception 'Only an admin can cancel or dispatch an order.';
  end if;
  update public.orders set status = p_status where id = p_order_id;
  select email into v_email from auth.users where id = auth.uid();
  insert into public.audit_logs(actor_id,actor_email,action,entity_type,entity_id,details)
    values(auth.uid(),coalesce(v_email,''),'order.status_changed','order',p_order_id::text,jsonb_build_object('from',v_old,'to',p_status));
end $$;
revoke all on function public.update_brewluxe_order_status(uuid,text) from public;
grant execute on function public.update_brewluxe_order_status(uuid,text) to authenticated;

-- Customers may cancel their own still-pending order. Keep the transition check
-- inside the database so cancellation cannot be forged from a client.
create or replace function public.cancel_brewluxe_customer_order(p_order_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'Please sign in to cancel an order.'; end if;
  update public.orders
    set status = 'Cancelled'
    where id = p_order_id and user_id = auth.uid() and status = 'Pending';
  if not found then
    raise exception 'This order cannot be cancelled. It may already be processing or may not belong to you.';
  end if;
end $$;
revoke all on function public.cancel_brewluxe_customer_order(uuid) from public;
grant execute on function public.cancel_brewluxe_customer_order(uuid) to authenticated;

create or replace function public.audit_account_role_change()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_email text; v_actor_email text;
begin
  if new.role is distinct from old.role then
    select email into v_email from auth.users where id = new.id;
    select email into v_actor_email from auth.users where id = auth.uid();
    insert into public.audit_logs(actor_id,actor_email,action,entity_type,entity_id,details)
      values(auth.uid(),coalesce(v_actor_email,''),'account.role_changed','account',new.id::text,
        jsonb_build_object('email',v_email,'from',old.role,'to',new.role));
  end if;
  return new;
end $$;
drop trigger if exists audit_account_role_change on public.profiles;
create trigger audit_account_role_change after update of role on public.profiles
  for each row execute procedure public.audit_account_role_change();

create or replace function public.list_brewluxe_staff_accounts()
returns table (id uuid, display_name text, email text, phone text, role text, created_at timestamptz)
language plpgsql stable security definer set search_path = '' as $$
begin
  if public.current_brewluxe_role() not in ('ADMIN','SUPER_ADMIN') then
    raise exception 'Only an admin can view staff accounts.';
  end if;
  return query select p.id,p.display_name,p.email,p.phone,p.role,p.created_at from public.profiles p
    where p.role in ('EMPLOYEE','ADMIN','SUPER_ADMIN') order by p.created_at desc;
end $$;
revoke all on function public.list_brewluxe_staff_accounts() from public;
grant execute on function public.list_brewluxe_staff_accounts() to authenticated;
