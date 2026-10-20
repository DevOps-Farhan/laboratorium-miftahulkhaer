// Jeda minimum agar spinner loading sempat terlihat walau API merespons instan.
// Tanpa ini request localhost selesai dalam puluhan ms dan animasi hanya kedip.

export const MIN_LOADING_MS = 450

export function waitMinLoading(startedAt: number): Promise<void> {
  const rest = MIN_LOADING_MS - (Date.now() - startedAt)
  if (rest <= 0) return Promise.resolve()
  return new Promise((resolve) => setTimeout(resolve, rest))
}
