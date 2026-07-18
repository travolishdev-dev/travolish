import { useRef } from 'react'
import { Upload, X } from 'lucide-react'

const MAX_PHOTOS_PER_BUCKET = 10

const BUCKETS = [
  { id: 'cover', label: 'Cover Photo', single: true, hint: 'Main photo shown in search results' },
  { id: 'property', label: 'Property Photos', hint: 'Exterior and general interior shots' },
  { id: 'room', label: 'Room Photos', hint: 'All room types' },
  { id: 'bathroom', label: 'Bathroom Photos' },
  { id: 'restaurant', label: 'Restaurant Photos' },
  { id: 'pool', label: 'Pool Photos' },
  { id: 'lobby', label: 'Lobby Photos' },
  { id: 'drone', label: 'Drone / Aerial Photos' },
]

function BucketUploader({ bucket, photos = [], onAdd, onRemove, onTitleChange }) {
  const ref = useRef(null)
  const atLimit = !bucket.single && photos.length >= MAX_PHOTOS_PER_BUCKET

  function handlePick(e) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    const picked = (bucket.single ? files.slice(0, 1) : files).map((f, i) => ({
      id: `${bucket.id}-${f.name}-${i}-${Date.now()}`,
      preview: URL.createObjectURL(f),
      file: f,
      title: '',
    }))
    const merged = bucket.single ? picked : [...photos, ...picked]
    onAdd(bucket.single ? merged : merged.slice(0, MAX_PHOTOS_PER_BUCKET))
    e.target.value = ''
  }

  const slots = bucket.single ? photos.slice(0, 1) : photos

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200">
      <div className="flex items-center justify-between bg-gray-50 px-5 py-3.5">
        <div>
          <span className="text-sm font-semibold text-dark">{bucket.label}</span>
          {bucket.hint && (
            <span className="ml-2 text-xs text-muted">{bucket.hint}</span>
          )}
        </div>
        <span className={`text-xs ${atLimit ? 'font-semibold text-amber-600' : 'text-muted'}`}>
          {slots.length}{!bucket.single && `/${MAX_PHOTOS_PER_BUCKET}`} photo{slots.length !== 1 ? 's' : ''}
          {atLimit && ' (limit reached)'}
        </span>
      </div>

      <div className="p-4 space-y-3">
        <input
          ref={ref}
          type="file"
          accept="image/*"
          multiple={!bucket.single}
          onChange={handlePick}
          className="hidden"
        />

        {(!bucket.single || slots.length === 0) && !atLimit && (
          <button
            type="button"
            onClick={() => ref.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 px-4 py-6 text-center transition-colors hover:border-gray-500"
          >
            <Upload size={20} className="text-gray-400" />
            <span className="text-sm font-semibold text-dark">
              {bucket.single ? 'Upload photo' : 'Add photos'}
            </span>
          </button>
        )}

        {atLimit && (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
            Maximum of {MAX_PHOTOS_PER_BUCKET} photos per section. Remove a photo to add a new one.
          </p>
        )}

        {slots.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {slots.map((photo) => (
              <div key={photo.id} className="space-y-1.5">
                <div className="group relative aspect-square overflow-hidden rounded-xl">
                  <img
                    src={photo.preview}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => onRemove(bucket.id, photo.id)}
                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 shadow-sm transition-opacity md:opacity-0 md:group-hover:opacity-100"
                  >
                    <X size={13} />
                  </button>
                </div>
                <input
                  type="text"
                  value={photo.title}
                  onChange={(e) => onTitleChange(bucket.id, photo.id, e.target.value)}
                  placeholder="Image title (optional)"
                  className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-dark outline-none focus:border-dark"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function PhotoUploader({ value = {}, onChange }) {
  function handleAdd(bucketId, updatedPhotos) {
    onChange({ ...value, [bucketId]: updatedPhotos })
  }

  function handleRemove(bucketId, photoId) {
    onChange({
      ...value,
      [bucketId]: (value[bucketId] ?? []).filter((p) => p.id !== photoId),
    })
  }

  function handleTitleChange(bucketId, photoId, title) {
    onChange({
      ...value,
      [bucketId]: (value[bucketId] ?? []).map((p) =>
        p.id === photoId ? { ...p, title } : p
      ),
    })
  }

  return (
    <div className="space-y-3">
      {BUCKETS.map((bucket) => (
        <BucketUploader
          key={bucket.id}
          bucket={bucket}
          photos={value[bucket.id] ?? []}
          onAdd={(photos) => handleAdd(bucket.id, photos)}
          onRemove={handleRemove}
          onTitleChange={handleTitleChange}
        />
      ))}
    </div>
  )
}
