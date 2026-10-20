<script setup lang="ts">
withDefaults(
  defineProps<{ page: number; totalPage: number; totalItem: number; loading?: boolean }>(),
  { loading: false },
)

const emit = defineEmits<{ prev: []; next: [] }>()
</script>

<template>
  <nav class="pager" aria-label="Navigasi halaman">
    <span class="info">Hal {{ page }} / {{ Math.max(totalPage, 1) }} · {{ totalItem }} data{{ loading ? ' · Memuat...' : '' }}</span>
    <div class="btns">
      <button class="btn" :disabled="loading || page <= 1" @click="emit('prev')">
        <span v-if="loading" class="mini-spinner" aria-hidden="true"></span>
        <span aria-hidden="true">‹</span> Sebelumnya
      </button>
      <button class="btn" :disabled="loading || page >= totalPage || totalPage === 0" @click="emit('next')">
        Berikutnya <span aria-hidden="true">›</span>
      </button>
    </div>
  </nav>
</template>

<style scoped>
.pager {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  padding: 4px 2px;
}
.info {
  font-size: 13.5px;
  color: var(--muted);
  font-variant-numeric: tabular-nums;
}
.btns {
  display: flex;
  gap: 8px;
}
.btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 9px 15px;
  border-radius: var(--r-md);
  border: 1px solid var(--line);
  background: var(--card);
  color: var(--ink);
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  width: auto;
  box-shadow: var(--shadow-1);
  transition: transform 0.16s ease, background 0.16s ease, border-color 0.16s ease,
    color 0.16s ease;
}
.btn:hover:not(:disabled) {
  transform: translateY(-1px);
  border-color: rgba(109, 90, 224, 0.45);
  background: var(--brand-soft);
  color: var(--brand-ink);
}
.btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  box-shadow: none;
}
.mini-spinner {
  width: 13px;
  height: 13px;
  flex: 0 0 auto;
  border-radius: 50%;
  border: 2px solid var(--brand-soft);
  border-top-color: var(--brand);
  animation: pager-spin 0.7s linear infinite;
}
@keyframes pager-spin {
  to {
    transform: rotate(360deg);
  }
}
@media (prefers-reduced-motion: reduce) {
  .mini-spinner {
    animation: none;
  }
}
.btn:focus-visible {
  outline: 2px solid var(--brand);
  outline-offset: 2px;
}
</style>
