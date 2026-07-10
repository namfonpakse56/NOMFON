<script setup>
// ຊ່ອງວັນທີ່: ສະແດງ D/M/YYYY (ວັນ/ເດືອນ/ປີ) ແຕ່ຍັງເລືອກຈາກປະຕິທິນ native ໄດ້
// - ຂ້າງໃນເກັບຄ່າເປັນ "D/M/YY" (ຮูปແບບເກົ່າຂອງແອป) ຜ່ານ prop value / event update
// - date input ໂປ່ງໃສ ວາງທັບໄວ້ຂ້າງເທິງ ເພື່ອເປີດປະຕິທິນເມື່ອຄລິກ
import { computed } from 'vue'
import { parseDMY, toISO, isoToDMY } from '../helpers'

const props = defineProps({
  value: { type: String, default: '' }, // "D/M/YY"
  placeholder: { type: String, default: 'ວ/ດ/ປ' },
})
const emit = defineEmits(['update'])

// "9/7/26" -> "09/07/2026" (ສະແດງ, ເຕີມ 0 ນຳໜ້າ)
const pad = (n) => String(n).padStart(2, '0')
const display = computed(() => {
  const d = parseDMY(props.value)
  return d ? `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}` : ''
})
// "9/7/26" -> "2026-07-09" (ໃຫ້ native date input)
const iso = computed(() => {
  const d = parseDMY(props.value)
  return d ? toISO(d) : ''
})

function onPick(e) {
  emit('update', isoToDMY(e.target.value)) // ISO -> "D/M/YY"
}
function openPicker(e) {
  try {
    e.target.showPicker?.()
  } catch (_) {
    /* ignore — เบราว์เซอร์เก่าจะใช้ native ปกติ */
  }
}

const VISIBLE =
  'width:100%;border:1.5px solid rgba(0,0,0,.14);border-radius:10px;padding:10px 12px;font-size:14px;outline:none;background:#fdfdfb;font-variant-numeric:tabular-nums;cursor:pointer'
const OVERLAY =
  'position:absolute;inset:0;width:100%;height:100%;margin:0;padding:0;border:0;opacity:0;cursor:pointer;z-index:2'
</script>

<template>
  <div style="position:relative;width:100%">
    <input :value="display" :placeholder="placeholder" readonly :style="VISIBLE" />
    <input
      type="date"
      :value="iso"
      :style="OVERLAY"
      @input="onPick"
      @click="openPicker"
    />
  </div>
</template>
