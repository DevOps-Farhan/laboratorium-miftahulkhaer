<script setup lang="ts">
import type { UserRoleSummary } from '../types/user'

defineProps<{ summary: UserRoleSummary | null; loading: boolean }>()
</script>

<template>
  <section class="stats">
    <div class="stat tone-brand">
      <span class="dot" aria-hidden="true"></span>
      <span class="num">{{ summary?.total ?? '—' }}</span>
      <span class="lbl">Total pengguna</span>
    </div>
    <div class="stat tone-sky">
      <span class="dot" aria-hidden="true"></span>
      <span class="num">{{ summary?.teknisi ?? '—' }}</span>
      <span class="lbl">Teknisi</span>
    </div>
    <div class="stat tone-mint">
      <span class="dot" aria-hidden="true"></span>
      <span class="num">{{ summary?.guru ?? '—' }}</span>
      <span class="lbl">Guru</span>
    </div>
    <div class="stat tone-amber">
      <span class="dot" aria-hidden="true"></span>
      <span class="num">{{ summary?.siswa ?? '—' }}</span>
      <span class="lbl">Siswa</span>
    </div>
    <span v-if="loading" class="hint">Memuat...</span>
  </section>
</template>

<style scoped>
.stats {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  align-items: stretch;
}

.stat {
  --tone: var(--brand);
  --tint: var(--brand-soft);
  position: relative;
  flex: 1 1 150px;
  display: grid;
  gap: 3px;
  padding: 16px 18px 15px;
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: var(--card-soft);
  box-shadow: var(--shadow-1);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.stat::after {
  content: '';
  position: absolute;
  inset: auto -30px -46px auto;
  width: 110px;
  height: 110px;
  border-radius: 50%;
  background: var(--tint);
  opacity: 0.55;
}
.stat:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-2);
}

.tone-brand {
  --tone: var(--brand);
  --tint: var(--brand-soft);
}
.tone-sky {
  --tone: #3b8ad4;
  --tint: rgba(59, 138, 212, 0.16);
}
.tone-mint {
  --tone: var(--ok);
  --tint: var(--ok-soft);
}
.tone-amber {
  --tone: #e0952f;
  --tint: rgba(224, 149, 47, 0.18);
}
@media (prefers-color-scheme: dark) {
  .tone-sky {
    --tone: #74b6ef;
    --tint: rgba(116, 182, 239, 0.18);
  }
  .tone-amber {
    --tone: #f0b45c;
    --tint: rgba(240, 180, 92, 0.16);
  }
}

.dot {
  position: relative;
  z-index: 1;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--tone);
  box-shadow: 0 0 0 4px var(--tint);
}
.num {
  position: relative;
  z-index: 1;
  font-size: 1.75rem;
  font-weight: 650;
  letter-spacing: -0.04em;
  line-height: 1.15;
  color: var(--ink);
}
.lbl {
  position: relative;
  z-index: 1;
  font-size: 13px;
  color: var(--muted);
}

.hint {
  align-self: center;
  font-size: 13px;
  color: var(--muted);
}
</style>
