<script setup lang="ts">
import type { CategoryItem } from '../types/category'
import type { InventoryFilters } from '../types/inventory'
import type { LabItem } from '../types/laboratorium'

defineProps<{
  filters: InventoryFilters
  labs: LabItem[]
  categories: CategoryItem[]
}>()

const emit = defineEmits<{
  'update:search': [value: string]
  'update:lab': [value: number | undefined]
  'update:category': [value: number | undefined]
  reset: []
  add: []
}>()

function onLabChange(e: Event) {
  const raw = (e.target as HTMLSelectElement).value
  emit('update:lab', raw ? Number(raw) : undefined)
}

function onCategoryChange(e: Event) {
  const raw = (e.target as HTMLSelectElement).value
  emit('update:category', raw ? Number(raw) : undefined)
}
</script>

<template>
  <section class="filters">
    <div class="search">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
        <circle cx="11" cy="11" r="6.4" />
        <path d="m16 16 4 4" />
      </svg>
      <input
        :value="filters.search"
        type="search"
        placeholder="Cari kode / nama barang..."
        aria-label="Cari inventory"
        @input="emit('update:search', ($event.target as HTMLInputElement).value)"
      />
    </div>
    <select
      :value="filters.laboratoriumId ?? ''"
      aria-label="Filter laboratorium"
      @change="onLabChange"
    >
      <option value="">Semua lab</option>
      <option v-for="lab in labs" :key="lab.id" :value="lab.id">
        {{ lab.kode }} — {{ lab.nama }}
      </option>
    </select>
    <select
      :value="filters.categoryId ?? ''"
      aria-label="Filter kategori"
      @change="onCategoryChange"
    >
      <option value="">Semua kategori</option>
      <option v-for="cat in categories" :key="cat.id" :value="cat.id">
        {{ cat.nama }}
      </option>
    </select>
    <button class="btn ghost" @click="emit('reset')">Reset</button>
    <button class="btn primary" @click="emit('add')">
      <span aria-hidden="true">+</span> Tambah barang
    </button>
  </section>
</template>

<style scoped>
.filters {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
  padding: 12px;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: var(--card-soft);
  box-shadow: var(--shadow-1);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
.search {
  position: relative;
  display: flex;
  align-items: center;
  flex: 2 1 220px;
  min-width: 0;
}
.search svg {
  position: absolute;
  left: 12px;
  width: 17px;
  height: 17px;
  color: var(--muted);
  pointer-events: none;
}
.search input {
  width: 100%;
  min-width: 0;
  padding: 10px 12px 10px 38px;
}
input,
select {
  box-sizing: border-box;
  padding: 10px 12px;
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  background: var(--field);
  color: var(--ink);
  font-family: inherit;
  font-size: 14px;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
}
input::placeholder {
  color: var(--muted);
}
input:focus,
select:focus {
  outline: none;
  border-color: rgba(109, 90, 224, 0.55);
  box-shadow: 0 0 0 4px var(--brand-soft);
  background: var(--card);
}
input::-webkit-search-cancel-button {
  cursor: pointer;
}
select {
  flex: 1 1 160px;
  min-width: 0;
  cursor: pointer;
}
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border-radius: var(--r-md);
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  width: auto;
  transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease,
    border-color 0.18s ease, color 0.18s ease;
}
.btn:focus-visible {
  outline: 2px solid var(--brand);
  outline-offset: 2px;
}
.btn.ghost {
  background: transparent;
  border: 1px solid var(--line);
  color: var(--muted);
}
.btn.ghost:hover {
  background: var(--field);
  border-color: rgba(109, 90, 224, 0.4);
  color: var(--brand-ink);
}
.btn.primary {
  background: linear-gradient(135deg, var(--brand-2), var(--brand));
  border: 1px solid transparent;
  color: #fff;
  box-shadow: 0 14px 24px -16px rgba(109, 90, 224, 0.95);
}
.btn.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 18px 26px -16px rgba(109, 90, 224, 0.95);
}
.btn.primary span {
  font-size: 16px;
  line-height: 1;
}
</style>
