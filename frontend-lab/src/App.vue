<script setup lang="ts">
import { ref, watch } from 'vue'
import AccessDenied from './components/AccessDenied.vue'
import LoginForm from './components/LoginForm.vue'
import ToastNotice from './components/ToastNotice.vue'
import { useLoginForm } from './composables/useLoginForm'
import { clearSession, getUserProfile } from './lib/token-storage'
import type { LoginData } from './types/auth'
import GuruDashboard from './views/GuruDashboard.vue'
import SiswaDashboard from './views/SiswaDashboard.vue'
import TechnisiDashboard from './views/TechnisiDashboard.vue'

const { email, password, loading, errorMsg, user, cooldownLeft, submit, reset } = useLoginForm()
const profile = ref<LoginData | null>(getUserProfile())

watch(user, (value) => {
  if (value) profile.value = value
})

function handleLogout() {
  clearSession()
  reset()
  profile.value = null
}
</script>

<template>
  <main class="page">
    <LoginForm
      v-if="!profile"
      :email="email"
      :password="password"
      :loading="loading"
      :error-msg="errorMsg"
      :cooldown-left="cooldownLeft"
      @update:email="email = $event"
      @update:password="password = $event"
      @submit="submit"
    />
    <TechnisiDashboard
      v-else-if="profile.role === 'teknisi'"
      :user="profile"
      @logout="handleLogout"
      @session-expired="handleLogout"
    />
    <GuruDashboard
      v-else-if="profile.role === 'guru'"
      :user="profile"
      @logout="handleLogout"
      @session-expired="handleLogout"
    />
    <SiswaDashboard
      v-else-if="profile.role === 'siswa'"
      :user="profile"
      @logout="handleLogout"
      @session-expired="handleLogout"
    />
    <AccessDenied v-else :user="profile" @logout="handleLogout" />
    <ToastNotice />
  </main>
</template>

<style scoped>
.page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  font-family: system-ui, sans-serif;
}
.page:has(.dash) {
  place-items: stretch;
}
</style>
