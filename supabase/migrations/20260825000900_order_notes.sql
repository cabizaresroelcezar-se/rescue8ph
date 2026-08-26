-- ============================================================================
-- MIGRATION: order notes (admin conversation thread)
-- ============================================================================
-- A per-order timeline of notes from staff (and optionally the customer).
-- Internal-only by default — never exposed on storefront.
--
-- Use cases:
-- - Customer service: "Spoke with customer on the phone, requested
--   rush shipping because emergency preparedness class next week."
-- - Ops coordination: "Inventory confirmed for warehouse B."
-- - Audit trail: who said what, when, on each order.
--
-- This is DIFFERENT from orders.internal_notes (a single freeform
-- text column on orders) and orders.customer_notes (set at checkout).
-- order_notes is an append-only conversation thread.
-- ============================================================================

-- Enum for note visibility (must exist before table)
do $$ begin
  if not exists (
    select 1 from pg_type where typname = 'note_visibility'
  ) then
    create type note_visibility as enum ('INTERNAL', 'CUSTOMER_VISIBLE');
  end if;
end $$;

create table if not exists public.order_notes (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete restrict,
  -- Visibility: INTERNAL = staff only, CUSTOMER_VISIBLE = also shown to
  -- the order's customer (future-facing: will surface in /account/orders/[id])
  visibility note_visibility not null default 'INTERNAL',
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_order_notes_order_created
  on public.order_notes(order_id, created_at desc);

create index if not exists idx_order_notes_author
  on public.order_notes(author_id);

do $$ begin
  if not exists (
    select 1 from pg_constraint where conname = 'order_notes_body_length'
  ) then
    alter table public.order_notes
      add constraint order_notes_body_length
      check (char_length(body) between 1 and 4000);
  end if;
end $$;

drop trigger if exists order_notes_set_updated_at on public.order_notes;
create trigger order_notes_set_updated_at
  before update on public.order_notes
  for each row execute function public.set_updated_at();

-- ============================================================================
-- RLS
-- ============================================================================
alter table public.order_notes enable row level security;

-- Staff can read all notes
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'order_notes'
      and policyname = 'Staff can read all order notes'
  ) then
    create policy "Staff can read all order notes"
      on public.order_notes for select
      to authenticated
      using (private.is_staff());
  end if;
end $$;

-- Customers can read notes flagged CUSTOMER_VISIBLE on their own orders
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'order_notes'
      and policyname = 'Customers can read customer-visible notes on their orders'
  ) then
    create policy "Customers can read customer-visible notes on their orders"
      on public.order_notes for select
      to authenticated
      using (
        visibility = 'CUSTOMER_VISIBLE'
        and exists (
          select 1 from public.orders o
          where o.id = order_notes.order_id and o.user_id = auth.uid()
        )
      );
  end if;
end $$;

-- Staff can add notes (must check permission for write)
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'order_notes'
      and policyname = 'Staff can add order notes'
  ) then
    create policy "Staff can add order notes"
      on public.order_notes for insert
      to authenticated
      with check (
        author_id = auth.uid()
        and private.has_permission('ORDER_UPDATE')
      );
  end if;
end $$;

-- Staff can edit their own notes (within 5 minutes, so they can fix typos)
-- implemented at app layer via server action (RLS doesn't have time-window
-- predicates cleanly). RLS lets any staff update their own row.
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'order_notes'
      and policyname = 'Staff can update their own order notes'
  ) then
    create policy "Staff can update their own order notes"
      on public.order_notes for update
      to authenticated
      using (author_id = auth.uid() and private.is_staff())
      with check (author_id = auth.uid() and private.is_staff());
  end if;
end $$;

-- Staff can delete their own notes (within edit window) OR any note
-- if they have ORDER_DELETE permission (for compliance takedown)
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'order_notes'
      and policyname = 'Staff can delete order notes'
  ) then
    create policy "Staff can delete order notes"
      on public.order_notes for delete
      to authenticated
      using (
        author_id = auth.uid()
        or private.has_permission('ORDER_DELETE')
      );
  end if;
end $$;