import { useState, useRef, type KeyboardEvent } from 'react'

interface Props {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
}

export function TagInput({ tags, onChange, placeholder = 'Add a tag and press Enter...' }: Props) {
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const addTag = () => {
    const trimmed = input.trim()
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed])
    }
    setInput('')
  }

  const removeTag = (tag: string) => {
    onChange(tags.filter((t) => t !== tag))
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
    if (e.key === 'Backspace' && !input && tags.length > 0) {
      removeTag(tags[tags.length - 1])
    }
  }

  return (
    <div className="events-tag-input-wrap" onClick={() => inputRef.current?.focus()}>
      {tags.map((tag) => (
        <span key={tag} className="events-tag-pill">
          {tag}
          <button type="button" onClick={() => removeTag(tag)}>&times;</button>
        </span>
      ))}
      <input
        ref={inputRef}
        className="events-tag-input"
        placeholder={tags.length === 0 ? placeholder : ''}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  )
}
