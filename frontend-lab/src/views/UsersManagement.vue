<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import PaginationBar from '../components/PaginationBar.vue'
import UserDialog from '../components/UserDialog.vue'
import UserFilters from '../components/UserFilters.vue'
import UsersTable from '../components/UsersTable.vue'
import UserStats from '../components/UserStats.vue'
import { useToast } from '../composables/useToast'
import { useUsers } from '../composables/useUsers'
import { getUserProfile } from '../lib/token-storage'
import type { CreateUserPayload, ManagedUser, Role, Status } from '../types/user'

const emit = defineEmits<{ sessionExpired: [] }>()

const { notify } = useToast()

const {
  items,
  paging,
  filters,
  loading,
  errorMsg,
  errorStatus,
  summary,
  refresh,
  setPage,
  applyFilters,
  setSearch,
  resetFilters,
  saveUser,
  toggleStatus,
  removeUser,
} = useUsers()

const dialogOpen = ref(false)
const editing = ref<ManagedUser | null>(null)
const saving = ref(false)
const dialogError = ref('')
const deletingId = ref<number | null>(null)
const currentUserEmail = ref(getUserProfile()?.email ?? '')

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

function openEdit(user: ManagedUser) {
  editing.value = user
  dialogError.value = ''
  dialogOpen.value = true
}

async function onSave(payload: CreateUserPayload | { email?: string; name?: string; role?: Role; status?: Status }) {
  const isEdit = editing.value !== null
  saving.value = true
  dialogError.value = ''
  try {
    await saveUser(payload, editing.value?.id ?? null)
    dialogOpen.value = false
    notify(
      isEdit ? 'Perubahan user berhasil disimpan' : 'User baru berhasil ditambahkan',
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

async function onToggleStatus(user: ManagedUser) {
  const action = user.status === 'aktif' ? 'dinonaktifkan' : 'diaktifkan'
  try {
    await toggleStatus(user)
    notify(`Status ${user.name ?? user.email} ${action}`, 'success')
  } catch (e) {
    notify(e instanceof Error ? e.message : 'Gagal memperbarui status', 'error')
  }
}

async function onRemove(user: ManagedUser) {
  const ok = window.confirm(
    `Hapus ${user.name ?? user.email}? Jadwal yang diajukan user ini ikut terhapus dan aksi ini tidak bisa dibatalkan.`,
  )
  if (!ok) return
  deletingId.value = user.id
  try {
    await removeUser(user)
    notify(`User ${user.name ?? user.email} dihapus`, 'success')
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
    <UserStats :summary="summary" :loading="loading" />
    <UserFilters
      :filters="filters"
      @update:search="setSearch"
      @update:role="filters.role = $event"
      @update:status="filters.status = $event"
      @change="applyFilters"
      @reset="resetFilters"
      @add="openCreate"
    />
    <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
    <UsersTable
      :items="items"
      :loading="loading || deletingId !== null"
      :current-user-email="currentUserEmail"
      :start-index="(paging.page - 1) * paging.size"
      @edit="openEdit"
      @toggle-status="onToggleStatus"
      @remove="onRemove"
    />
    <PaginationBar
      :page="paging.page"
      :total-page="paging.total_page"
      :total-item="paging.total_item"
      :loading="loading"
      @prev="setPage(paging.page - 1)"
      @next="setPage(paging.page + 1)"
    />
    <UserDialog
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
