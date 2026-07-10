<script setup>
defineProps({
  vals: { type: Object, required: true },
  start: { type: String, default: '' },
  end: { type: String, default: '' },
})
defineEmits(['update-start', 'update-end', 'today', 'month', 'year', 'clear'])

const QUICK_BTN =
  'border:1px solid rgba(0,0,0,.14);background:#f7f5ef;border-radius:8px;padding:7px 13px;font-size:12.5px;font-weight:600;cursor:pointer;color:#3c3b35'
const DATE_INPUT =
  'border:1.5px solid rgba(0,0,0,.14);border-radius:9px;padding:7px 10px;font-size:13px;background:#fdfdfb;outline:none;font-family:inherit'
</script>

<template>
  <div style="background:#fff;border:1px solid rgba(0,0,0,.07);border-radius:14px;padding:13px 18px;margin-bottom:18px;display:flex;align-items:center;gap:14px;flex-wrap:wrap;box-shadow:0 1px 3px rgba(0,0,0,.05)">
    <span style="font-size:13px;font-weight:700;color:#3c3b35">ຊ່ວງວັນທີ່</span>
    <div style="display:flex;align-items:center;gap:9px">
      <label style="display:flex;align-items:center;gap:7px;font-size:12px;font-weight:600;color:#54534c">
        ເລີ່ມ
        <input type="date" :value="start" :style="DATE_INPUT" @change="$emit('update-start', $event.target.value)" />
      </label>
      <span style="color:#a6a59a">—</span>
      <label style="display:flex;align-items:center;gap:7px;font-size:12px;font-weight:600;color:#54534c">
        ຈົບ
        <input type="date" :value="end" :style="DATE_INPUT" @change="$emit('update-end', $event.target.value)" />
      </label>
    </div>
    <div style="display:flex;gap:7px;margin-left:auto;flex-wrap:wrap">
      <button :style="QUICK_BTN" @click="$emit('today')">ລາຍວັນ (ມື້ນີ້)</button>
      <button :style="QUICK_BTN" @click="$emit('month')">ລາຍເດືອນ</button>
      <button :style="QUICK_BTN" @click="$emit('year')">ລາຍປີ</button>
      <button
        v-if="vals.isFiltered"
        style="border:1px solid rgba(179,73,47,.3);background:#fff;border-radius:8px;padding:7px 13px;font-size:12.5px;font-weight:600;cursor:pointer;color:#b3492f"
        @click="$emit('clear')"
      >
        ລ້າງ ✕
      </button>
    </div>
  </div>
</template>
