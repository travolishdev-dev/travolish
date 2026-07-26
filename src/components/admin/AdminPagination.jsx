// Generates the page number sequence with null as an ellipsis placeholder.
// Always shows first + last page; shows up to 2 pages on each side of current.
function pageRange(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i)

  const near = new Set([
    0,
    total - 1,
    ...Array.from({ length: 5 }, (_, i) => current - 2 + i).filter(
      (p) => p > 0 && p < total - 1,
    ),
  ])

  const sorted = [...near].sort((a, b) => a - b)
  const result = []
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push(null)
    result.push(sorted[i])
  }
  return result
}

export default function AdminPagination({ page, totalPages, totalElements, onPage }) {
  if (!totalPages || totalPages <= 1) return null

  const pages = pageRange(page, totalPages)

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-4 text-xs text-muted">
      <span className="font-semibold tabular-nums">
        Page {page + 1} of {totalPages}
        {totalElements != null ? ` · ${Number(totalElements).toLocaleString()} records` : ''}
      </span>

      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page === 0}
          onClick={() => onPage(page - 1)}
          className="inline-flex h-8 items-center rounded-card border border-gray-200 bg-white px-3 font-semibold transition-colors hover:border-dark disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>

        {pages.map((p, i) =>
          p === null ? (
            <span key={`gap-${i}`} className="flex h-8 w-8 items-center justify-center select-none">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPage(p)}
              className={`inline-flex h-8 w-8 items-center justify-center rounded-card border font-semibold transition-colors ${
                p === page
                  ? 'border-dark bg-dark text-white'
                  : 'border-gray-200 bg-white hover:border-dark'
              }`}
            >
              {p + 1}
            </button>
          ),
        )}

        <button
          type="button"
          disabled={page >= totalPages - 1}
          onClick={() => onPage(page + 1)}
          className="inline-flex h-8 items-center rounded-card border border-gray-200 bg-white px-3 font-semibold transition-colors hover:border-dark disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  )
}
