<script setup lang="ts">
import { useToast } from '../composables/useToast'

const { toast } = useToast()
</script>

<template>
  <div class="toast-layer" aria-live="polite">
    <Transition name="toast" mode="out-in">
      <div
        v-if="toast"
        :key="toast.id"
        class="toast"
        :class="toast.type"
        role="status"
      >
        <span class="ico" aria-hidden="true">
          <svg
            v-if="toast.type === 'success'"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.4"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="m5.5 12.4 4.4 4.4 8.6-9.4" />
          </svg>
          <svg
            v-else
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M12 7.4v5.4" />
            <path d="M12 16.4h.01" />
          </svg>
        </span>
        <span class="msg">{{ toast.message }}</span>
        <span
          class="bar"
          :style="{ '--dur': `${toast.duration}ms` }"
          aria-hidden="true"
        ></span>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.toast-layer {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: grid;
  place-items: center;
  padding: 20px;
  pointer-events: none;
}

.toast {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: min(430px, 92vw);
  padding: 13px 22px 15px 14px;
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--card-soft);
  box-shadow: var(--shadow-2);
  backdrop-filter: blur(20px) saturate(150%);
  -webkit-backdrop-filter: blur(20px) saturate(150%);
}

.ico {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  flex: 0 0 auto;
  border-radius: 50%;
  color: #fff;
}
.ico svg {
  width: 18px;
  height: 18px;
}
.toast.success .ico {
  background: linear-gradient(140deg, #3bbd87, #1f8f63);
  box-shadow: 0 8px 16px -8px rgba(31, 143, 99, 0.9);
}
.toast.error .ico {
  background: linear-gradient(140deg, #e5736a, #c9433f);
  box-shadow: 0 8px 16px -8px rgba(201, 67, 63, 0.9);
}

.msg {
  font-size: 14.5px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--ink);
}

.bar {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 3px;
  transform-origin: left center;
  animation-name: shrink;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
  animation-duration: var(--dur, 3200ms);
}
.toast.success .bar {
  background: linear-gradient(90deg, #1f8f63, #7bd7b0);
}
.toast.error .bar {
  background: linear-gradient(90deg, #c9433f, #f0a49e);
}

/* Animasi masuk: pop lembut dari bawah, keluar: mengecil + memudar */
.toast-enter-active {
  transition: opacity 0.26s ease, transform 0.4s cubic-bezier(0.2, 1.35, 0.4, 1);
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(18px) scale(0.88);
}
.toast-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}
.toast-leave-to {
  opacity: 0;
  transform: scale(0.94);
}

@keyframes shrink {
  to {
    transform: scaleX(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .toast-enter-active,
  .toast-leave-active {
    transition-duration: 0.01ms;
  }
  .bar {
    animation: none;
  }
}
</style>
