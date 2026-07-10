<script setup>
import Icon from './Icon.vue'
defineProps({ vals: { type: Object, required: true } })
defineEmits(['name', 'edit', 'delete', 'toggle'])

const TH_L = 'text-align:left;padding:13px 16px;font-size:11.5px;font-weight:700;color:#54534c;letter-spacing:.4px'
const TH_R = 'text-align:right;padding:13px 16px;font-size:11.5px;font-weight:700;color:#54534c;letter-spacing:.4px'
const TH_C = 'text-align:center;padding:13px 12px;font-size:11.5px;font-weight:700;color:#54534c;letter-spacing:.4px'
const ACTION_BTN = 'border:1px solid rgba(0,0,0,.12);background:#fff;border-radius:8px;width:30px;height:30px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center'
</script>

<template>
  <div style="background:#fff;border:1px solid rgba(0,0,0,.07);border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.05)">
    <div style="overflow-x:auto">
      <table style="width:100%;border-collapse:collapse;min-width:920px">
        <thead>
          <tr style="background:#f6f4ee;border-bottom:1.5px solid rgba(0,0,0,.09)">
            <th :style="TH_L">ວັນທີ່ຢືມ</th>
            <th :style="TH_L">ຊື່ຜູ້ກູ້</th>
            <th :style="TH_R">ຈຳນວນເງິນຢືມ</th>
            <th :style="TH_C">ເປີເຊັນ</th>
            <th :style="TH_L">ວັນທີ່ຄືນ</th>
            <th :style="TH_R">ຈຳນວນຄືນ</th>
            <th :style="TH_C">ສະຖານະ</th>
            <th :style="TH_R">ຈັດການ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in vals.rows" :key="row.id" :style="row.rowStyle">
            <td style="padding:13px 16px;font-size:13px;color:#3c3b35;white-space:nowrap;font-variant-numeric:tabular-nums">{{ row.borrowDate }}</td>
            <td style="padding:13px 16px;font-size:13.5px;font-weight:600">
              <span
                style="cursor:pointer;border-bottom:1.5px dotted rgba(31,107,76,.5);color:#1f3a2e"
                title="ເບິ່ງລາຍລະອຽດ"
                @click="$emit('name', row.name)"
              >{{ row.name }}</span>
            </td>
            <td style="padding:13px 16px;font-size:13.5px;text-align:right;font-variant-numeric:tabular-nums;font-weight:600">{{ row.loanStr }}</td>
            <td style="padding:13px 12px;text-align:center">
              <span style="background:#eef4ee;color:#1f6b4c;font-size:12px;font-weight:700;padding:3px 8px;border-radius:20px;font-variant-numeric:tabular-nums">{{ row.pctStr }}</span>
            </td>
            <td style="padding:13px 16px;font-size:13px;color:#3c3b35;white-space:nowrap;font-variant-numeric:tabular-nums">{{ row.returnDate }}</td>
            <td style="padding:13px 16px;font-size:13.5px;text-align:right;font-variant-numeric:tabular-nums;font-weight:700;color:#155">{{ row.payStr }}</td>
            <td style="padding:13px 12px;text-align:center">
              <span v-if="row.paid" style="background:#e7f2ea;color:#1f6b4c;font-size:11.5px;font-weight:700;padding:4px 10px;border-radius:20px">ຈ່າຍແລ້ວ</span>
              <span v-if="row.notPaid" style="background:#faf1e2;color:#b07d2e;font-size:11.5px;font-weight:700;padding:4px 10px;border-radius:20px">ຄ້າງຈ່າຍ</span>
            </td>
            <td style="padding:10px 16px;text-align:right;white-space:nowrap">
              <div style="display:inline-flex;gap:6px">
                <button :style="ACTION_BTN + ';color:#1f6b4c'" title="ສະຫຼັບສະຖານະ" @click="$emit('toggle', row.id)"><Icon name="check" :size="15" /></button>
                <button :style="ACTION_BTN + ';font-size:13px'" title="ແກ້ໄຂ" @click="$emit('edit', row.id)"><Icon name="edit" :size="15" /></button>
                <button style="border:1px solid rgba(179,73,47,.25);background:#fff;border-radius:8px;width:30px;height:30px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;color:#b3492f" title="ລຶບ" @click="$emit('delete', row.id)"><Icon name="trash" :size="15" /></button>
              </div>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr style="background:#20342a;color:#f3efe6">
            <td colspan="2" style="padding:15px 16px;font-size:13px;font-weight:700">ລວມ</td>
            <td style="padding:15px 16px;text-align:right;font-size:14px;font-weight:800;font-variant-numeric:tabular-nums">{{ vals.sumLoanStr }}</td>
            <td></td>
            <td></td>
            <td style="padding:15px 16px;text-align:right;font-size:14px;font-weight:800;font-variant-numeric:tabular-nums">{{ vals.sumReturnStr }}</td>
            <td colspan="2" :style="'padding:15px 16px;text-align:right;font-size:13px;font-weight:700;color:' + vals.accentSoft">+{{ vals.sumProfitStr }}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>
