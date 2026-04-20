import { useState } from 'react'
import { ChevronLeft, ChevronRight, X, Grid3X3 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ImageGallery({ images, title }) {
  const [showModal, setShowModal] = useState(false)
  const [modalIndex, setModalIndex] = useState(0)

  const openModal = (index) => {
    setModalIndex(index)
    setShowModal(true)
    document.body.style.overflow = 'hidden'
  }

  const closeModal = () => {
    setShowModal(false)
    document.body.style.overflow = ''
  }

  const navigate = (dir) => {
    setModalIndex((prev) => (prev + dir + images.length) % images.length)
  }

  return (
    <>
      {/* Desktop Grid */}
      <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-2 rounded-2xl overflow-hidden h-[420px] cursor-pointer group relative">
        {/* Main Image */}
        <div className="col-span-2 row-span-2" onClick={() => openModal(0)}>
          <img
            src={images[0]}
            alt={title}
            className="w-full h-full object-cover hover:brightness-90 transition-all duration-300"
          />
        </div>
        {images.slice(1, 5).map((img, i) => (
          <div key={i} onClick={() => openModal(i + 1)}>
            <img
              src={img}
              alt={`${title} ${i + 2}`}
              className="w-full h-full object-cover hover:brightness-90 transition-all duration-300"
            />
          </div>
        ))}

        {/* Show all photos button */}
        <button
          onClick={() => openModal(0)}
          className="absolute bottom-4 right-4 flex items-center gap-2 bg-white border border-dark text-dark text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
        >
          <Grid3X3 size={16} />
          Show all photos
        </button>
      </div>

      {/* Mobile Carousel */}
      <MobileCarousel images={images} title={title} onImageClick={openModal} />

      {/* Full-screen Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-[200] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 text-white">
              <button
                onClick={closeModal}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <X size={24} />
              </button>
              <span className="text-sm font-medium">
                {modalIndex + 1} / {images.length}
              </span>
              <div className="w-10" />
            </div>

            {/* Image */}
            <div className="flex-1 flex items-center justify-center px-4 relative">
              <motion.img
                key={modalIndex}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                src={images[modalIndex]}
                alt={`${title} ${modalIndex + 1}`}
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />

              {/* Arrows */}
              <button
                onClick={() => navigate(-1)}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <ChevronLeft size={20} className="text-white" />
              </button>
              <button
                onClick={() => navigate(1)}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <ChevronRight size={20} className="text-white" />
              </button>
            </div>

            {/* Thumbnails */}
            <div className="flex items-center justify-center gap-2 p-4 overflow-x-auto hide-scrollbar">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setModalIndex(i)}
                  className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden transition-all ${
                    i === modalIndex ? 'ring-2 ring-white opacity-100' : 'opacity-50 hover:opacity-75'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function MobileCarousel({ images, title, onImageClick }) {
  const [current, setCurrent] = useState(0)

  return (
    <div className="md:hidden relative">
      <div className="aspect-[4/3] rounded-xl overflow-hidden">
        <img
          src={images[current]}
          alt={title}
          onClick={() => onImageClick(current)}
          className="w-full h-full object-cover cursor-pointer"
        />
      </div>
      {current > 0 && (
        <button
          onClick={() => setCurrent((p) => p - 1)}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md"
        >
          <ChevronLeft size={16} />
        </button>
      )}
      {current < images.length - 1 && (
        <button
          onClick={() => setCurrent((p) => p + 1)}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md"
        >
          <ChevronRight size={16} />
        </button>
      )}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {images.map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full ${
              i === current ? 'bg-white' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
