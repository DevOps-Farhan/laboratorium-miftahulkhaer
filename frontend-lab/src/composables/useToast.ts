import { ref } from 'vue'

export type ToastType = 'success' | 'error'

export interface ToastState {
  id: number
  message: string
  type: ToastType
  duration: number
}

// State disimpan di module scope supaya satu toast aktif untuk seluruh app.
const toast = ref<ToastState | null>(null)
let timer: ReturnType<typeof setTimeout> | null = null
let seq = 0

export function useToast() {
  function notify(message: string, type: ToastType = 'success', duration = 3200): void {
    if (timer) clearTimeout(timer)
    seq += 1
    toast.value = { id: seq, message, type, duration }
    timer = setTimeout(() => {
      toast.value = null
      timer = null
    }, duration)
  }

  function hide(): void {
    if (timer) clearTimeout(timer)
    timer = null
    toast.value = null
  }

  return { toast, notify, hide }
}
