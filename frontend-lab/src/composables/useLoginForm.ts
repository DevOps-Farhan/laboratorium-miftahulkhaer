import { onUnmounted, ref, watch } from 'vue'
import { loginUser } from '../lib/auth-api'
import { ApiError } from '../lib/http'
import { saveToken, saveUserProfile } from '../lib/token-storage'
import { validateLoginForm } from '../lib/validators'
import type { LoginData } from '../types/auth'

export function useLoginForm() {
  const email = ref('')
  const password = ref('')
  const loading = ref(false)
  const errorMsg = ref('')
  const user = ref<LoginData | null>(null)
  // Sisa detik masa tunggu rate limiter (429), dihitung mundur tiap detik.
  const cooldownLeft = ref(0)

  let timer: ReturnType<typeof setInterval> | null = null
  let cooldownUntil = 0

  function cooldownMessage(n: number): string {
    return `Terlalu banyak percobaan login yang gagal. Coba lagi dalam ${n} detik.`
  }

  function stopCooldown(): void {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
    cooldownUntil = 0
    cooldownLeft.value = 0
  }

  function startCooldown(seconds: number): void {
    stopCooldown()
    const wait = Number.isFinite(seconds) && seconds > 0 ? Math.ceil(seconds) : 60
    cooldownUntil = Date.now() + wait * 1000
    cooldownLeft.value = wait
    errorMsg.value = cooldownMessage(wait)
    timer = setInterval(() => {
      const left = Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000))
      cooldownLeft.value = left
      if (left <= 0) {
        stopCooldown()
        errorMsg.value = ''
      } else {
        errorMsg.value = cooldownMessage(left)
      }
    }, 1000)
  }

  // Email beda = bucket limiter beda → hentikan hitungan mundur, biarkan server yang menilai.
  watch(email, () => {
    if (cooldownLeft.value > 0) {
      stopCooldown()
      errorMsg.value = ''
    }
  })

  onUnmounted(stopCooldown)

  async function submit(): Promise<void> {
    if (cooldownLeft.value > 0) return
    const invalid = validateLoginForm(email.value.trim(), password.value)
    if (invalid) {
      errorMsg.value = invalid
      return
    }
    errorMsg.value = ''
    loading.value = true
    try {
      const data = await loginUser(email.value.trim(), password.value)
      saveToken(data.token)
      saveUserProfile(data)
      user.value = data
    } catch (e) {
      if (e instanceof ApiError && e.status === 429) {
        startCooldown(e.retryAfter ?? 60)
      } else {
        errorMsg.value = e instanceof Error ? e.message : 'Login gagal'
      }
    } finally {
      loading.value = false
    }
  }

  function reset(): void {
    email.value = ''
    password.value = ''
    errorMsg.value = ''
    user.value = null
    stopCooldown()
  }

  return { email, password, loading, errorMsg, user, cooldownLeft, submit, reset }
}
