<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { fetchLoans, insertLoan, updateLoan, deleteLoan, setPaid } from './supabase'
import {
  fetchDailyLoans,
  insertDailyLoan,
  updateDailyLoan,
  deleteDailyLoan,
  setDailyPaidDays,
} from './supabase'
import { parseDMY, toISO, fmt, fmt2, pctOf, parseNum, daysBetween, roundKip } from './helpers'
import AppHeader from './components/AppHeader.vue'
import Toolbar from './components/Toolbar.vue'
import DateFilter from './components/DateFilter.vue'
import CombinedTable from './components/CombinedTable.vue'
import ByNameView from './components/ByNameView.vue'
import DailyView from './components/DailyView.vue'
import FormModal from './components/FormModal.vue'
import DailyFormModal from './components/DailyFormModal.vue'
import Icon from './components/Icon.vue'

const props = defineProps({
  accentColor: { type: String, default: '#1f6b4c' },
  defaultPct: { type: Number, default: 20 },
})

// ---- state ----
const entries = ref(null)
const dailyEntries = ref(null) // แผนจ่ายรายวัน (daily_loans)
const view = ref('all') // 'all' | 'names' | 'daily'
const selectedName = ref(null)
const searchName = ref('') // ຄົ້ນຫາ ຊື່ຜູ້ກູ້ (ໃຊ້ຮ່ວມກັນທຸກໜ້າ)
const showForm = ref(false)
const formType = ref('lump') // 'lump' = จ่ายครั้งเดียว | 'daily' = จ่ายรายวัน
const editId = ref(null)
const dailyEditId = ref(null)
const start = ref('')
const end = ref('')
const loadError = ref('')
const saving = ref(false)
const isMobile = ref(false) // จอ ≤ 560px → แสดงเฉพาะฟอร์มกรอกข้อมูล
const toast = ref('') // ข้อความแจ้งเตือนชั่วคราว
let toastTimer = null
const form = reactive({ borrowDate: '', name: '', loan: '', pct: '', returnDate: '', paid: false })
const dailyForm = reactive({ startDate: '', name: '', loan: '', pct: '', returnDate: '' })

let mq = null
const onMqChange = (e) => {
  isMobile.value = e.matches
}

function showToast(msg) {
  toast.value = msg
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toast.value = ''), 2200)
}

// ---- โหลดຂໍ້ມູນຄັ້ງທຳອິດ ----
onMounted(async () => {
  mq = window.matchMedia('(max-width: 560px)')
  isMobile.value = mq.matches
  mq.addEventListener('change', onMqChange)
  try {
    entries.value = await fetchLoans()
  } catch (e) {
    console.error(e)
    loadError.value = 'Supabase: ' + (e?.message || e)
    entries.value = []
  }
  // โหลดแผนรายวันแยกต่างหาก — ถ้าตาราง daily_loans ยังไม่ถูกสร้าง แอปหลักยังใช้งานได้
  try {
    dailyEntries.value = await fetchDailyLoans()
  } catch (e) {
    console.warn('[daily_loans] ໂຫຼດບໍ່ໄດ້ (ຍังบໍ่ได้ run schema?):', e?.message || e)
    dailyEntries.value = []
  }
})

onBeforeUnmount(() => {
  mq?.removeEventListener('change', onMqChange)
  if (toastTimer) clearTimeout(toastTimer)
})

// ---- actions ----
function setField(k, v) {
  form[k] = v
}
function setDailyField(k, v) {
  dailyForm[k] = v
}

function resetLumpForm() {
  Object.assign(form, {
    borrowDate: '',
    name: '',
    loan: '',
    pct: String(props.defaultPct ?? 20),
    returnDate: '',
    paid: false,
  })
}
function resetDailyForm() {
  Object.assign(dailyForm, {
    startDate: '',
    name: '',
    loan: '',
    pct: String(props.defaultPct ?? 20),
    returnDate: '',
  })
}

function openNew() {
  editId.value = null
  dailyEditId.value = null
  // เปิดฟอร์มตามแท็บที่อยู่: แท็บรายวัน → เริ่มที่โหมดรายวัน
  formType.value = view.value === 'daily' ? 'daily' : 'lump'
  resetLumpForm()
  resetDailyForm()
  showForm.value = true
}

// สลับโหมดจ่าย (ครั้งเดียว ↔ รายวัน) — เฉพาะตอนเพิ่มรายการใหม่
function switchMode(t) {
  if (editId.value || dailyEditId.value) return
  formType.value = t
}

function openEdit(e) {
  editId.value = e.id
  dailyEditId.value = null
  formType.value = 'lump' // ບັງຄັບໃຫ້ເປີດຟอร์มແบບ "ຈ່າຍຄັ້ງດຽວ" — ກັນເປີດຜິດ modal ແລ້ວ insert ຊ້ຳ
  Object.assign(form, {
    borrowDate: e.borrowDate,
    name: e.name,
    loan: fmt(e.loan),
    pct: String(pctOf(e)),
    returnDate: e.returnDate,
    paid: e.paid,
  })
  showForm.value = true
}

function openDailyEdit(e) {
  dailyEditId.value = e.id
  editId.value = null
  formType.value = 'daily'
  Object.assign(dailyForm, {
    startDate: e.startDate,
    name: e.name,
    loan: e.loan ? fmt(e.loan) : '',
    pct: String(pctOf({ loan: e.loan, pay: e.pay })),
    returnDate: e.returnDate,
  })
  showForm.value = true
}

function closeForm() {
  showForm.value = false
  editId.value = null
  dailyEditId.value = null
}

async function saveForm() {
  if (saving.value) return // ກັນກົດ "ບັນທຶກ" ຊ້ຳ (double-tap) → insert ຊ້ຳ
  const loan = parseNum(form.loan)
  const pct = parseNum(form.pct)
  const pay = roundKip(loan * (1 + pct / 100)) // ປັດຂຶ້ນເປັນ 500 ກີບ
  if (!form.name.trim() || !loan) {
    closeForm()
    return
  }
  const rec = {
    borrowDate: form.borrowDate || '-',
    name: form.name.trim(),
    loan,
    pay,
    returnDate: form.returnDate || '-',
    paid: !!form.paid,
  }
  saving.value = true
  try {
    if (editId.value) {
      const saved = await updateLoan(editId.value, rec)
      entries.value = entries.value.map((e) => (e.id === editId.value ? saved : e))
    } else {
      const saved = await insertLoan(rec)
      entries.value = [...entries.value, saved]
    }
    showToast('ບັນທຶກຂໍ້ມູນສຳເລັດ')
    showForm.value = false
    editId.value = null
  } catch (e) {
    console.error(e)
    alert('ບັນທຶກບໍ່ໄດ້: ' + (e?.message || e))
  } finally {
    saving.value = false
  }
}

async function del(id) {
  const prev = entries.value
  entries.value = entries.value.filter((e) => e.id !== id)
  try {
    await deleteLoan(id)
  } catch (e) {
    console.error(e)
    alert('ລຶບບໍ່ໄດ້: ' + (e?.message || e))
    entries.value = prev
  }
}

async function toggle(id) {
  const cur = entries.value.find((e) => e.id === id)
  if (!cur) return
  const prev = entries.value
  const nextPaid = !cur.paid
  entries.value = entries.value.map((e) => (e.id === id ? { ...e, paid: nextPaid } : e))
  try {
    await setPaid(id, nextPaid)
  } catch (e) {
    console.error(e)
    alert('ອັບເດດສະຖານະບໍ່ໄດ້: ' + (e?.message || e))
    entries.value = prev
  }
}

// ---- daily actions ----
async function saveDailyForm() {
  if (saving.value) return // ກັນກົດ "ບັນທຶກ" ຊ້ຳ (double-tap) → insert ຊ້ຳ
  const loan = parseNum(dailyForm.loan)
  const pct = parseNum(dailyForm.pct)
  const pay = roundKip(loan * (1 + pct / 100)) // ยอดรวมที่ต้องรับคืน (ปัดขึ้น 500 กีบ)
  const days = daysBetween(dailyForm.startDate, dailyForm.returnDate) // auto จากช่วงวันที่
  const dailyAmount = days > 0 ? roundKip(pay / days) : 0 // auto ยอดจ่าย/วัน (ปัดขึ้น 500 กีบ)
  if (!dailyForm.name.trim() || !loan || !days) {
    // ต้องมีชื่อ + จำนวนเงิน + ช่วงวันที่ (วันเริ่ม→วันคืน) ที่ถูกต้อง
    alert('ກรุณากรอก ชื่อ, ຈຳນວນເງິນ ແລະ ວັນເລີ່ມ/ວັນຄືນ ໃຫ້ຄົບ')
    return
  }
  const rec = {
    startDate: dailyForm.startDate || '-',
    returnDate: dailyForm.returnDate || '-',
    name: dailyForm.name.trim(),
    loan,
    pay,
    dailyAmount,
    days,
  }
  saving.value = true
  try {
    if (dailyEditId.value) {
      // แก้ไข: ตัดวันที่ติ๊กไว้เกินจำนวนวันใหม่ออก
      const cur = dailyEntries.value.find((e) => e.id === dailyEditId.value)
      const paidDays = (cur?.paidDays || []).filter((n) => n <= days)
      const saved = await updateDailyLoan(dailyEditId.value, { ...rec, paidDays })
      dailyEntries.value = dailyEntries.value.map((e) => (e.id === dailyEditId.value ? saved : e))
    } else {
      const saved = await insertDailyLoan({ ...rec, paidDays: [] })
      dailyEntries.value = [...dailyEntries.value, saved]
    }
    showToast('ບັນທຶກຂໍ້ມູນສຳເລັດ')
    closeForm()
  } catch (e) {
    console.error(e)
    alert('ບັນທຶກບໍ່ໄດ້: ' + (e?.message || e))
  } finally {
    saving.value = false
  }
}

async function delDaily(id) {
  const prev = dailyEntries.value
  dailyEntries.value = dailyEntries.value.filter((e) => e.id !== id)
  try {
    await deleteDailyLoan(id)
  } catch (e) {
    console.error(e)
    alert('ລຶບບໍ່ໄດ້: ' + (e?.message || e))
    dailyEntries.value = prev
  }
}

// ติ๊ก/ยกเลิก การจ่ายของวันที่ n
async function toggleDailyDay(id, day) {
  const cur = dailyEntries.value.find((e) => e.id === id)
  if (!cur) return
  const prev = dailyEntries.value
  const set = new Set(cur.paidDays || [])
  if (set.has(day)) set.delete(day)
  else set.add(day)
  const nextPaid = [...set].sort((a, b) => a - b)
  dailyEntries.value = dailyEntries.value.map((e) => (e.id === id ? { ...e, paidDays: nextPaid } : e))
  try {
    await setDailyPaidDays(id, nextPaid)
  } catch (e) {
    console.error(e)
    alert('ອັບເດດບໍ່ໄດ້: ' + (e?.message || e))
    dailyEntries.value = prev
  }
}

// ---- tabs / filter handlers ----
function showAll() {
  view.value = 'all'
  selectedName.value = null
}
function showByName() {
  view.value = 'names'
  selectedName.value = null
}
function showDaily() {
  view.value = 'daily'
  selectedName.value = null
}
function onName(name) {
  view.value = 'names'
  selectedName.value = name
  searchName.value = name // ໃສ່ຊື່ໃນກ່ອງຄົ້ນຫາໃຫ້ອັດຕະໂນມັດ
}
function setToday() {
  const t = new Date()
  const iso = toISO(t)
  start.value = iso
  end.value = iso
}
function setMonth() {
  const t = new Date()
  start.value = toISO(new Date(t.getFullYear(), t.getMonth(), 1))
  end.value = toISO(new Date(t.getFullYear(), t.getMonth() + 1, 0))
}
function setYear() {
  const t = new Date()
  start.value = toISO(new Date(t.getFullYear(), 0, 1))
  end.value = toISO(new Date(t.getFullYear(), 11, 31))
}
function clearFilter() {
  start.value = ''
  end.value = ''
}

// ---- ຄ່າທີ່ຄິດໄລ່ (derived) ----
const vals = computed(() => {
  const accent = props.accentColor ?? '#1f6b4c'
  const allEntries = entries.value || []
  const q = (searchName.value || '').trim().toLowerCase()
  const sd = start.value ? new Date(start.value + 'T00:00:00') : null
  const ed = end.value ? new Date(end.value + 'T23:59:59') : null
  const filtered = allEntries.filter((e) => {
    if (q && !(e.name || '').toLowerCase().includes(q)) return false
    const d = parseDMY(e.borrowDate)
    if (!d) return true
    if (sd && d < sd) return false
    if (ed && d > ed) return false
    return true
  })
  const isFiltered = !!(sd || ed)
  const sumLoan = filtered.reduce((a, e) => a + e.loan, 0)
  const sumReturn = filtered.reduce((a, e) => a + e.pay, 0)
  const pending = filtered.filter((e) => !e.paid).length

  // ยอดของแผนรายวัน (กรองด้วยวันเริ่มเหมือนกัน) เพื่อรวมเข้ากับสรุปหัวเว็บ
  const dailyFiltered = (dailyEntries.value || []).filter((e) => {
    if (q && !(e.name || '').toLowerCase().includes(q)) return false
    const d = parseDMY(e.startDate)
    if (!d) return true
    if (sd && d < sd) return false
    if (ed && d > ed) return false
    return true
  })
  const dailyLoan = dailyFiltered.reduce((a, e) => a + (e.loan || 0), 0)
  const dailyReturn = dailyFiltered.reduce(
    (a, e) => a + (e.pay || (e.dailyAmount || 0) * (e.days || 0)),
    0,
  )
  // สรุปหัวเว็บ = เงินกู้ครั้งเดียว + เงินรายวัน
  const headLoan = sumLoan + dailyLoan
  const headReturn = sumReturn + dailyReturn

  const rows = filtered.map((e) => ({
    id: e.id,
    borrowDate: e.borrowDate,
    name: e.name,
    loanStr: fmt(e.loan),
    payStr: fmt(e.pay),
    pctStr: pctOf(e) + '%',
    returnDate: e.returnDate,
    paid: e.paid,
    notPaid: !e.paid,
    rowStyle:
      'border-bottom:1px solid rgba(0,0,0,.05);' + (e.paid ? 'background:#fcfdfc' : ''),
  }))

  // ຈັດກຸ່ມຕາມຊື່
  const map = {}
  filtered.forEach((e) => {
    ;(map[e.name] = map[e.name] || []).push(e)
  })
  const people = Object.keys(map)
    .map((name) => {
      const list = map[name]
      return {
        name,
        initial: name.replace(/^(ອ້າຍ|ເອື້ອຍ)/, '').trim().charAt(0) || name.charAt(0),
        countStr: list.length,
        loanStr: fmt(list.reduce((a, e) => a + e.loan, 0)),
        returnStr: fmt(list.reduce((a, e) => a + e.pay, 0)),
        multi: list.length > 1,
        loanTot2: fmt2(list.reduce((a, e) => a + e.loan, 0)),
        payTot2: fmt2(list.reduce((a, e) => a + e.pay, 0)),
        lastReturn: list.length ? list[list.length - 1].returnDate : '',
        rows: list.map((e) => ({
          borrowDate: e.borrowDate,
          name: e.name,
          loanStr: fmt2(e.loan),
          returnDate: e.returnDate,
          payStr: fmt2(e.pay),
          paid: e.paid,
          notPaid: !e.paid,
        })),
      }
    })
    .sort((a, b) => b.countStr - a.countStr)

  const computedPay = roundKip(parseNum(form.loan) * (1 + parseNum(form.pct) / 100)) // ปัดขึ้น 500 กีบ

  return {
    accent,
    accentSoft: '#8fd6b0',
    accentFaint: '#eef4ee',
    sumLoanStr: fmt(sumLoan),
    sumReturnStr: fmt(sumReturn),
    sumProfitStr: fmt(sumReturn - sumLoan),
    // สรุปหัวเว็บ = รวมเงินกู้ครั้งเดียว + เงินรายวัน
    headLoanStr: fmt(headLoan),
    headReturnStr: fmt(headReturn),
    headProfitStr: fmt(headReturn - headLoan),
    countStr: filtered.length,
    pendingStr: pending,
    isFiltered,
    isAll: view.value === 'all',
    isNameList: view.value === 'names',
    isDaily: view.value === 'daily',
    dailyCountStr: (dailyEntries.value || []).length,
    dailyPendingStr: (dailyEntries.value || []).filter(
      (e) => (e.paidDays || []).length < e.days,
    ).length,
    rows,
    people,
    computedPayStr: fmt(computedPay) + ' ກີບ',
  }
})

// ---- ຄ່າ derived ຂອງແຜນຈ່າຍລາຍວັນ ----
const dailyVals = computed(() => {
  const accent = props.accentColor ?? '#1f6b4c'
  const all = dailyEntries.value || []
  const q = (searchName.value || '').trim().toLowerCase()
  const sd = start.value ? new Date(start.value + 'T00:00:00') : null
  const ed = end.value ? new Date(end.value + 'T23:59:59') : null
  const filtered = all.filter((e) => {
    if (q && !(e.name || '').toLowerCase().includes(q)) return false
    const d = parseDMY(e.startDate)
    if (!d) return true
    if (sd && d < sd) return false
    if (ed && d > ed) return false
    return true
  })

  let sumTotal = 0
  let sumCollected = 0
  const byPerson = {} // ຈັດກຸ່ມແຜນຕາມຊື່
  const order = []
  filtered.forEach((e) => {
    const days = e.days || 0
    const daily = e.dailyAmount || 0
    // ยอดรวมจริง = pay (loan×(1+%)); เผื่อข้อมูลเก่าที่ยังไม่มี pay ใช้ daily×days แทน
    const total = e.pay || daily * days
    const paidSet = new Set(e.paidDays || [])
    const paidCount = [...paidSet].filter((n) => n >= 1 && n <= days).length
    const done = days > 0 && paidCount >= days
    // วันสุดท้ายเก็บเศษที่ปัดจากยอด/วัน → จ่ายครบ = ยอดรวมพอดี
    const collected = done ? total : daily * paidCount
    const remaining = total - collected
    sumTotal += total
    sumCollected += collected
    const plan = {
      id: e.id,
      name: e.name,
      startDate: e.startDate,
      returnDate: e.returnDate,
      days,
      loanStr: fmt(e.loan || 0),
      dailyStr: fmt(daily),
      totalStr: fmt(total) + ' ກີບ',
      collectedStr: fmt(collected) + ' ກີບ',
      remainingStr: fmt(remaining) + ' ກີບ',
      paidCount,
      progressPct: days ? Math.round((paidCount / days) * 100) : 0,
      done,
      // n = ลำดับวัน (ใช้กับ paidDays), label/dateStr = วันที่จริงตามปฏิทิน (เริ่ม + i วัน)
      dayCells: Array.from({ length: days }, (_, i) => {
        const base = parseDMY(e.startDate)
        const d = base ? new Date(base.getFullYear(), base.getMonth(), base.getDate() + i) : null
        return {
          n: i + 1,
          paid: paidSet.has(i + 1),
          label: d ? d.getDate() : i + 1,
          dateStr: d ? `${d.getDate()}/${d.getMonth() + 1}` : String(i + 1),
        }
      }),
    }
    let g = byPerson[e.name]
    if (!g) {
      g = byPerson[e.name] = {
        name: e.name,
        initial: e.name.replace(/^(ອ້າຍ|ເອື້ອຍ)/, '').trim().charAt(0) || e.name.charAt(0),
        loan: 0,
        total: 0,
        collected: 0,
        done: 0,
        plans: [],
      }
      order.push(g)
    }
    g.loan += e.loan || 0
    g.total += total
    g.collected += collected
    if (done) g.done += 1
    g.plans.push(plan)
  })

  // ການ์ດແຍກຕາມລາຍບຸກຄົນ — ຮຽງຕາມຊື່ (ຄงที่ ไม่ขยับเวลาติ๊กวัน)
  const people = order
    .map((g) => {
      const remaining = g.total - g.collected
      return {
        name: g.name,
        initial: g.initial,
        count: g.plans.length,
        doneCount: g.done,
        allDone: g.done >= g.plans.length,
        loanStr: fmt(g.loan) + ' ກີບ',
        totalStr: fmt(g.total) + ' ກີບ',
        collectedStr: fmt(g.collected) + ' ກີບ',
        remainingStr: fmt(remaining) + ' ກີບ',
        progressPct: g.total ? Math.round((g.collected / g.total) * 100) : 0,
        plans: g.plans,
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name))

  return {
    accent,
    people,
    sumTotalStr: fmt(sumTotal) + ' ກີບ',
    sumCollectedStr: fmt(sumCollected) + ' ກີບ',
    sumRemainingStr: fmt(sumTotal - sumCollected) + ' ກີບ',
  }
})

const title = computed(() => (editId.value ? 'ແກ້ໄຂລາຍການກູ້' : 'ເພີ່ມລາຍການກູ້ໃໝ່'))
const dailyTitle = computed(() =>
  dailyEditId.value ? 'ແກ້ໄຂແຜນຈ່າຍລາຍວັນ' : 'ເພີ່ມແຜນຈ່າຍລາຍວັນ',
)

// แจ้งเตือนรายการที่ถึง/เลยกำหนดคืนเงิน และยังไม่จ่าย
const dueAlertDismissed = ref(false)
const dueList = computed(() => {
  const endToday = new Date()
  endToday.setHours(23, 59, 59, 999)
  const startToday = new Date()
  startToday.setHours(0, 0, 0, 0)
  return (entries.value || [])
    .filter((e) => {
      if (e.paid) return false
      const d = parseDMY(e.returnDate)
      return d && d <= endToday // ถึงกำหนดวันนี้หรือเลยกำหนด
    })
    .map((e) => ({
      id: e.id,
      name: e.name,
      returnDate: e.returnDate,
      payStr: fmt(e.pay),
      overdue: parseDMY(e.returnDate) < startToday, // เลยกำหนด (ก่อนวันนี้)
    }))
})

function editById(id) {
  openEdit(entries.value.find((e) => e.id === id))
}
</script>

<template>
  <div style="min-height:100vh;padding:0 0 80px">
    <div
      v-if="toast"
      :style="'position:fixed;top:24px;left:50%;transform:translateX(-50%);z-index:60;color:#fff;padding:13px 24px;border-radius:999px;font-size:14px;font-weight:800;white-space:nowrap;display:inline-flex;align-items:center;gap:7px;border:2px solid rgba(255,255,255,.92);box-shadow:0 12px 34px rgba(0,0,0,.42);animation:pop .2s ease;background:' + vals.accent"
    >
      <Icon name="check" :size="17" /> {{ toast }}
    </div>

    <!-- แจ้งเตือนครบกำหนดคืนเงิน (มือถือ) -->
    <div
      v-if="isMobile && dueList.length && !dueAlertDismissed"
      style="position:fixed;inset:0;z-index:70;background:rgba(20,25,20,.55);backdrop-filter:blur(2px);display:flex;align-items:center;justify-content:center;padding:20px"
      @click="dueAlertDismissed = true"
    >
      <div
        style="background:#fff;border-radius:18px;width:100%;max-width:420px;overflow:hidden;box-shadow:0 24px 70px rgba(0,0,0,.4)"
        @click.stop
      >
        <div style="background:#c0392b;color:#fff;padding:16px 20px;font-size:15.5px;font-weight:800;display:flex;align-items:center;gap:8px">
          <Icon name="calendar" :size="18" /> ແຈ້ງເຕືອນ · ຄົບກຳນົດຄืນເງິນ ({{ dueList.length }})
        </div>
        <div style="padding:6px 8px;max-height:52vh;overflow-y:auto">
          <div
            v-for="e in dueList"
            :key="e.id"
            style="display:flex;justify-content:space-between;align-items:center;gap:10px;padding:11px 14px;border-bottom:1px solid rgba(0,0,0,.06)"
          >
            <div>
              <div style="font-weight:700;font-size:14.5px">{{ e.name }}</div>
              <div v-if="e.overdue" style="font-size:12px;color:#b0281a;font-weight:700">ເລີຍກຳນົດ · {{ e.returnDate }}</div>
              <div v-else style="font-size:12px;color:#8a6d1c;font-weight:700">ຄົບກຳນົດມື້ນີ້ · {{ e.returnDate }}</div>
            </div>
            <div style="font-weight:800;font-variant-numeric:tabular-nums;white-space:nowrap">{{ e.payStr }} ກີບ</div>
          </div>
        </div>
        <div style="padding:14px 20px;background:#f8f6f0;display:flex;justify-content:flex-end">
          <button
            :style="'border:none;color:#fff;border-radius:10px;padding:10px 24px;font-size:14px;font-weight:700;cursor:pointer;background:' + vals.accent"
            @click="dueAlertDismissed = true"
          >
            ຮັບຊາບ
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="loadError"
      style="max-width:1240px;margin:12px auto 0;padding:12px 40px;color:#b91c1c;font-weight:600;font-size:13.5px"
    >
      {{ loadError }}
    </div>
    <AppHeader class="dash-header" :vals="vals" />

    <div class="dash-wrap" style="max-width:1240px;margin:22px auto 0;padding:0 40px">
      <Toolbar
        :vals="vals"
        @show-all="showAll"
        @show-by-name="showByName"
        @show-daily="showDaily"
        @open-new="openNew"
      />

      <DateFilter
        :vals="vals"
        :start="start"
        :end="end"
        :search="searchName"
        @update-start="start = $event"
        @update-end="end = $event"
        @update-search="searchName = $event"
        @today="setToday"
        @month="setMonth"
        @year="setYear"
        @clear="clearFilter"
      />

      <CombinedTable
        v-if="vals.isAll"
        :vals="vals"
        @name="onName"
        @edit="editById"
        @delete="del"
        @toggle="toggle"
      />

      <ByNameView v-if="vals.isNameList" :vals="vals" :search="searchName" />

      <DailyView
        v-if="vals.isDaily"
        :dv="dailyVals"
        @new="openNew"
        @edit="openDailyEdit(dailyEntries.find((e) => e.id === $event))"
        @delete="delDaily"
        @toggle-day="toggleDailyDay"
      />
    </div>

    <FormModal
      v-if="showForm && formType === 'lump'"
      :vals="vals"
      :form="form"
      :title="title"
      :can-switch="!editId"
      :saving="saving"
      @field="setField"
      @save="saveForm"
      @close="closeForm"
      @switch="switchMode"
    />

    <DailyFormModal
      v-if="showForm && formType === 'daily'"
      :vals="vals"
      :form="dailyForm"
      :title="dailyTitle"
      :can-switch="!dailyEditId"
      :saving="saving"
      @field="setDailyField"
      @save="saveDailyForm"
      @close="closeForm"
      @switch="switchMode"
    />
  </div>
</template>

<style>
/* ลดขอบซ้าย-ขวาบนมือถือ ให้แดชบอร์ด/ตารางพอดีจอมากขึ้น (จอ ≤ 560px) */
@media (max-width: 560px) {
  .dash-header {
    padding-left: 16px !important;
    padding-right: 16px !important;
  }
  .dash-wrap {
    padding-left: 12px !important;
    padding-right: 12px !important;
  }
}
</style>
