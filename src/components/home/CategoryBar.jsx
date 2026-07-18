import { useRef, useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { categories } from '../../data/mockData'

export default function CategoryBar({ active, onChange }) {
  const scrollRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScroll = () => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 0)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)
  }

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    checkScroll()
    el.addEventListener('scroll', checkScroll)
    window.addEventListener('resize', checkScroll)
    return () => {
      el.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
    }
  }, [])

  const scroll = (direction) => {
    const el = scrollRef.current
    if (!el) return
    const supportsSmooth = 'scrollBehavior' in document.documentElement.style
    if (supportsSmooth) {
      el.scrollBy({ left: direction * 300, behavior: 'smooth' })
    } else {
      const start = el.scrollLeft
      const target = start + direction * 300
      const duration = 280
      let startTime = null
      const step = (timestamp) => {
        if (!startTime) startTime = timestamp
        const progress = Math.min((timestamp - startTime) / duration, 1)
        const ease = progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2
        el.scrollLeft = start + (target - start) * ease
        if (progress < 1) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    }
  }

  return (
    <div className="relative">
      {/* Gradient fades */}
      {canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      )}
      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
      )}

      {/* Scroll Buttons */}
      {canScrollLeft && (
        <button
          onClick={() => scroll(-1)}
          className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white border border-gray-300 rounded-full items-center justify-center shadow-sm hover:shadow-md hover:scale-105 transition-all"
        >
          <ChevronLeft size={16} />
        </button>
      )}
      {canScrollRight && (
        <button
          onClick={() => scroll(1)}
          className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white border border-gray-300 rounded-full items-center justify-center shadow-sm hover:shadow-md hover:scale-105 transition-all"
        >
          <ChevronRight size={16} />
        </button>
      )}

      {/* Categories */}
      <div
        ref={scrollRef}
        className="flex items-center gap-8 overflow-x-auto overscroll-x-contain hide-scrollbar py-4 px-2"
      >
        {categories.map((cat) => {
          const Icon = cat.icon
          const isActive = active === cat.id
          return (
            <button
              key={cat.id}
              onClick={() => onChange(cat.id)}
              className={`flex flex-col items-center gap-2 min-w-fit pb-2 border-b-2 transition-all duration-200 group ${
                isActive
                  ? 'border-dark text-dark'
                  : 'border-transparent text-muted hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon
                size={24}
                strokeWidth={1.5}
                className={`transition-all ${isActive ? 'text-dark' : 'text-gray-500 group-hover:text-gray-700'}`}
              />
              <span className={`text-xs whitespace-nowrap ${isActive ? 'font-semibold' : 'font-medium'}`}>
                {cat.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
