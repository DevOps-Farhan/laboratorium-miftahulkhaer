<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import InventoryDialog from '../components/InventoryDialog.vue'
import InventoryFilters from '../components/InventoryFilters.vue'
import InventoryTable from '../components/InventoryTable.vue'
import PaginationBar from '../components/PaginationBar.vue'
import { useToast } from '../composables/useToast'
import { useInventory } from '../composables/useInventory'
import { listAllCategories } from '../lib/category-api'
import { listAllLabs } from '../lib/laboratorium-api'
import type { CategoryItem } from '../types/category'
import type { CreateInventoryPayload, InventoryItem, UpdateInventoryPayload } from '../types/inventory'
import type { LabItem } from '../types/laboratorium'

const emit = defineEmits<{ sessionExpired: [] }>()

const { notify } = useToast()

const {
  items,
  paging,
  filters,
  loading,
  errorMsg,
  errorStatus,
  refresh,
  setPage,
  setSearch,
  setLaboratoriumFilter,
  setCategoryFilter,
  resetFilters,
  saveInventory,
  removeInventory,
} = useInventory()

const dialogOpen = ref(false)
const editing = ref<InventoryItem | null>(null)
const saving = ref(false)
const dialogError = ref('')
const deletingId = ref<number | null>(null)

const labs = ref<LabItem[]>([])
const categories = ref<CategoryItem[]>([])
const optionsLoading = ref(false)

async function loadOptions(): Promise<void> {
  optionsLoading.value = true
  try {
    const [labList, catList] = await Promise.all([listAllLabs(), listAllCategories()])
    labs.value = labList
    categories.value = catList
  } catch {
    // Opsi dropdown boleh gagal diam-diam; error utama ditangani tabel.
  } finally {
    optionsLoading.value = false
  }
}

onMounted(() => {
  void refresh()
  void loadOptions()
})

watch(errorStatus, (status) => {
  if (status === 401) emit('sessionExpired')
})

function openCreate() {
  editing.value = null
  dialogError.value = ''
  dialogOpen.value = true
}

function openEdit(item: InventoryItem) {
  editing.value = item
  dialogError.value = ''
  dialogOpen.value = true
}

async function onSave(payload: CreateInventoryPayload | UpdateInventoryPayload) {
  const isEdit = editing.value !== null
  saving.value = true
  dialogError.value = ''
  try {
    await saveInventory(payload, editing.value?.id ?? null)
    dialogOpen.value = false
    notify(
      isEdit ? 'Perubahan barang berhasil disimpan' : 'Barang baru berhasil ditambahkan',
      'success',
    )
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Gagal menyimpan'
    dialogError.value = message
    notify(message, 'error')
  } finally {
    saving.value = false
  }
}

async function onRemove(item: InventoryItem) {
  const ok = window.confirm(`Hapus ${item.kode} — ${item.nama}?`)
  if (!ok) return
  deletingId.value = item.id
  try {
    await removeInventory(item)
    notify(`Barang ${item.kode} dihapus`, 'success')
  } catch (e) {
    notify(e instanceof Error ? e.message : 'Gagal menghapus', 'error')
  } finally {
    deletingId.value = null
  }
}

defineExpose({ refresh })
</script>

<template>
  <div class="view">
    <InventoryFilters
      :filters="filters"
      :labs="labs"
      :categories="categories"
      @update:search="setSearch"
      @update:lab="setLaboratoriumFilter"
      @update:category="setCategoryFilter"
      @reset="resetFilters"
      @add="openCreate"
    />
    <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
    <InventoryTable :items="items" :loading="loading || deletingId !== null" :start-index="(paging.page - 1) * paging.size" @edit="openEdit" @remove="onRemove" />
    <PaginationBar
      :page="paging.page"
      :total-page="paging.total_page"
      :total-item="paging.total_item"
      :loading="loading"
      @prev="setPage(paging.page - 1)"
      @next="setPage(paging.page + 1)"
    />
    <InventoryDialog
      :open="dialogOpen"
      :editing="editing"
      :saving="saving"
      :server-error="dialogError"
      :labs="labs"
      :categories="categories"
      :options-loading="optionsLoading"
      @close="dialogOpen = false"
      @save="onSave"
    />
  </div>
</template>

<style scoped>
.view {
  display: grid;
  gap: 18px;
  align-content: start;
}
.error {
  margin: 0;
  padding: 12px 15px;
  border: 1px solid var(--danger-soft);
  border-radius: var(--r-md);
  background: var(--danger-soft);
  color: var(--danger);
  font-size: 14px;
}
</style>
