<script setup>
import Icon from './Icon.vue'
defineProps({ dv: { type: Object, required: true } })
defineEmits(['edit', 'delete', 'toggle-day', 'new'])

const ACTION_BTN = 'border:1px solid rgba(0,0,0,.12);background:#fff;border-radius:8px;width:30px;height:30px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center'
</script>

<template>
  <div style="display:flex;flex-direction:column;gap:18px">
    <!-- ຫວ່າງເປົ່າ -->
    <div v-if="!dv.people.length" style="background:#fff;border:1px dashed rgba(0,0,0,.15);border-radius:16px;padding:44px 20px;text-align:center;color:#8a897f">
      <div style="display:flex;justify-content:center;margin-bottom:10px;color:#b6b4aa"><Icon name="coins" :size="34" :stroke="1.5" /></div>
      <div style="font-size:14px;font-weight:600;margin-bottom:14px">ຍັງບໍ່ມີແຜນຈ່າຍລາຍວັນ</div>
      <button
        :style="'color:#fff;border:none;border-radius:10px;padding:10px 20px;font-size:13.5px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:6px;background:' + dv.accent"
        @click="$emit('new')"
      >
        <Icon name="plus" :size="16" /> ເພີ່ມແຜນລາຍວັນ
      </button>
    </div>

    <!-- ການ์ดรายบุคคล (รวมทุกแผนของคนนั้น) -->
    <div
      v-for="p in dv.people"
      :key="p.name"
      style="background:#fff;border:1px solid rgba(0,0,0,.07);border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.05)"
    >
      <!-- ຫัวการ์ด: ชื่อ + สรุปยอดรวมของคนนี้ -->
      <div style="padding:16px 20px;background:linear-gradient(180deg,#f6f4ee,#fff);border-bottom:1px solid rgba(0,0,0,.06)">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">
          <div style="display:flex;align-items:center;gap:13px">
            <div :style="'width:44px;height:44px;border-radius:13px;color:#fff;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:800;background:' + dv.accent">
              {{ p.initial }}
            </div>
            <div>
              <div style="font-size:17px;font-weight:800;display:flex;align-items:center;gap:8px">
                {{ p.name }}
                <span
                  v-if="p.allDone"
                  style="background:#e7f2ea;color:#1f6b4c;font-size:10.5px;font-weight:700;padding:2px 9px;border-radius:20px"
                >ຈ່າຍຄົບແລ້ວ</span>
              </div>
              <div style="font-size:12px;color:#8a897f;font-variant-numeric:tabular-nums">
                {{ p.count }} ແຜນ<span v-if="p.count > 1"> · ຈ່າຍຄົບ {{ p.doneCount }}/{{ p.count }}</span>
              </div>
            </div>
          </div>
          <div style="text-align:right">
            <div style="font-size:11px;color:#8a897f;font-weight:600">ຕ້ອງຮັບຄืນລວມ</div>
            <div style="font-size:18px;font-weight:800;font-variant-numeric:tabular-nums">{{ p.totalStr }}</div>
          </div>
        </div>
        <!-- ແຖບຄວາມคืบหน้ารวมของคนนี้ -->
        <div style="display:flex;justify-content:space-between;font-size:12px;font-weight:600;margin:12px 0 6px">
          <span style="color:#1f6b4c;font-variant-numeric:tabular-nums">ຮັບແລ້ວ {{ p.collectedStr }}</span>
          <span style="color:#b07d2e;font-variant-numeric:tabular-nums">ຍັງເຫຼືອ {{ p.remainingStr }}</span>
        </div>
        <div style="height:8px;background:#eceae2;border-radius:99px;overflow:hidden">
          <div :style="'height:100%;border-radius:99px;transition:width .2s;width:' + p.progressPct + '%;background:' + dv.accent"></div>
        </div>
      </div>

      <!-- ແต่ละแผนของคนนี้ -->
      <div
        v-for="(pl, i) in p.plans"
        :key="pl.id"
        :style="'padding:14px 20px;' + (i > 0 ? 'border-top:1px solid rgba(0,0,0,.06)' : '')"
      >
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:12px">
          <div style="font-size:12.5px;color:#6b6a62;font-variant-numeric:tabular-nums">
            {{ pl.startDate }} → {{ pl.returnDate }} · {{ pl.dailyStr }}/ວັນ × {{ pl.days }} ວັນ
          </div>
          <div style="display:flex;align-items:center;gap:10px">
            <span
              v-if="pl.done"
              style="background:#e7f2ea;color:#1f6b4c;font-size:11px;font-weight:700;padding:4px 10px;border-radius:20px"
            >ຄົບ</span>
            <span
              v-else
              style="background:#faf1e2;color:#b07d2e;font-size:11px;font-weight:700;padding:4px 10px;border-radius:20px;font-variant-numeric:tabular-nums"
            >{{ pl.paidCount }}/{{ pl.days }} ວັນ</span>
            <button :style="ACTION_BTN + ';font-size:13px'" title="ແກ້ໄຂ" @click="$emit('edit', pl.id)"><Icon name="edit" :size="15" /></button>
            <button style="border:1px solid rgba(179,73,47,.25);background:#fff;border-radius:8px;width:30px;height:30px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;color:#b3492f" title="ລຶບ" @click="$emit('delete', pl.id)"><Icon name="trash" :size="15" /></button>
          </div>
        </div>

        <!-- ຊ່ອງແຕ່ລະວັນ (ຕິ໊ก) -->
        <div style="display:flex;flex-wrap:wrap;gap:7px">
          <button
            v-for="c in pl.dayCells"
            :key="c.n"
            :title="'ວັນທີ ' + c.n + (c.paid ? ' · ຈ່າຍແລ້ວ' : ' · ຍັງບໍ່ຈ່າຍ')"
            :style="
              'width:38px;height:38px;border-radius:9px;font-size:12.5px;font-weight:700;cursor:pointer;font-variant-numeric:tabular-nums;transition:all .12s;' +
              (c.paid
                ? 'border:none;color:#fff;box-shadow:0 1px 4px rgba(31,107,76,.35);background:' + dv.accent
                : 'border:1.5px solid rgba(0,0,0,.14);background:#fdfdfb;color:#6b6a62')
            "
            @click="$emit('toggle-day', pl.id, c.n)"
          >
            {{ c.n }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
