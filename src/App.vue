<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { fetchLoans, insertLoan, updateLoan, deleteLoan, setPaid } from './supabase'
import { parseDMY, toISO, fmt, fmt2, pctOf, parseNum } from './helpers'
import AppHeader from './components/AppHeader.vue'
import Toolbar from './components/Toolbar.vue'
import DateFilter from './components/DateFilter.vue'
import CombinedTable from './components/CombinedTable.vue'
import ByNameView from './components/ByNameView.vue'
import FormModal from './components/FormModal.vue'

const props = defineProps({
  accentColor: { type: String, default: '#1f6b4c' },
  defaultPct: { type: Number, default: 20 },
})

// ---- state ----
const entries = ref(null)
const view = ref('all') // 'all' | 'names'
const selectedName = ref(null)
const showForm = ref(false)
const editId = ref(null)
const start = ref('')
const end = ref('')
const loadError = ref('')
const saving = ref(false)
const isMobile = ref(false) // จอ ≤ 560px → แสดงเฉพาะฟอร์มกรอกข้อมูล
const toast = ref('') // ข้อความแจ้งเตือนชั่วคราว
let toastTimer = null
const form = reactive({ borrowDate: '', name: '', loan: '', pct: '', returnDate: '', paid: false })

let mq = null
const onMqChange = (e) => {
  isMobile.value = e.matches
  if (e.matches && !showForm.value) openNew() // สลับมามือถือ → เปิดฟอร์มให้
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
  if (isMobile.value) openNew() // มือถือ: โชว์ฟอร์มทันที · เดสก์ท็อป: โชว์แดชบอร์ด
  try {
    entries.value = await fetchLoans()
  } catch (e) {
    console.error(e)
    loadError.value = 'Supabase: ' + (e?.message || e)
    entries.value = []
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

function openNew() {
  editId.value = null
  Object.assign(form, {
    borrowDate: '',
    name: '',
    loan: '',
    pct: String(props.defaultPct ?? 20),
    returnDate: '',
    paid: false,
  })
  showForm.value = true
}

function openEdit(e) {
  editId.value = e.id
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

function closeForm() {
  if (isMobile.value) {
    openNew() // มือถือ: ไม่มีหน้าอื่นให้กลับ → เคลียร์ฟอร์มสำหรับกรอกรายการใหม่
    return
  }
  showForm.value = false
  editId.value = null
}

async function saveForm() {
  const loan = parseNum(form.loan)
  const pct = parseNum(form.pct)
  const pay = Math.round(loan * (1 + pct / 100))
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
    if (isMobile.value) {
      openNew() // มือถือ: เปิดฟอร์มเปล่าต่อสำหรับรายการถัดไป
    } else {
      showForm.value = false
      editId.value = null
    }
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

// ---- tabs / filter handlers ----
function showAll() {
  view.value = 'all'
  selectedName.value = null
}
function showByName() {
  view.value = 'names'
  selectedName.value = null
}
function onName(name) {
  view.value = 'names'
  selectedName.value = name
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
  const sd = start.value ? new Date(start.value + 'T00:00:00') : null
  const ed = end.value ? new Date(end.value + 'T23:59:59') : null
  const filtered = allEntries.filter((e) => {
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

  const computedPay = parseNum(form.loan) * (1 + parseNum(form.pct) / 100)

  return {
    accent,
    accentSoft: '#8fd6b0',
    accentFaint: '#eef4ee',
    sumLoanStr: fmt(sumLoan),
    sumReturnStr: fmt(sumReturn),
    sumProfitStr: fmt(sumReturn - sumLoan),
    countStr: filtered.length,
    pendingStr: pending,
    isFiltered,
    isAll: view.value === 'all',
    isNameList: view.value === 'names',
    rows,
    people,
    computedPayStr: fmt(computedPay) + ' ກີບ',
  }
})

const title = computed(() => (editId.value ? 'ແກ້ໄຂລາຍການກູ້' : 'ເພີ່ມລາຍການກູ້ໃໝ່'))

function editById(id) {
  openEdit(entries.value.find((e) => e.id === id))
}
</script>

<template>
  <div style="min-height:100vh;padding:0 0 80px">
    <div
      v-if="toast"
      :style="'position:fixed;top:24px;left:50%;transform:translateX(-50%);z-index:60;color:#fff;padding:13px 24px;border-radius:999px;font-size:14px;font-weight:800;white-space:nowrap;border:2px solid rgba(255,255,255,.92);box-shadow:0 12px 34px rgba(0,0,0,.42);animation:pop .2s ease;background:' + vals.accent"
    >
      ✓ {{ toast }}
    </div>
    <div
      v-if="loadError"
      style="max-width:1240px;margin:12px auto 0;padding:12px 40px;color:#b91c1c;font-weight:600;font-size:13.5px"
    >
      {{ loadError }}
    </div>
    <AppHeader v-if="!isMobile" :vals="vals" />

    <div v-if="!isMobile" style="max-width:1240px;margin:22px auto 0;padding:0 40px">
      <Toolbar
        :vals="vals"
        @show-all="showAll"
        @show-by-name="showByName"
        @open-new="openNew"
      />

      <DateFilter
        :vals="vals"
        :start="start"
        :end="end"
        @update-start="start = $event"
        @update-end="end = $event"
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

      <ByNameView v-if="vals.isNameList" :vals="vals" />
    </div>

    <FormModal
      v-if="showForm || isMobile"
      :vals="vals"
      :form="form"
      :title="title"
      @field="setField"
      @save="saveForm"
      @close="closeForm"
    />
  </div>
</template>
