import { useState, useEffect } from 'react'
import CategoryBar from '../components/home/CategoryBar'
import PropertyCard from '../components/home/PropertyCard'
import { properties } from '../data/mockData'

function PropertyCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-square bg-gray-200 rounded-xl mb-3" />
      <div className="space-y-2">
        <div className="flex justify-between">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-8" />
        </div>
        <div className="h-3.5 bg-gray-200 rounded w-2/3" />
        <div className="h-3.5 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-1/4 mt-1" />
      </div>
    </div>
  )
}

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  const handleCategoryChange = (category) => {
    setActiveCategory(category)
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 300)
  }

  const filtered =
    activeCategory === 'all'
      ? properties
      : properties.filter((p) => p.category === activeCategory)

  return (
    <main className="pt-20">
      {/* Sticky Category Bar */}
      <div className="sticky top-20 z-40 bg-white border-b border-gray-100">
        <div className="max-w-[1760px] mx-auto px-6 md:px-10 xl:px-20">
          <CategoryBar active={activeCategory} onChange={handleCategoryChange} />
        </div>
      </div>

      {/* Property Grid */}
      <div className="max-w-[1760px] mx-auto px-6 md:px-10 xl:px-20 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-6 gap-y-10">
            {Array.from({ length: 12 }).map((_, i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-6xl mb-4">🏠</div>
            <h2 className="text-xl font-semibold text-dark mb-2">No places found</h2>
            <p className="text-muted text-sm max-w-md">
              Try adjusting your search or exploring a different category to find amazing places to stay.
            </p>
            <button
              onClick={() => handleCategoryChange('all')}
              className="mt-6 px-6 py-2.5 bg-dark text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors"
            >
              Show all homes
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-6 gap-y-10">
            {filtered.map((property, index) => (
              <PropertyCard key={property.id} property={property} index={index} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}