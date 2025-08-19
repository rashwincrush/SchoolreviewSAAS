
export type ToastType = 'success' | 'error' | 'info'

let container: HTMLDivElement | null = null

function ensureContainer() {
  if (!container) {
    container = document.createElement('div')
    container.setAttribute('data-sr-toast-root', 'true')
    Object.assign(container.style, {
      position: 'fixed',
      top: '16px',
      right: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      zIndex: 9999,
      pointerEvents: 'none'
    })
    document.body.appendChild(container)
  }
  return container
}

export function toast(message: string, type: ToastType = 'info', timeoutMs = 2500) {
  const root = ensureContainer()
  const el = document.createElement('div')
  Object.assign(el.style, {
    background: type === 'success' ? '#0a7d33' : type === 'error' ? '#b00020' : '#111',
    color: '#fff',
    padding: '10px 12px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    pointerEvents: 'auto',
    fontSize: '14px',
    maxWidth: '360px'
  })
  el.textContent = message
  root.appendChild(el)
  const timer = setTimeout(() => {
    el.style.transition = 'opacity .2s ease'
    el.style.opacity = '0'
    setTimeout(() => el.remove(), 200)
  }, timeoutMs)
  // Allow click to dismiss
  el.addEventListener('click', () => {
    clearTimeout(timer)
    el.remove()
  })
}
