<script setup>
defineProps({ vals: { type: Object, required: true } })

const TH = 'text-align:left;padding:11px 20px;font-size:12px;font-weight:700;color:#5a4a24'
const TH_R = 'text-align:right;padding:11px 20px;font-size:12px;font-weight:700;color:#5a4a24'
const TH_C = 'text-align:center;padding:11px 20px;font-size:12px;font-weight:700;color:#5a4a24'
</script>

<template>
  <div style="display:flex;flex-direction:column;gap:20px">
    <div
      v-for="p in vals.people"
      :key="p.name"
      style="background:#fff;border:1px solid rgba(0,0,0,.07);border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.05)"
    >
      <div style="padding:16px 22px;background:linear-gradient(180deg,#f6f4ee,#fff);border-bottom:1px solid rgba(0,0,0,.06);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px">
        <div style="display:flex;align-items:center;gap:13px">
          <div :style="'width:46px;height:46px;border-radius:13px;color:#fff;display:flex;align-items:center;justify-content:center;font-size:19px;font-weight:800;background:' + vals.accent">
            {{ p.initial }}
          </div>
          <div>
            <div style="font-size:18px;font-weight:800">{{ p.name }}</div>
            <div style="font-size:12px;color:#8a897f">{{ p.countStr }} ລາຍການກູ້ຢືມ</div>
          </div>
        </div>
        <div style="display:flex;gap:22px">
          <div style="text-align:right">
            <div style="font-size:11px;color:#8a897f;font-weight:600">ຢືມລວມ</div>
            <div style="font-size:17px;font-weight:700;font-variant-numeric:tabular-nums">{{ p.loanStr }}</div>
          </div>
          <div style="text-align:right">
            <div style="font-size:11px;color:#8a897f;font-weight:600">ຕ້ອງຈ່າຍລວມ</div>
            <div style="font-size:17px;font-weight:700;font-variant-numeric:tabular-nums;color:#1f6b4c">{{ p.returnStr }}</div>
          </div>
        </div>
      </div>
      <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse;min-width:640px">
          <thead>
            <tr style="background:#f6e6c6;border-bottom:1.5px solid #d9c497">
              <th :style="TH">ວັນທີເອົາ</th>
              <th :style="TH">ລາຍຊື່</th>
              <th :style="TH_R">ຈຳນວນຢືມ</th>
              <th :style="TH">ວັນທີສົ່ງ</th>
              <th :style="TH_R">ຈຳນວນສົ່ງລວມດອກ</th>
              <th :style="TH_C">ສະຖານະ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, i) in p.rows" :key="i" style="border-bottom:1px solid rgba(0,0,0,.05)">
              <td style="padding:13px 20px;font-size:13px;font-variant-numeric:tabular-nums">{{ r.borrowDate }}</td>
              <td style="padding:13px 20px;font-size:13.5px;font-weight:600">{{ r.name }}</td>
              <td style="padding:13px 20px;font-size:13.5px;text-align:right;font-weight:600;font-variant-numeric:tabular-nums">{{ r.loanStr }}</td>
              <td style="padding:13px 20px;font-size:13px;font-variant-numeric:tabular-nums">{{ r.returnDate }}</td>
              <td style="padding:13px 20px;font-size:13.5px;text-align:right;font-weight:700;font-variant-numeric:tabular-nums;color:#155">{{ r.payStr }}</td>
              <td style="padding:13px 20px;text-align:center">
                <span v-if="r.paid" style="background:#e7f2ea;color:#1f6b4c;font-size:11.5px;font-weight:700;padding:4px 10px;border-radius:20px">ຈ່າຍແລ້ວ</span>
                <span v-if="r.notPaid" style="background:#faf1e2;color:#b07d2e;font-size:11.5px;font-weight:700;padding:4px 10px;border-radius:20px">ຄ້າງຈ່າຍ</span>
              </td>
            </tr>
            <tr style="background:#faf3e2;border-top:2px solid #d9c497;font-weight:800">
              <td style="padding:14px 20px;font-size:13.5px;font-weight:800;color:#5a4a24">ຍອດລວມ</td>
              <td></td>
              <td style="padding:14px 20px;font-size:14px;text-align:right;font-weight:800;font-variant-numeric:tabular-nums;color:#5a4a24">{{ p.loanTot2 }}</td>
              <td style="padding:14px 20px;font-size:13px;font-variant-numeric:tabular-nums;color:#5a4a24">{{ p.lastReturn }}</td>
              <td style="padding:14px 20px;font-size:14px;text-align:right;font-weight:800;font-variant-numeric:tabular-nums;color:#155">{{ p.payTot2 }}</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
