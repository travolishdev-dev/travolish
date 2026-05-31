import { createElement } from 'react'

const letters = 'travolish'.split('')

export default function TravolishWordmark({
  as = 'span',
  className = '',
  ...props
}) {
  return createElement(
    as,
    {
      className: `travolish-wordmark ${className}`.trim(),
      'aria-label': 'travolish',
      ...props,
    },
    letters.map((letter, index) => (
      <span
        key={`${letter}-${index}`}
        aria-hidden="true"
        className="travolish-wordmark-letter"
        style={{ '--letter-index': index }}
      >
        {letter}
      </span>
    )),
  )
}
