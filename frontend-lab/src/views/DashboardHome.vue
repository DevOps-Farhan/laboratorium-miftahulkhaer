<script setup lang="ts">
import { computed } from 'vue'
import { MENU_ITEMS, type MenuItem, type MenuKey } from '../lib/menu'
import type { LoginData } from '../types/auth'
import MenuIcon from '../components/MenuIcon.vue'

const props = withDefaults(
  defineProps<{
    user: LoginData
    items?: MenuItem[]
  }>(),
  { items: () => MENU_ITEMS },
)

const emit = defineEmits<{ select: [key: MenuKey] }>()

const cards = computed(() => props.items.filter((m) => m.key !== 'dashboard'))
</script>

<template>
  <section class="home">
    <div class="hero">
      <div class="hero-text">
        <p class="eyebrow">Selamat datang kembali</p>
        <h2 class="greet">Halo, {{ user.name ?? user.email }}</h2>
        <p class="sub">Pilih modul di sidebar atau kartu di bawah untuk mulai mengelola.</p>
      </div>
      <span class="hero-art" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10 3.5v5.7l-4.9 9.2A2 2 0 0 0 6.8 21.5h10.4a2 2 0 0 0 1.7-3.1L14 9.2V3.5" />
          <path d="M8.6 3.5h6.8" />
          <path d="M7.5 15h9" />
        </svg>
      </span>
    </div>

    <div class="grid">
      <button v-for="m in cards" :key="m.key" class="card" @click="emit('select', m.key)">
        <span class="ico"><MenuIcon :name="m.key" /></span>
        <strong>{{ m.label }}</strong>
        <span class="desc">{{ m.desc }}</span>
        <span class="go" aria-hidden="true">→</span>
      </button>
    </div>
  </section>
</template>

<style scoped>
.home {
  display: grid;
  gap: 20px;
}

.hero {
  position: relative;
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 26px 28px;
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: var(--r-lg);
  background:
    radial-gradient(120% 140% at 0% 0%, var(--brand-soft), transparent 60%),
    var(--card-soft);
  box-shadow: var(--shadow-1);
  backdrop-filter: blur(16px) saturate(140%);
  -webkit-backdrop-filter: blur(16px) saturate(140%);
}
.hero-text {
  min-width: 0;
}
.eyebrow {
  margin: 0 0 5px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--brand-ink);
  opacity: 0.85;
}
.greet {
  margin: 0;
  color: var(--ink);
}
.sub {
  margin: 7px 0 0;
  max-width: 56ch;
  font-size: 14.5px;
  line-height: 1.55;
  color: var(--muted);
}
.hero-art {
  margin-left: auto;
  display: grid;
  place-items: center;
  width: 78px;
  height: 78px;
  flex: 0 0 auto;
  border-radius: 24px;
  color: var(--brand);
  background: linear-gradient(140deg, var(--brand-soft), transparent 70%),
    var(--field);
  border: 1px solid var(--line);
  transform: rotate(-6deg);
}
.hero-art svg {
  width: 40px;
  height: 40px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 14px;
}

.card {
  position: relative;
  display: grid;
  gap: 6px;
  text-align: left;
  padding: 18px;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: var(--card-soft);
  box-shadow: var(--shadow-1);
  cursor: pointer;
  font-family: inherit;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease,
    background 0.2s ease;
}
.card .ico {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  margin-bottom: 4px;
  border-radius: var(--r-md);
  background: var(--brand-soft);
  color: var(--brand-ink);
  font-size: 19px;
  transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;
}
.card strong {
  font-size: 15.5px;
  font-weight: 600;
  color: var(--ink);
  letter-spacing: -0.2px;
}
.card .desc {
  font-size: 13px;
  line-height: 1.45;
  color: var(--muted);
}
.card .go {
  position: absolute;
  top: 18px;
  right: 18px;
  font-size: 16px;
  color: var(--muted);
  opacity: 0;
  transform: translateX(-6px);
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.card:hover {
  transform: translateY(-4px);
  border-color: rgba(109, 90, 224, 0.4);
  background: var(--card);
  box-shadow: var(--shadow-2);
}
.card:hover .ico {
  background: linear-gradient(140deg, var(--brand-2), var(--brand));
  color: #fff;
  transform: scale(1.05);
}
.card:hover .go {
  opacity: 1;
  transform: none;
  color: var(--brand-ink);
}
.card:active {
  transform: translateY(-1px);
}
.card:focus-visible {
  outline: 2px solid var(--brand);
  outline-offset: 2px;
}
</style>
