<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  email: string
  password: string
  loading: boolean
  errorMsg: string
  cooldownLeft?: number
}>()

const emit = defineEmits<{
  'update:email': [value: string]
  'update:password': [value: string]
  submit: []
}>()

const showPass = ref(false)
</script>

<template>
  <section class="login">
    <div class="stage">
      <span class="orb orb-a" aria-hidden="true"></span>
      <span class="orb orb-b" aria-hidden="true"></span>

      <div class="card">
        <header class="head">
          <span class="mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10 3v6l-5 9.5A2 2 0 0 0 6.7 21.5h10.6A2 2 0 0 0 19 18.5L14 9V3" />
              <path d="M8.5 3h7" />
              <path d="M7.4 15h9.2" />
            </svg>
          </span>
          <h1>Masuk ke Lab</h1>
          <p class="sub">Masuk dengan akun teknisi, guru, atau siswa.</p>
        </header>

        <form @submit.prevent="emit('submit')">
          <div class="field">
            <label for="login-email">Email</label>
            <div class="control">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect x="3" y="5" width="18" height="14" rx="3.5" />
                <path d="m3.8 7.6 7.1 5a2.2 2.2 0 0 0 2.4 0l7.1-5" />
              </svg>
              <input
                id="login-email"
                :value="email"
                type="email"
                placeholder="nama@example.com"
                autocomplete="username"
                spellcheck="false"
                @input="emit('update:email', ($event.target as HTMLInputElement).value)"
              />
            </div>
          </div>

          <div class="field">
            <label for="login-pass">Password</label>
            <div class="control">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect x="4" y="10" width="16" height="10.5" rx="3.5" />
                <path d="M8 10V7.4a4 4 0 0 1 8 0V10" />
                <path d="M12 14.4v2.2" />
              </svg>
              <input
                id="login-pass"
                :value="password"
                :type="showPass ? 'text' : 'password'"
                placeholder="min. 8 karakter"
                autocomplete="current-password"
                @input="emit('update:password', ($event.target as HTMLInputElement).value)"
              />
              <button
                class="peek"
                type="button"
                :aria-label="showPass ? 'Sembunyikan password' : 'Tampilkan password'"
                :aria-pressed="showPass"
                @click="showPass = !showPass"
              >
                <svg v-if="showPass" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M3 3l18 18" />
                  <path d="M10.6 6.1A8.7 8.7 0 0 1 12 6c6 0 9.5 6 9.5 6a16 16 0 0 1-3.3 3.9" />
                  <path d="M6.4 8.2A16.4 16.4 0 0 0 2.5 12s3.5 6 9.5 6a8.9 8.9 0 0 0 3.7-.8" />
                  <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
            </div>
          </div>

          <p v-if="errorMsg" class="error" role="alert" aria-live="polite">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7.6v5" />
              <path d="M12 16.2h.01" />
            </svg>
            <span>{{ errorMsg }}</span>
          </p>

          <button class="submit" type="submit" :disabled="loading || (cooldownLeft ?? 0) > 0">
            <span v-if="loading" class="spin" aria-hidden="true"></span>
            {{ loading ? 'Masuk...' : (cooldownLeft ?? 0) > 0 ? `Tunggu ${cooldownLeft} dtk` : 'Masuk' }}
          </button>
        </form>

        <p class="hint">Belum punya akun? Hubungi admin laboratorium.</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.login {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  overflow-y: auto;
  text-align: left;
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  color: var(--ink);
  background:
    radial-gradient(58% 52% at 10% 15%, rgba(168, 148, 250, 0.28), transparent 62%),
    radial-gradient(52% 48% at 88% 10%, rgba(126, 200, 245, 0.26), transparent 64%),
    radial-gradient(62% 58% at 82% 90%, rgba(250, 196, 210, 0.32), transparent 62%),
    linear-gradient(160deg, #f9f8ff 0%, #f3f8fc 48%, #fdf8f6 100%);

  --ink: #262140;
  --muted: #6f6a88;
  --line: #e9e6f4;
  --field: rgba(255, 255, 255, 0.82);
  --field-ink: #262140;
  --placeholder: #a7a2bd;
  --card-bg: rgba(255, 255, 255, 0.72);
  --card-line: rgba(255, 255, 255, 0.9);
  --accent: #6d5ae0;
  --accent-2: #9281f7;
  --accent-soft: rgba(109, 90, 224, 0.13);
  --card-shadow: 0 34px 60px -30px rgba(58, 47, 110, 0.45), 0 4px 14px -6px rgba(58, 47, 110, 0.12);
}

@media (prefers-color-scheme: dark) {
  .login {
    background:
      radial-gradient(58% 52% at 10% 15%, rgba(124, 102, 224, 0.32), transparent 62%),
      radial-gradient(52% 48% at 88% 10%, rgba(56, 130, 175, 0.28), transparent 64%),
      radial-gradient(62% 58% at 82% 90%, rgba(196, 108, 140, 0.26), transparent 62%),
      linear-gradient(160deg, #171624 0%, #1a1b28 48%, #211a23 100%);

    --ink: #efedf9;
    --muted: #a6a1c0;
    --line: rgba(255, 255, 255, 0.11);
    --field: rgba(255, 255, 255, 0.05);
    --field-ink: #efedf9;
    --placeholder: #7f7a99;
    --card-bg: rgba(32, 31, 46, 0.72);
    --card-line: rgba(255, 255, 255, 0.09);
    --accent: #8b7cf6;
    --accent-2: #a596ff;
    --accent-soft: rgba(139, 124, 246, 0.2);
    --card-shadow: 0 34px 60px -30px rgba(0, 0, 0, 0.75), 0 4px 14px -6px rgba(0, 0, 0, 0.4);
  }
}

.stage {
  position: relative;
  z-index: 0;
  flex: 1 0 auto;
  display: grid;
  place-items: center;
  padding: 40px 24px;
  box-sizing: border-box;
}

.orb {
  position: absolute;
  z-index: 0;
  border-radius: 50%;
  filter: blur(70px);
  opacity: 0.6;
  pointer-events: none;
}
.orb-a {
  width: 340px;
  height: 340px;
  top: -100px;
  left: -90px;
  background: #c4b6ff;
  animation: drift 20s ease-in-out infinite;
}
.orb-b {
  width: 320px;
  height: 320px;
  bottom: -100px;
  right: -80px;
  background: #ffd2bd;
  animation: drift 26s ease-in-out infinite reverse;
}

.card {
  position: relative;
  z-index: 1;
  width: min(420px, 100%);
  padding: 34px 32px 26px;
  box-sizing: border-box;
  background: var(--card-bg);
  border: 1px solid var(--card-line);
  border-radius: 26px;
  box-shadow: var(--card-shadow);
  backdrop-filter: blur(20px) saturate(150%);
  -webkit-backdrop-filter: blur(20px) saturate(150%);
  animation: rise 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.head {
  display: grid;
  justify-items: center;
  text-align: center;
}

.mark {
  display: grid;
  place-items: center;
  width: 54px;
  height: 54px;
  margin-bottom: 16px;
  border-radius: 18px;
  color: #fff;
  background: linear-gradient(140deg, var(--accent-2), var(--accent));
  box-shadow: 0 14px 26px -12px rgba(109, 90, 224, 0.9), inset 0 1px 0 rgba(255, 255, 255, 0.45);
}
.mark svg {
  width: 26px;
  height: 26px;
}

.head h1 {
  margin: 0 0 6px;
  font-family: inherit;
  font-size: 27px;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: -0.5px;
  color: var(--ink);
}

.sub {
  margin: 0;
  max-width: 34ch;
  font-size: 14.5px;
  line-height: 1.55;
  color: var(--muted);
  text-wrap: balance;
}

form {
  display: grid;
  gap: 15px;
  margin-top: 26px;
}

.field {
  display: grid;
  gap: 7px;
}

.field label {
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--muted);
}

.control {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--field);
  border: 1px solid var(--line);
  border-radius: 14px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}
.control:focus-within {
  background: var(--card-bg);
  border-color: rgba(109, 90, 224, 0.55);
  box-shadow: 0 0 0 4px var(--accent-soft);
}
.control .icon {
  position: absolute;
  left: 14px;
  width: 18px;
  height: 18px;
  color: var(--placeholder);
  pointer-events: none;
  transition: color 0.2s ease;
}
.control:focus-within .icon {
  color: var(--accent);
}

.control input {
  flex: 1;
  min-width: 0;
  padding: 13px 14px 13px 42px;
  border: 0;
  border-radius: inherit;
  background: transparent;
  font-family: inherit;
  font-size: 15px;
  line-height: 1.4;
  color: var(--field-ink);
  outline: none;
}
.control input::placeholder {
  color: var(--placeholder);
}
.control:has(.peek) input {
  padding-right: 46px;
}

.peek {
  position: absolute;
  right: 8px;
  display: grid;
  place-items: center;
  padding: 7px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: var(--placeholder);
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
}
.peek:hover {
  background: var(--accent-soft);
  color: var(--accent);
}
.peek svg {
  width: 18px;
  height: 18px;
}

.error {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  margin: 0;
  padding: 11px 13px;
  border: 1px solid rgba(206, 72, 72, 0.25);
  border-radius: 13px;
  background: rgba(206, 72, 72, 0.1);
  color: #a33131;
  font-size: 13.5px;
  line-height: 1.45;
  animation: pop 0.3s ease both;
}
.error svg {
  flex: 0 0 auto;
  width: 17px;
  height: 17px;
  margin-top: 1px;
}
@media (prefers-color-scheme: dark) {
  .error {
    border-color: rgba(255, 130, 130, 0.28);
    background: rgba(255, 120, 120, 0.12);
    color: #ff9d9d;
  }
}

.submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  width: 100%;
  margin-top: 3px;
  padding: 14px 16px;
  border: 0;
  border-radius: 14px;
  background: linear-gradient(135deg, var(--accent-2), var(--accent));
  color: #fff;
  font-family: inherit;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.02em;
  cursor: pointer;
  box-shadow: 0 12px 22px -13px rgba(109, 90, 224, 0.75);
  transition: transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease;
}
.submit:hover:not(:disabled) {
  transform: translateY(-2px);
  filter: brightness(1.04);
  box-shadow: 0 17px 26px -13px rgba(109, 90, 224, 0.85);
}
.submit:active:not(:disabled) {
  transform: translateY(0);
}
.submit:disabled {
  cursor: progress;
  opacity: 0.78;
}
.submit:focus-visible,
.peek:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}

.spin {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.hint {
  margin: 20px 0 0;
  padding-top: 17px;
  border-top: 1px solid var(--line);
  text-align: center;
  font-size: 13px;
  color: var(--muted);
  text-wrap: balance;
}

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(18px) scale(0.985);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes pop {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes drift {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(40px, 34px, 0) scale(1.12);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .card,
  .error,
  .orb {
    animation: none;
  }
  .submit {
    transition: none;
  }
}
</style>
