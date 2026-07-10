// เชื่อมต่อ Supabase + data layer ของตาราง loans
// แปลงวันที่ที่ขอบเขต: DB เก็บ ISO date ("YYYY-MM-DD") ↔ แอปใช้ "D/M/YY"
import { createClient } from '@supabase/supabase-js'
import { dmyToISO, isoToDMY } from './helpers'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!url || !key) {
  console.error(
    '[supabase] ຂາດ ENV — ກວດໄຟລ໌ .env: VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY',
  )
}

export const supabase = createClient(url, key)

const TABLE = 'loans'

// ---- row mapping: DB row <-> app entry (date: ISO <-> "D/M/YY", "-" ຖ້າຫວ່າง) ----
function fromRow(r) {
  return {
    id: r.id,
    borrowDate: isoToDMY(r.borrow_date) || '-',
    name: r.name,
    loan: r.loan,
    pay: r.pay,
    returnDate: isoToDMY(r.return_date) || '-',
    paid: r.paid,
  }
}
function toRow(rec) {
  return {
    borrow_date: dmyToISO(rec.borrowDate) || null,
    name: rec.name,
    loan: rec.loan,
    pay: rec.pay,
    return_date: dmyToISO(rec.returnDate) || null,
    paid: rec.paid,
  }
}

// ---- CRUD ----
export async function fetchLoans() {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('borrow_date', { ascending: true })
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data || []).map(fromRow)
}

export async function insertLoan(rec) {
  const { data, error } = await supabase.from(TABLE).insert(toRow(rec)).select().single()
  if (error) throw error
  return fromRow(data)
}

export async function updateLoan(id, rec) {
  const { data, error } = await supabase
    .from(TABLE)
    .update(toRow(rec))
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return fromRow(data)
}

export async function deleteLoan(id) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id)
  if (error) throw error
}

export async function setPaid(id, paid) {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ paid })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return fromRow(data)
}
