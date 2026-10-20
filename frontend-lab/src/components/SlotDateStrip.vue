<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { mondayOfWeek, todayKey, weekDays, weekLabel } from '../lib/slot-dates'

const props = defineProps<{ modelValue: string }>()

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const weekMonday = ref(mondayOfWeek(new Date()))

const days = computed(() => weekDays(weekMonday.value))
const label = computed(() => weekLabel(weekMonday.value))
const atCurrentWeek = computed(
  () => weekMonday.value.getTime() === mondayOfWeek(new Date()).getTime(),
)

function prevWeek(): void {
  if (atCurrentWeek.value) return
  const d = new Date(weekMonday.value)
  d.setDate(d.getDate() - 7)
  // Jangan mundur ke minggu yang seluruhnya lewat.
  const current = mondayOfWeek(new Date())
  if (d.getTime() < current.getTime()) {
    weekMonday.value = current
  } else {
    weekMonday.value = d
  }
}

function nextWeek(): void {
  const d = new Date(weekMonday.value)
  d.setDate(d.getDate() + 7)
  weekMonday.value = d
}

function goToday(): void {
  weekMonday.value = mondayOfWeek(new Date())
  emit('update:modelValue', todayKey())
}

function pick(key: string, isPast: boolean): void {
  if (isPast) return
  emit('update:modelValue', key)
}

// Jika tanggal terpilih di luar minggu tampil (mis. setelah navigasi), ikutkan.
watch(
  () => props.modelValue,
  (key) => {
    const [y, m, d] = key.split('-').map(Number)
    if (!y || !m || !d) return
    const dt = new Date(y, m - 1, d)
    const monday = mondayOfWeek(dt)
    if (monday.getTime() !== weekMonday.value.getTime()) weekMonday.value = monday
  },
)
</script>

<template>
  <section class="datestrip" aria-label="Pilih tanggal">
    <div class="nav">
      <button class="navbtn" :disabled="atCurrentWeek" aria-label="Minggu sebelumnya" @click="prevWeek">
        ‹
      </button>
      <span class="range">{{ label }}</span>
      <button class="navbtn" aria-label="Minggu berikutnya" @click="nextWeek">›</button>
      <button class="todaybtn" @click="goToday">Hari ini</button>
    </div>
    <div class="days" role="listbox" aria-label="Tanggal">
      <button
        v-for="day in days"
        :key="day.key"
        role="option"
        :aria-selected="modelValue === day.key"
        class="day"
        :class="{ active: modelValue === day.key, today: day.isToday }"
        :disabled="day.isPast"
        :title="day.isPast ? 'Tanggal sudah lewat' : undefined"
        @click="pick(day.key, day.isPast)"
      >
        <span class="dow">{{ day.dayName }}</span>
        <span class="num">{{ day.dayNum }}</span>
        <span class="mon">{{ day.monthShort }}</span>
      </button>
    </div>
  </section>
</template>

<style scoped>
.datestrip {
  display: grid;
  gap: 10px;
  padding: 12px;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: var(--card-soft);
  box-shadow: var(--shadow-1);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
.nav {
  display: flex;
  align-items: center;
  gap: 8px;
}
.range {
  flex: 1;
  min-width: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.navbtn {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid var(--line);
  background: var(--card);
  color: var(--ink);
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  transition: background 0.16s ease, border-color 0.16s ease;
}
.navbtn:hover:not(:disabled) {
  background: var(--brand-soft);
  border-color: rgba(109, 90, 224, 0.45);
}
.navbtn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.todaybtn {
  padding: 8px 14px;
  border-radius: 10px;
  border: 1px solid var(--line);
  background: transparent;
  color: var(--muted);
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}
.todaybtn:hover {
  background: var(--field);
  color: var(--brand-ink);
}
.days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  overflow-x: auto;
}
.day {
  display: grid;
  gap: 2px;
  justify-items: center;
  padding: 10px 4px;
  border-radius: 14px;
  border: 1px solid var(--line);
  background: var(--card);
  color: var(--ink);
  font-family: inherit;
  cursor: pointer;
  min-width: 0;
  transition: transform 0.16s ease, background 0.16s ease, border-color 0.16s ease;
}
.day:hover:not(:disabled) {
  transform: translateY(-1px);
  border-color: rgba(109, 90, 224, 0.45);
  background: var(--brand-soft);
}
.day .dow {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}
.day .num {
  font-size: 20px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.day .mon {
  font-size: 11px;
  color: var(--muted);
}
.day.active {
  background: linear-gradient(135deg, var(--brand-2), var(--brand));
  border-color: transparent;
  color: #fff;
}
.day.active .dow,
.day.active .mon {
  color: rgba(255, 255, 255, 0.85);
}
.day.today:not(.active) {
  border-color: rgba(109, 90, 224, 0.55);
}
.day:disabled {
  opacity: 0.38;
  cursor: not-allowed;
}
</style>
