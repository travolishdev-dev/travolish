/**
 * MarkdownText — lightweight renderer for the subset of Markdown that Gemini produces.
 *
 * Supported:
 *   **bold**        → <strong>
 *   *italic*        → <em>
 *   `inline code`   → <code>
 *   - item / * item → <ul><li>
 *   1. item         → <ol><li>
 *   ## Heading      → bold paragraph (headings 1–3 treated equally)
 *   blank lines     → paragraph spacing via margin
 *
 * Style-agnostic: inherits text colour from parent so it works on both the
 * white assistant bubble (widget) and the dark/light message bubbles
 * (ConversationPage). No Tailwind classes — uses inline margin only.
 */

const INLINE_RE = /(\*\*[^*\n]+\*\*|\*[^*\n]+\*|`[^`\n]+`)/

function renderInline(text) {
  return text.split(INLINE_RE).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={i}>{part.slice(2, -2)}</strong>
    if (part.startsWith('*') && part.endsWith('*'))
      return <em key={i}>{part.slice(1, -1)}</em>
    if (part.startsWith('`') && part.endsWith('`'))
      return (
        <code
          key={i}
          style={{
            background: 'rgba(128,128,128,0.18)',
            borderRadius: '3px',
            padding: '0 0.25em',
            fontSize: '0.88em',
          }}
        >
          {part.slice(1, -1)}
        </code>
      )
    return part
  })
}

export default function MarkdownText({ text }) {
  if (!text) return null

  const lines = text.split('\n')
  const blocks = []
  let i = 0
  let key = 0

  while (i < lines.length) {
    const line = lines[i]

    // Bullet list (- item or * item)
    if (/^[-*] /.test(line)) {
      const items = []
      while (i < lines.length && /^[-*] /.test(lines[i])) {
        items.push(lines[i].slice(2).trim())
        i++
      }
      blocks.push(
        <ul key={key++} style={{ paddingLeft: '1.1em', margin: '0.2em 0' }}>
          {items.map((item, j) => <li key={j}>{renderInline(item)}</li>)}
        </ul>
      )
      continue
    }

    // Numbered list (1. item)
    if (/^\d+\. /.test(line)) {
      const items = []
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\. /, '').trim())
        i++
      }
      blocks.push(
        <ol key={key++} style={{ paddingLeft: '1.1em', margin: '0.2em 0' }}>
          {items.map((item, j) => <li key={j}>{renderInline(item)}</li>)}
        </ol>
      )
      continue
    }

    // Heading (# / ## / ###) — rendered as a bold paragraph
    if (/^#{1,3} /.test(line)) {
      const content = line.replace(/^#{1,3} /, '')
      blocks.push(
        <p key={key++} style={{ fontWeight: 600, margin: '0.2em 0' }}>
          {renderInline(content)}
        </p>
      )
      i++
      continue
    }

    // Blank line — skip; paragraph margin provides visual gap
    if (line.trim() === '') {
      i++
      continue
    }

    // Regular paragraph
    blocks.push(
      <p key={key++} style={{ margin: '0.2em 0' }}>
        {renderInline(line)}
      </p>
    )
    i++
  }

  return <>{blocks}</>
}
