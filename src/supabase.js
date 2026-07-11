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

// ---- daily_loans: แผนผ่อนรายวัน (จ่ายทีละวัน) --------------------------------
const DAILY_TABLE = 'daily_loans'

function fromDailyRow(r) {
  return {
    id: r.id,
    startDate: isoToDMY(r.start_date) || '-',
    returnDate: isoToDMY(r.return_date) || '-',
    name: r.name,
    loan: r.loan || 0,
    pay: r.pay || 0,
    dailyAmount: r.daily_amount || 0,
    days: r.days || 0,
    paidDays: Array.isArray(r.paid_days) ? r.paid_days : [],
  }
}
function toDailyRow(rec) {
  return {
    start_date: dmyToISO(rec.startDate) || null,
    return_date: dmyToISO(rec.returnDate) || null,
    name: rec.name,
    loan: rec.loan || 0,
    pay: rec.pay || 0,
    daily_amount: rec.dailyAmount || 0,
    days: rec.days || 0,
    paid_days: Array.isArray(rec.paidDays) ? rec.paidDays : [],
  }
}

export async function fetchDailyLoans() {
  const { data, error } = await supabase
    .from(DAILY_TABLE)
    .select('*')
    .order('start_date', { ascending: true })
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data || []).map(fromDailyRow)
}

export async function insertDailyLoan(rec) {
  const { data, error } = await supabase
    .from(DAILY_TABLE)
    .insert(toDailyRow(rec))
    .select()
    .single()
  if (error) throw error
  return fromDailyRow(data)
}

export async function updateDailyLoan(id, rec) {
  const { data, error } = await supabase
    .from(DAILY_TABLE)
    .update(toDailyRow(rec))
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return fromDailyRow(data)
}

export async function deleteDailyLoan(id) {
  const { error } = await supabase.from(DAILY_TABLE).delete().eq('id', id)
  if (error) throw error
}

// อัปเดตเฉพาะรายการวันที่จ่ายแล้ว (ติ๊ก/ยกเลิกทีละวัน)
export async function setDailyPaidDays(id, paidDays) {
  const { data, error } = await supabase
    .from(DAILY_TABLE)
    .update({ paid_days: paidDays })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return fromDailyRow(data)
}
