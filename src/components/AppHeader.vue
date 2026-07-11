<script setup>
import Icon from './Icon.vue'
defineProps({ vals: { type: Object, required: true } })
</script>

<template>
  <div style="background:linear-gradient(180deg,#20342a,#1a2b23);color:#f3efe6;padding:26px 40px 30px">
    <div style="max-width:1240px;margin:0 auto;display:flex;align-items:flex-end;justify-content:space-between;gap:24px;flex-wrap:wrap">
      <div>
        <div :style="'font-size:11px;letter-spacing:3px;text-transform:uppercase;font-weight:600;margin-bottom:6px;color:' + vals.accentSoft">
          ບັນຊີເງິນກູ້
        </div>
        <h1 style="margin:0;font-size:30px;font-weight:800;letter-spacing:-.3px">ລະບົບການກູ້ຢືມເງິນ</h1>
        <div style="margin-top:6px;font-size:13px;color:#b9c4bc">
          ຕິດຕາມເງິນປ່ອຍກູ້ · ດອກເບ້ຍ · ແລະ ການຊຳລະຄືນ
        </div>
      </div>
      <div style="display:flex;gap:14px;flex-wrap:wrap">
        <div style="background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px 18px;min-width:150px">
          <div style="font-size:11px;color:#a9b6ac;font-weight:600;margin-bottom:4px;display:flex;align-items:center;gap:5px"><Icon name="banknote" :size="13" />ຍອດປ່ອຍກູ້</div>
          <div style="font-size:20px;font-weight:700;font-variant-numeric:tabular-nums">{{ vals.headLoanStr }}</div>
        </div>
        <div style="background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px 18px;min-width:150px">
          <div style="font-size:11px;color:#a9b6ac;font-weight:600;margin-bottom:4px;display:flex;align-items:center;gap:5px"><Icon name="rotate" :size="13" />ຍອດຕ້ອງຮັບຄືນ</div>
          <div style="font-size:20px;font-weight:700;font-variant-numeric:tabular-nums">{{ vals.headReturnStr }}</div>
        </div>
        <div :style="'border-radius:14px;padding:12px 18px;min-width:150px;background:' + vals.accent">
          <div style="font-size:11px;color:rgba(255,255,255,.85);font-weight:600;margin-bottom:4px;display:flex;align-items:center;gap:5px"><Icon name="trending" :size="13" />ກຳໄລ (ດອກເບ້ຍ)</div>
          <div style="font-size:20px;font-weight:800;font-variant-numeric:tabular-nums;color:#fff">{{ vals.headProfitStr }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
