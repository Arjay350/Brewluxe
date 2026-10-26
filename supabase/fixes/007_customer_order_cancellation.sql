-- Allow a customer to cancel only their own Pending order.
-- Apply in Supabase SQL Editor after the base schema.
create or replace function public.cancel_brewluxe_customer_order(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Please sign in to cancel an order.';
  end if;

  update public.orders
  set status = 'Cancelled'
  where id = p_order_id
    and user_id = auth.uid()
    and status = 'Pending';

  if not found then
    raise exception 'This order cannot be cancelled. It may already be processing or may not belong to you.';
  end if;
end;
$$;

revoke all on function public.cancel_brewluxe_customer_order(uuid) from public;
grant execute on function public.cancel_brewluxe_customer_order(uuid) to authenticated;
