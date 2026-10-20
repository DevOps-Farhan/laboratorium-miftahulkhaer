<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import CategoryDialog from '../components/CategoryDialog.vue'
import CategoryFilters from '../components/CategoryFilters.vue'
import CategoryTable from '../components/CategoryTable.vue'
import PaginationBar from '../components/PaginationBar.vue'
import { useToast } from '../composables/useToast'
import { useCategory } from '../composables/useCategory'
import type { CategoryItem, CreateCategoryPayload, UpdateCategoryPayload } from '../types/category'

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
  resetFilters,
  saveCategory,
  removeCategory,
} = useCategory()

const dialogOpen = ref(false)
const editing = ref<CategoryItem | null>(null)
const saving = ref(false)
const dialogError = ref('')
const deletingId = ref<number | null>(null)

onMounted(() => {
  void refresh()
})

watch(errorStatus, (status) => {
  if (status === 401) emit('sessionExpired')
})

function openCreate() {
  editing.value = null
  dialogError.value = ''
  dialogOpen.value = true
}

function openEdit(item: CategoryItem) {
  editing.value = item
  dialogError.value = ''
  dialogOpen.value = true
}

async function onSave(payload: CreateCategoryPayload | UpdateCategoryPayload) {
  const isEdit = editing.value !== null
  saving.value = true
  dialogError.value = ''
  try {
    await saveCategory(payload, editing.value?.id ?? null)
    dialogOpen.value = false
    notify(
      isEdit ? 'Perubahan kategori berhasil disimpan' : 'Kategori baru berhasil ditambahkan',
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

async function onRemove(item: CategoryItem) {
  const ok = window.confirm(
    `Hapus kategori ${item.nama}? Kategori yang masih dipakai inventory tidak bisa dihapus.`,
  )
  if (!ok) return
  deletingId.value = item.id
  try {
    await removeCategory(item)
    notify(`Kategori ${item.nama} dihapus`, 'success')
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
    <CategoryFilters
      :filters="filters"
      @update:search="setSearch"
      @reset="resetFilters"
      @add="openCreate"
    />
    <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
    <CategoryTable :items="items" :loading="loading || deletingId !== null" :start-index="(paging.page - 1) * paging.size" @edit="openEdit" @remove="onRemove" />
    <PaginationBar
      :page="paging.page"
      :total-page="paging.total_page"
      :total-item="paging.total_item"
      :loading="loading"
      @prev="setPage(paging.page - 1)"
      @next="setPage(paging.page + 1)"
    />
    <CategoryDialog
      :open="dialogOpen"
      :editing="editing"
      :saving="saving"
      :server-error="dialogError"
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
