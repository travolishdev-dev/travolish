import { useEffect, useRef } from 'react'

export function useAndroidBackClose(isOpen, onClose) {
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (!isOpen) return
    history.pushState({ overlayOpen: true }, '')
    const handlePop = () => onCloseRef.current()
    window.addEventListener('popstate', handlePop)
    return () => {
      window.removeEventListener('popstate', handlePop)
      if (history.state?.overlayOpen) history.back()
    }
  }, [isOpen])
}
