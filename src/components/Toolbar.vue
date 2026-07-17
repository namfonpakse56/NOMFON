<script setup>
import Icon from './Icon.vue'
defineProps({
  vals: { type: Object, required: true },
  pv: { type: Object, required: true }, // ຄ່າສະຫຼຸບຂອງໜ້າ "ຈ່າຍແລ້ວ"
})
defineEmits(['show-all', 'show-by-name', 'show-daily', 'show-paid', 'open-new'])

const TAB_BASE =
  'border:none;padding:9px 18px;border-radius:9px;font-size:13.5px;font-weight:700;cursor:pointer;transition:all .12s;'
const TAB_ON = TAB_BASE + 'background:#fff;color:#1f3a2e;box-shadow:0 1px 3px rgba(0,0,0,.12);'
const TAB_OFF = TAB_BASE + 'background:transparent;color:#6b6a62;'
</script>

<template>
  <div style="display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:18px">
    <div style="display:inline-flex;background:#e2ddd1;border-radius:12px;padding:4px;gap:2px;flex-wrap:wrap">
      <button :style="vals.isAll ? TAB_ON : TAB_OFF" @click="$emit('show-all')">
        <span style="display:inline-flex;align-items:center;gap:5px"><Icon name="table" :size="14" /> ຕາຕະລາງລວມ</span>
      </button>
      <button :style="vals.isNameList ? TAB_ON : TAB_OFF" @click="$emit('show-by-name')">
        <span style="display:inline-flex;align-items:center;gap:5px"><Icon name="users" :size="14" /> ແຍກຕາມລາຍຊື່</span>
      </button>
      <button :style="vals.isDaily ? TAB_ON : TAB_OFF" @click="$emit('show-daily')">
        <span style="display:inline-flex;align-items:center;gap:5px"><Icon name="coins" :size="14" /> ຈ່າຍລາຍວັນ</span>
      </button>
      <button :style="vals.isPaid ? TAB_ON : TAB_OFF" @click="$emit('show-paid')">
        <span style="display:inline-flex;align-items:center;gap:5px"><Icon name="check-circle" :size="14" /> ຈ່າຍແລ້ວ</span>
      </button>
    </div>
    <div style="display:flex;gap:10px;align-items:center">
      <div v-if="vals.isPaid" style="font-size:12.5px;color:#6b6a62;font-weight:500">
        ຈ່າຍແລ້ວ {{ pv.countStr }} ລາຍການ · {{ pv.peopleCountStr }} ຄົນ
      </div>
      <div v-else-if="vals.isDaily" style="font-size:12.5px;color:#6b6a62;font-weight:500">
        ຍັງບໍ່ຄົບ {{ vals.dailyCountStr }} ແຜນ
      </div>
      <div v-else style="font-size:12.5px;color:#6b6a62;font-weight:500">
        ຄ້າງຈ່າຍ {{ vals.countStr }} ລາຍການ
      </div>
      <button
        :style="'color:#fff;border:none;border-radius:10px;padding:11px 18px;font-size:13.5px;font-weight:700;cursor:pointer;box-shadow:0 2px 8px rgba(31,107,76,.28);display:inline-flex;align-items:center;gap:6px;background:' + vals.accent"
        @click="$emit('open-new')"
      >
        <Icon name="plus" :size="16" /> {{ vals.isDaily ? 'ເພີ່ມແຜນລາຍວັນ' : 'ເພີ່ມລາຍການກູ້' }}
      </button>
    </div>
  </div>
</template>
