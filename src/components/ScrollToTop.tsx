import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Restaura o scroll para o topo a cada navegação de página. */
export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])

  return null
}
