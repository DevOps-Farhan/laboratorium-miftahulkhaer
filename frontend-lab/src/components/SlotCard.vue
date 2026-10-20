<script setup lang="ts">
import { formatTime } from '../lib/slot-dates'
import type { SlotItem } from '../types/slot'

defineProps<{ item: SlotItem; busy: boolean }>()

const emit = defineEmits<{ book: [item: SlotItem] }>()

function durationLabel(item: SlotItem): string {
  const a = new Date(item.tglmulai).getTime()
  const b = new Date(item.tglselesai).getTime()
  if (Number.isNaN(a) || Number.isNaN(b)) return ''
  const mins = Math.round((b - a) / 60000)
  if (mins < 60) return `${mins} menit`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m ? `${h} jam ${m} menit` : `${h} jam`
}
</script>

<template>
  <article class="card">
    <div class="time">
      <span class="range">{{ formatTime(item.tglmulai) }} – {{ formatTime(item.tglselesai) }}</span>
      <span class="dur">{{ durationLabel(item) }}</span>
    </div>
    <div class="lab">{{ item.laboratorium?.nama ?? `Lab #${item.laboratoriumId}` }}</div>
    <p v-if="item.catatan" class="note">{{ item.catatan }}</p>
    <button class="btn primary" :disabled="busy" @click="emit('book', item)">
      {{ busy ? '...' : 'Booking slot' }}
    </button>
  </article>
</template>

<style scoped>
.card {
  display: grid;
  gap: 6px;
  align-content: start;
  padding: 16px;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: var(--card-soft);
  box-shadow: var(--shadow-1);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: transform 0.16s ease, border-color 0.16s ease;
}
.card:hover {
  transform: translateY(-2px);
  border-color: rgba(109, 90, 224, 0.45);
}
.time {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
}
.range {
  font-size: 17px;
  font-weight: 700;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
}
.dur {
  font-size: 12.5px;
  color: var(--muted);
}
.lab {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--brand-ink);
}
.note {
  margin: 0;
  font-size: 13.5px;
  color: var(--muted);
  line-height: 1.5;
}
.btn.primary {
  margin-top: 6px;
  padding: 10px 16px;
  border-radius: var(--r-md);
  background: linear-gradient(135deg, var(--brand-2), var(--brand));
  border: 1px solid transparent;
  color: #fff;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 14px 24px -16px rgba(109, 90, 224, 0.95);
}
.btn.primary:hover:not(:disabled) {
  transform: translateY(-1px);
}
.btn.primary:disabled {
  opacity: 0.6;
  cursor: wait;
}
</style>
