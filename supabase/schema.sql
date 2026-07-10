-- ============================================================================
--  ລະບົບການກູ້ຢືມເງິນ / ระบบเงินกู้ — Supabase (PostgreSQL) schema
-- ----------------------------------------------------------------------------
--  โมเดลข้อมูลตรงกับแอป Vue (localStorage key: loanapp_v1)
--  วิธีใช้: เปิด Supabase → SQL Editor → วางไฟล์นี้ทั้งหมด → Run
-- ============================================================================

-- ตาราง loans = 1 แถว/1 รายการปล่อยกู้ -----------------------------------------
create table if not exists public.loans (
  id            uuid        primary key default gen_random_uuid(),

  borrow_date   date,                                  -- วันที่ปล่อยกู้  (เดิม borrowDate "D/M/YY")
  name          text        not null,                  -- ชื่อผู้กู้       (เดิม name)
  loan          bigint      not null default 0         -- ยอดปล่อยกู้ (กีบ) (เดิม loan)
                            check (loan >= 0),
  pay           bigint      not null default 0         -- ยอดต้องรับคืน (กีบ) (เดิม pay = loan × (1+pct))
                            check (pay >= 0),
  return_date   date,                                  -- วันครบกำหนด    (เดิม returnDate)
  paid          boolean     not null default false,    -- คืนแล้ว?        (เดิม paid)

  -- % ดอกเบี้ย — คำนวณอัตโนมัติจาก loan/pay (ตรงกับ pctOf() ในแอป)
  interest_pct  numeric(6,1) generated always as (
                  case when loan = 0 then 0
                       else round((pay::numeric / loan - 1) * 100, 1)
                  end
                ) stored,

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table  public.loans is 'รายการปล่อยกู้ · ดอกเบี้ย · การชำระคืน';
comment on column public.loans.interest_pct is 'อัตราดอกเบี้ย % คำนวณจาก loan/pay อัตโนมัติ';

-- ดัชนีสำหรับ filter/group ที่แอปใช้บ่อย ---------------------------------------
create index if not exists loans_name_idx        on public.loans (name);
create index if not exists loans_borrow_date_idx on public.loans (borrow_date);
create index if not exists loans_paid_idx        on public.loans (paid);

-- อัปเดต updated_at อัตโนมัติทุกครั้งที่แก้ไขแถว -------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists loans_set_updated_at on public.loans;
create trigger loans_set_updated_at
  before update on public.loans
  for each row execute function public.set_updated_at();

-- ============================================================================
--  VIEW: สรุปแยกตามรายชื่อ (ตรงกับหน้า "ແຍກຕາມລາຍຊື່" / ByNameView)
-- ============================================================================
create or replace view public.loans_by_person as
select
  name,
  count(*)                       as loan_count,
  sum(loan)                      as total_loan,
  sum(pay)                       as total_return,
  sum(pay) - sum(loan)           as total_profit,
  count(*) filter (where not paid) as pending_count,
  max(return_date)               as last_return_date
from public.loans
group by name
order by loan_count desc;

-- ============================================================================
--  Row Level Security (RLS)
-- ----------------------------------------------------------------------------
--  ค่าเริ่มต้น: อนุญาตให้ทุกคนที่มี anon key อ่าน/เขียนได้
--  (เข้ากับแอปปัจจุบันที่ยังไม่มีระบบล็อกอิน — เหมือน localStorage ที่ไม่มีการป้องกัน)
--
--  ⚠️  ถ้าเปิดใช้จริงแบบสาธารณะ ควรเปลี่ยนไปใช้แบบ "แยกตามผู้ใช้" ด้านล่างแทน
-- ============================================================================
alter table public.loans enable row level security;

drop policy if exists "loans_public_all" on public.loans;
create policy "loans_public_all"
  on public.loans
  for all
  to anon, authenticated
  using (true)
  with check (true);

-- ----------------------------------------------------------------------------
--  ทางเลือก (แนะนำสำหรับ production): แยกข้อมูลตามผู้ใช้ที่ล็อกอิน
--  วิธีใช้ — ลบ policy "loans_public_all" ข้างบน แล้วเอาคอมเมนต์บล็อกนี้ออก:
--
--  alter table public.loans
--    add column owner_id uuid not null default auth.uid()
--    references auth.users (id) on delete cascade;
--
--  create index loans_owner_idx on public.loans (owner_id);
--
--  create policy "loans_owner_select" on public.loans
--    for select to authenticated using (owner_id = auth.uid());
--  create policy "loans_owner_insert" on public.loans
--    for insert to authenticated with check (owner_id = auth.uid());
--  create policy "loans_owner_update" on public.loans
--    for update to authenticated
--    using (owner_id = auth.uid()) with check (owner_id = auth.uid());
--  create policy "loans_owner_delete" on public.loans
--    for delete to authenticated using (owner_id = auth.uid());
-- ----------------------------------------------------------------------------
