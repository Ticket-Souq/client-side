interface Props {
  categories: readonly string[]
  selected: string[]
  onChange: (selected: string[]) => void
}

export function CategoryChips({ categories, selected, onChange }: Props) {
  const toggle = (cat: string) => {
    if (selected.includes(cat)) {
      onChange(selected.filter((c) => c !== cat))
    } else {
      onChange([...selected, cat])
    }
  }

  return (
    <div className="events-category-chips">
      {categories.map((cat) => (
        <button
          key={cat}
          type="button"
          className={`events-category-chip${selected.includes(cat) ? ' active' : ''}`}
          onClick={() => toggle(cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}
