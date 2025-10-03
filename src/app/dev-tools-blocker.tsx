'use client'

import { useEffect } from 'react'

const checkDevTools = () => {
  let devToolsDetected = false

  if (window.outerWidth - window.innerWidth > 100) {
    devToolsDetected = true
  }

  const start = performance.now()
  debugger
  if (performance.now() - start > 100) {
    devToolsDetected = true
  }

  return devToolsDetected
}

const DevToolsBlocker: React.FC = () => {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return
    const overlayId = 'devtools-blocker-overlay'

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i')) ||
        (e.metaKey && e.altKey && (e.key === 'I' || e.key === 'i'))
      ) {
        e.preventDefault()
      }
    }

    const showOverlay = () => {
      if (!document.getElementById(overlayId)) {
        const overlay = document.createElement('div')
        overlay.id = overlayId
        overlay.style.position = 'fixed'
        overlay.style.top = '0'
        overlay.style.left = '0'
        overlay.style.width = '100%'
        overlay.style.height = '100%'
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.9)'
        overlay.style.color = 'red'
        overlay.style.display = 'flex'
        overlay.style.justifyContent = 'center'
        overlay.style.alignItems = 'center'
        overlay.style.fontSize = '30px'
        overlay.style.zIndex = '9999'
        overlay.innerText = 'DevTools đang mở. Vui lòng tắt DevTools để tiếp tục.'
        document.body.appendChild(overlay)
      }
    }

    const hideOverlay = () => {
      const overlay = document.getElementById(overlayId)
      if (overlay) {
        overlay.remove()
      }
    }

    const interval = setInterval(() => {
      if (checkDevTools()) {
        console.warn('%c Dừng lại!', 'color: orange; font-size: 30px; font-weight: bold;')
        showOverlay()
      } else {
        hideOverlay()
      }
    }, 1000)

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      clearInterval(interval)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return null
}

export default DevToolsBlocker
