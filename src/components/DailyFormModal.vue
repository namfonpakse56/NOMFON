<script setup>
import { computed } from 'vue'
import DateField from './DateField.vue'
import Icon from './Icon.vue'
import { fmt, parseNum, daysBetween, roundKip } from '../helpers'

const props = defineProps({
  vals: { type: Object, required: true },
  form: { type: Object, required: true },
  title: { type: String, required: true },
  canSwitch: { type: Boolean, default: false },
  saving: { type: Boolean, default: false },
})
defineEmits(['field', 'save', 'close', 'switch'])

// ໃສ່ຈຸດ​ພັນ (comma) ໃຫ້ຕົວເລກຂະນະພິມ; ຫວ່າງ → ""
function fmtNum(v) {
  const digits = String(v).replace(/[^0-9]/g, '')
  return digits ? Number(digits).toLocaleString('en-US') : ''
}

// ---- คำนวณอัตโนมัติจาก เงินต้น + % + วันเริ่ม + วันคืน ----
const loan = computed(() => parseNum(props.form.loan))
const pct = computed(() => parseNum(props.form.pct))
const pay = computed(() => Math.round(loan.value * (1 + pct.value / 100))) // ยอดรวมที่ต้องรับคืน
const days = computed(() => daysBetween(props.form.startDate, props.form.returnDate))
// ปัดยอด/วัน ขึ้นเป็นทวีคูณของ 500 กีบ (เศษที่เหลือไปตกวันสุดท้าย)
const dailyAmount = computed(() => (days.value > 0 ? roundKip(pay.value / days.value) : 0))
const profit = computed(() => pay.value - loan.value)

const INPUT =
  'width:100%;border:1.5px solid rgba(0,0,0,.14);border-radius:10px;padding:10px 12px;font-size:14px;outline:none;background:#fdfdfb;font-variant-numeric:tabular-nums'
const LABEL_SPAN = 'display:block;font-size:12px;font-weight:600;color:#54534c;margin-bottom:6px'
const SEG = 'flex:1;border:none;padding:9px 12px;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;transition:all .12s'
const SEG_ON = SEG + ';background:#fff;color:#1f3a2e;box-shadow:0 1px 3px rgba(0,0,0,.14)'
const SEG_OFF = SEG + ';background:transparent;color:#6b6a62'
</script>

<template>
  <div
    class="fm-overlay"
    style="position:fixed;inset:0;background:rgba(20,25,20,.5);backdrop-filter:blur(3px);display:flex;align-items:flex-start;justify-content:center;padding:60px 20px;z-index:50;animation:fade .15s ease;overflow-y:auto"
    @click="$emit('close')"
  >
    <div
      class="fm-card"
      style="background:#fff;border-radius:20px;width:100%;max-width:480px;box-shadow:0 24px 70px rgba(0,0,0,.35);animation:pop .2s ease;overflow:hidden"
      @click.stop
    >
      <div class="fm-head" style="padding:20px 26px;border-bottom:1px solid rgba(0,0,0,.07);display:flex;align-items:center;justify-content:space-between">
        <div style="font-size:17px;font-weight:800;display:flex;align-items:center;gap:8px"><Icon name="coins" :size="18" /> {{ title }}</div>
        <button style="border:none;background:#f1efe8;width:32px;height:32px;border-radius:9px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;color:#54534c" @click="$emit('close')"><Icon name="x" :size="16" /></button>
      </div>

      <div class="fm-body" style="padding:22px 26px;display:flex;flex-direction:column;gap:16px">
        <div v-if="canSwitch">
          <span :style="LABEL_SPAN">ຮູບແບບການຈ່າຍ</span>
          <div style="display:flex;background:#eceae2;border-radius:11px;padding:4px;gap:3px">
            <button type="button" :style="SEG_OFF" @click="$emit('switch', 'lump')">ຈ່າຍຄັ້ງດຽວ</button>
            <button type="button" :style="SEG_ON">ຈ່າຍລາຍວັນ</button>
          </div>
        </div>

        <div class="fm-row" style="display:flex;gap:14px">
          <label style="flex:1;display:block">
            <span :style="LABEL_SPAN">ວັນເລີ່ມຈ່າຍ</span>
            <DateField :value="form.startDate" placeholder="09/07/2026" @update="$emit('field', 'startDate', $event)" />
          </label>
          <label style="flex:1;display:block">
            <span :style="LABEL_SPAN">ຊື່ຜູ້ກູ້</span>
            <input :value="form.name" :style="INPUT" placeholder="ຊື່..." @input="$emit('field', 'name', $event.target.value)" />
          </label>
        </div>

        <div class="fm-row" style="display:flex;gap:14px;align-items:flex-end">
          <label style="flex:1.4;display:block">
            <span :style="LABEL_SPAN">ຈຳນວນເງິນຢືມ (ກີບ)</span>
            <input :value="form.loan" :style="INPUT" inputmode="numeric" placeholder="1,000,000" @input="$emit('field', 'loan', fmtNum($event.target.value))" />
          </label>
          <label style="flex:1;display:block">
            <span :style="LABEL_SPAN">ເປີເຊັນ (%)</span>
            <input :value="form.pct" :style="INPUT" inputmode="decimal" placeholder="20" @input="$emit('field', 'pct', $event.target.value)" />
          </label>
        </div>

        <label style="display:block">
          <span :style="LABEL_SPAN">ວັນທີ່ຄືນ / ກຳນົດຈ່າຍ</span>
          <DateField :value="form.returnDate" placeholder="17/08/2026" @update="$emit('field', 'returnDate', $event)" />
        </label>

        <!-- ຄ່າທີ່ຄິດໄລ່ໃຫ້ອັດຕະໂນມັດ -->
        <div :style="'border:1px solid rgba(31,107,76,.18);border-radius:12px;padding:14px 16px;display:flex;flex-direction:column;gap:10px;background:' + vals.accentFaint">
          <div style="display:flex;align-items:center;justify-content:space-between">
            <div style="font-size:12.5px;font-weight:700;color:#1f6b4c">ຍອດຈ່າຍ/ວັນ (ອັດຕະໂນມັດ)</div>
            <div style="font-size:20px;font-weight:800;color:#155;font-variant-numeric:tabular-nums">{{ fmt(dailyAmount) }} ກີບ</div>
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;border-top:1px dashed rgba(31,107,76,.25);padding-top:9px;font-size:12.5px;color:#5a6b60">
            <span>ຈຳນວນວັນ</span>
            <span style="font-weight:700;color:#3c3b35;font-variant-numeric:tabular-nums">{{ days }} ວັນ</span>
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;font-size:12.5px;color:#5a6b60">
            <span>ຍອດລວມທີ່ຕ້ອງຮັບຄືນ</span>
            <span style="font-weight:700;color:#155;font-variant-numeric:tabular-nums">{{ fmt(pay) }} ກີບ</span>
          </div>
          <div v-if="loan > 0" style="display:flex;align-items:center;justify-content:space-between;font-size:12.5px;color:#5a6b60">
            <span>ກຳໄລ (ດອກເບ້ຍ)</span>
            <span style="font-weight:700;color:#1f6b4c;font-variant-numeric:tabular-nums">+{{ fmt(profit) }} ກີບ</span>
          </div>
        </div>
      </div>

      <div class="fm-foot" style="padding:16px 26px;background:#f8f6f0;border-top:1px solid rgba(0,0,0,.06);display:flex;gap:12px;justify-content:flex-end">
        <button style="border:1px solid rgba(0,0,0,.14);background:#fff;border-radius:10px;padding:11px 20px;font-size:13.5px;font-weight:600;cursor:pointer" @click="$emit('close')">ຍົກເລີກ</button>
        <button
          :disabled="saving"
          :style="'border:none;color:#fff;border-radius:10px;padding:11px 24px;font-size:13.5px;font-weight:700;box-shadow:0 2px 8px rgba(31,107,76,.28);background:' + vals.accent + (saving ? ';opacity:.6;cursor:default' : ';cursor:pointer')"
          @click="$emit('save')"
        >
          {{ saving ? 'ກຳລັງบັนທຶກ…' : 'ບັນທຶກ' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style>
@media (max-width: 560px) {
  .fm-overlay {
    padding: 10px !important;
    align-items: flex-start !important;
  }
  .fm-card {
    max-width: 100% !important;
    border-radius: 16px !important;
  }
  .fm-head,
  .fm-body,
  .fm-foot {
    padding-left: 16px !important;
    padding-right: 16px !important;
  }
  .fm-row {
    flex-direction: column !important;
    align-items: stretch !important;
    gap: 14px !important;
  }
  .fm-card input {
    font-size: 16px !important;
  }
}
</style>
