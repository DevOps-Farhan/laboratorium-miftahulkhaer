<script setup lang="ts">
import type { CategoryItem } from '../types/category'
import LoadingSpinner from './LoadingSpinner.vue'

withDefaults(
  defineProps<{ items: CategoryItem[]; loading: boolean; startIndex?: number }>(),
  { startIndex: 0 },
)

const emit = defineEmits<{
  edit: [item: CategoryItem]
  remove: [item: CategoryItem]
}>()
</script>

<template>
  <section class="table-wrap">
    <LoadingSpinner v-if="loading" />
    <p v-else-if="items.length === 0" class="state">Tidak ada kategori yang cocok.</p>
    <table v-else>
      <thead>
        <tr>
          <th class="num-col">No</th>
          <th>Nama</th>
          <th class="num-col">Jumlah</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, idx) in items" :key="item.id">
          <td class="num-col">{{ (startIndex ?? 0) + idx + 1 }}</td>
          <td class="who">{{ item.nama }}</td>
          <td class="num-col">
            <span class="badge role">{{ item.jumlah }}</span>
          </td>
          <td class="row-actions">
            <button class="btn small" @click="emit('edit', item)">Edit</button>
            <button class="btn small suspend" @click="emit('remove', item)">Hapus</button>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<style scoped>
.table-wrap {
  overflow-x: auto;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: var(--card-soft);
  box-shadow: var(--shadow-1);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
.state {
  margin: 0;
  padding: 34px 20px;
  text-align: center;
  font-size: 14.5px;
  color: var(--muted);
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
th,
td {
  text-align: left;
  padding: 12px 16px;
  border-bottom: 1px solid var(--line);
  vertical-align: middle;
}
thead th {
  background: rgba(109, 90, 224, 0.06);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted);
  white-space: nowrap;
}
@media (prefers-color-scheme: dark) {
  thead th {
    background: rgba(139, 124, 246, 0.12);
  }
}
tbody tr:last-child td {
  border-bottom: 0;
}
tbody tr {
  transition: background 0.16s ease;
}
tbody tr:hover {
  background: var(--brand-soft);
}
.num-col {
  font-variant-numeric: tabular-nums;
  color: var(--muted);
  width: 1%;
  white-space: nowrap;
}
.who {
  font-weight: 600;
  color: var(--ink);
  white-space: nowrap;
}
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 11px;
  border-radius: 999px;
  font-size: 12.5px;
  font-weight: 600;
  white-space: nowrap;
  background: var(--field);
  border: 1px solid var(--line);
  color: var(--muted);
}
.badge.role {
  background: var(--brand-soft);
  border-color: transparent;
  color: var(--brand-ink);
}
.row-actions {
  display: flex;
  gap: 6px;
  white-space: nowrap;
}
.btn.small {
  padding: 6px 11px;
  border-radius: var(--r-sm);
  border: 1px solid var(--line);
  background: var(--card);
  color: var(--ink);
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  width: auto;
  transition: background 0.16s ease, border-color 0.16s ease, color 0.16s ease,
    transform 0.16s ease;
}
.btn.small:hover {
  transform: translateY(-1px);
  border-color: rgba(109, 90, 224, 0.45);
  background: var(--brand-soft);
  color: var(--brand-ink);
}
.btn.small:focus-visible {
  outline: 2px solid var(--brand);
  outline-offset: 2px;
}
.btn.small.suspend {
  color: var(--danger);
}
.btn.small.suspend:hover {
  background: var(--danger-soft);
  border-color: var(--danger-soft);
  color: var(--danger);
}
</style>
