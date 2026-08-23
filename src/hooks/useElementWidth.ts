import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Width of an element, tracked through resize.
 *
 * An SVG chart needs a real pixel width: scaling one viewBox to fill the
 * container either distorts the geometry or forces the height to follow the
 * width, which on a wide desktop row turns a chart into a banner. Measuring
 * lets width and height be chosen independently.
 */
export function useElementWidth<T extends HTMLElement>(): [(node: T | null) => void, number] {
  const [width, setWidth] = useState(0)
  const observer = useRef<ResizeObserver | null>(null)

  const ref = useCallback((node: T | null) => {
    observer.current?.disconnect()
    if (!node) return

    setWidth(node.getBoundingClientRect().width)
    // Guarded: jsdom has no ResizeObserver, and the initial measure above is
    // enough for the tests that only assert on content.
    if (typeof ResizeObserver === 'undefined') return

    observer.current = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width
      if (w != null) setWidth(w)
    })
    observer.current.observe(node)
  }, [])

  useEffect(() => () => observer.current?.disconnect(), [])

  return [ref, width]
}
