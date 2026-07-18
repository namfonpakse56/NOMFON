<script setup>
import Icon from './Icon.vue'

// ໜ້າ "ຈ່າຍແລ້ວ" — ລວມລາຍການທີ່ຈ່າຍຄົບແລ້ວ (ຈ່າຍຄັ້ງດຽວ + ແຜນລາຍວັນ) ຈັດກຸ່ມຕາມຊື່ດຽວກັນ
defineProps({
  pv: { type: Object, required: true },
  search: { type: String, default: '' },
})
// unpay = ຄືນສະຖານະລາຍການຈ່າຍຄັ້ງດຽວ · reopen-daily = ຄືນສະຖານະແຜນລາຍວັນ (ຍົກເລີກມື້ສຸດທ້າຍ)
// delete = ລຶບລາຍການຖາວອນ (ສົ່ງ id + isDaily ໄປແຍກ table ທີ່ App.vue)
defineEmits(['unpay', 'reopen-daily', 'delete'])

const TH = 'text-align:left;padding:11px 20px;font-size:12px;font-weight:700;color:#5a4a24'
const TH_R = 'text-align:right;padding:11px 20px;font-size:12px;font-weight:700;color:#5a4a24'
const TH_C = 'text-align:center;padding:11px 20px;font-size:12px;font-weight:700;color:#5a4a24'
</script>

<template>
  <div style="display:flex;flex-direction:column;gap:20px">
    <!-- ສະຫຼຸບລວມ -->
    <div
      v-if="pv.people.length"
      style="background:#fff;border:1px solid rgba(0,0,0,.07);border-radius:16px;padding:16px 22px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;box-shadow:0 1px 3px rgba(0,0,0,.05)"
    >
      <div :style="'display:flex;align-items:center;gap:9px;font-size:14px;font-weight:800;color:' + pv.accent">
        <Icon name="check-circle" :size="18" /> ຈ່າຍຄົບແລ້ວ {{ pv.countStr }} ລາຍການ · {{ pv.peopleCountStr }} ຄົນ
      </div>
      <div style="display:flex;gap:22px;flex-wrap:wrap">
        <div style="text-align:right">
          <div style="font-size:11px;color:#8a897f;font-weight:600">ຢືມລວມ</div>
          <div style="font-size:17px;font-weight:700;font-variant-numeric:tabular-nums">{{ pv.sumLoanStr }}</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:11px;color:#8a897f;font-weight:600">ຮັບຄືນລວມ</div>
          <div :style="'font-size:17px;font-weight:700;font-variant-numeric:tabular-nums;color:' + pv.accent">{{ pv.sumPayStr }}</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:11px;color:#8a897f;font-weight:600">ກຳໄລ</div>
          <div style="font-size:17px;font-weight:700;font-variant-numeric:tabular-nums;color:#155">{{ pv.sumProfitStr }}</div>
        </div>
      </div>
    </div>

    <!-- ບໍ່ພົບຜົນການຄົ້ນຫາ / ຍັງບໍ່ມີລາຍການທີ່ຈ່າຍແລ້ວ -->
    <div
      v-if="!pv.people.length"
      style="background:#fff;border:1px dashed rgba(0,0,0,.14);border-radius:16px;padding:36px 22px;text-align:center;color:#8a897f;font-size:14px;font-weight:600"
    >
      <template v-if="search">ບໍ່ພົບ "{{ search }}" ໃນລາຍການທີ່ຈ່າຍແລ້ວ</template>
      <template v-else>ຍັງບໍ່ມີລາຍການທີ່ຈ່າຍແລ້ວ</template>
    </div>

    <div
      v-for="p in pv.people"
      :key="p.key"
      style="background:#fff;border:1px solid rgba(0,0,0,.07);border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.05)"
    >
      <div style="padding:16px 22px;background:linear-gradient(180deg,#f2f7f3,#fff);border-bottom:1px solid rgba(0,0,0,.06);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px">
        <div style="display:flex;align-items:center;gap:13px">
          <div :style="'width:46px;height:46px;border-radius:13px;color:#fff;display:flex;align-items:center;justify-content:center;font-size:19px;font-weight:800;background:' + pv.accent">
            {{ p.initial }}
          </div>
          <div>
            <div style="font-size:18px;font-weight:800;display:flex;align-items:center;gap:7px">
              {{ p.name }}
              <span :style="'color:' + pv.accent + ';display:inline-flex'"><Icon name="check-circle" :size="16" /></span>
            </div>
            <div style="font-size:12px;color:#8a897f">
              ຈ່າຍແລ້ວ {{ p.countStr }} ລາຍການ
              <template v-if="p.lumpCount && p.dailyCount">· ຄັ້ງດຽວ {{ p.lumpCount }} · ລາຍວັນ {{ p.dailyCount }}</template>
            </div>
          </div>
        </div>
        <div style="display:flex;gap:22px;flex-wrap:wrap">
          <div style="text-align:right">
            <div style="font-size:11px;color:#8a897f;font-weight:600">ຢືມລວມ</div>
            <div style="font-size:17px;font-weight:700;font-variant-numeric:tabular-nums">{{ p.loanStr }}</div>
          </div>
          <div style="text-align:right">
            <div style="font-size:11px;color:#8a897f;font-weight:600">ຮັບຄືນລວມ</div>
            <div :style="'font-size:17px;font-weight:700;font-variant-numeric:tabular-nums;color:' + pv.accent">{{ p.payStr }}</div>
          </div>
          <div style="text-align:right">
            <div style="font-size:11px;color:#8a897f;font-weight:600">ກຳໄລ</div>
            <div style="font-size:17px;font-weight:700;font-variant-numeric:tabular-nums;color:#155">{{ p.profitStr }}</div>
          </div>
        </div>
      </div>
      <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse;min-width:680px">
          <thead>
            <tr style="background:#f6e6c6;border-bottom:1.5px solid #d9c497">
              <th :style="TH_C">ປະເພດ</th>
              <th :style="TH">ວັນທີເອົາ</th>
              <th :style="TH_R">ຈຳນວນຢືມ</th>
              <th :style="TH">ວັນທີສົ່ງ</th>
              <th :style="TH_R">ຈຳນວນສົ່ງລວມດອກ</th>
              <th :style="TH_C">ສະຖານະ</th>
              <th :style="TH_C">ຈັດການ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in p.rows" :key="r.key" style="border-bottom:1px solid rgba(0,0,0,.05)">
              <td style="padding:13px 20px;text-align:center">
                <span
                  v-if="r.isDaily"
                  style="background:#eef2fa;color:#3a5a8c;font-size:11.5px;font-weight:700;padding:4px 10px;border-radius:20px;white-space:nowrap"
                >ລາຍວັນ · {{ r.days }} ມື້</span>
                <span
                  v-else
                  style="background:#f6f1e6;color:#7a6428;font-size:11.5px;font-weight:700;padding:4px 10px;border-radius:20px;white-space:nowrap"
                >ຄັ້ງດຽວ · {{ r.pctStr }}</span>
              </td>
              <td style="padding:13px 20px;font-size:13px;font-variant-numeric:tabular-nums">{{ r.startDate }}</td>
              <td style="padding:13px 20px;font-size:13.5px;text-align:right;font-weight:600;font-variant-numeric:tabular-nums">{{ r.loanStr }}</td>
              <td style="padding:13px 20px;font-size:13px;font-variant-numeric:tabular-nums">{{ r.returnDate }}</td>
              <td style="padding:13px 20px;font-size:13.5px;text-align:right;font-weight:700;font-variant-numeric:tabular-nums;color:#155">{{ r.payStr }}</td>
              <td style="padding:13px 20px;text-align:center">
                <span style="background:#e7f2ea;color:#1f6b4c;font-size:11.5px;font-weight:700;padding:4px 10px;border-radius:20px;display:inline-flex;align-items:center;gap:4px">
                  <Icon name="check" :size="12" /> ຈ່າຍແລ້ວ
                </span>
              </td>
              <td style="padding:10px 20px;text-align:center">
                <div style="display:inline-flex;align-items:center;gap:8px">
                  <button
                    style="border:1px solid rgba(0,0,0,.12);background:#fff;border-radius:8px;height:30px;padding:0 11px;cursor:pointer;display:inline-flex;align-items:center;gap:5px;color:#7a6428;font-size:12px;font-weight:700"
                    :title="r.isDaily ? 'ຄືນສະຖານະ · ຍົກເລີກມື້ສຸດທ້າຍ ແລ້ວກັບໄປໜ້າຈ່າຍລາຍວັນ' : 'ຄືນສະຖານະ · ກັບໄປເປັນຄ້າງຈ່າຍ'"
                    @click="$emit(r.isDaily ? 'reopen-daily' : 'unpay', r.id)"
                  >
                    <Icon name="rotate" :size="13" /> ຄືນສະຖານະ
                  </button>
                  <button
                    style="border:1px solid rgba(179,73,47,.25);background:#fff;border-radius:8px;width:30px;height:30px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;color:#b3492f"
                    title="ລຶບຖາວອນ"
                    @click="$emit('delete', r.id, r.isDaily)"
                  >
                    <Icon name="trash" :size="15" />
                  </button>
                </div>
              </td>
            </tr>
            <tr style="background:#faf3e2;border-top:2px solid #d9c497;font-weight:800">
              <td style="padding:14px 20px;font-size:13.5px;font-weight:800;color:#5a4a24">ຍອດລວມ</td>
              <td></td>
              <td style="padding:14px 20px;font-size:14px;text-align:right;font-weight:800;font-variant-numeric:tabular-nums;color:#5a4a24">{{ p.loanTot2 }}</td>
              <td style="padding:14px 20px;font-size:13px;font-variant-numeric:tabular-nums;color:#5a4a24">{{ p.lastReturn }}</td>
              <td style="padding:14px 20px;font-size:14px;text-align:right;font-weight:800;font-variant-numeric:tabular-nums;color:#155">{{ p.payTot2 }}</td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
