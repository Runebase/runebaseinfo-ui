import { useRef, useCallback } from 'react'

/**
 * Returns touch event handlers for swipe left/right gestures.
 * Usage: const swipeHandlers = useSwipeable({ onSwipeLeft, onSwipeRight })
 * Then spread onto a container: <div {...swipeHandlers}>
 */
export function useSwipeable({ onSwipeLeft, onSwipeRight, threshold = 50 }) {
  const touchStartRef = useRef(null)

  const onTouchStart = useCallback((e) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    }
  }, [])

  const onTouchEnd = useCallback((e) => {
    if (!touchStartRef.current) return
    const endX = e.changedTouches[0].clientX
    const endY = e.changedTouches[0].clientY
    const diffX = endX - touchStartRef.current.x
    const diffY = endY - touchStartRef.current.y
    touchStartRef.current = null

    // Only trigger if horizontal movement is dominant
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > threshold) {
      if (diffX < 0) {
        onSwipeLeft?.()
      } else {
        onSwipeRight?.()
      }
    }
  }, [onSwipeLeft, onSwipeRight, threshold])

  return { onTouchStart, onTouchEnd }
}
