let count = 0
let listener: ((loading: boolean) => void) | null = null
let timer: ReturnType<typeof setTimeout> | null = null
const DELAY = 300

export function showLoading() {
  count++
  if (count === 1 && !timer) {
    timer = setTimeout(() => {
      timer = null
      if (count > 0) listener?.(true)
    }, DELAY)
  }
}

export function hideLoading() {
  count--
  if (count <= 0) {
    count = 0
    if (timer) { clearTimeout(timer); timer = null }
    listener?.(false)
  }
}

export function onLoadingChange(fn: (loading: boolean) => void) {
  listener = fn
  return () => { listener = null }
}
