import * as React from 'react'
import './select.css'

interface SelectProps {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
}

interface SelectContextValue {
  value: string
  onValueChange: (v: string) => void
  open: boolean
  setOpen: (o: boolean) => void
}

const SelectCtx = React.createContext<SelectContextValue | null>(null)

export function Select({ value, onValueChange, children }: SelectProps) {
  const [open, setOpen] = React.useState(false)
  return (
    <SelectCtx.Provider value={{ value, onValueChange, open, setOpen }}>
      <div className="ui-select-root">{children}</div>
    </SelectCtx.Provider>
  )
}

export function SelectTrigger({ className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { 'aria-label'?: string }) {
  const ctx = React.useContext(SelectCtx)!
  return (
    <button
      type="button"
      className={['ui-select-trigger', className].filter(Boolean).join(' ')}
      onClick={() => ctx.setOpen(!ctx.open)}
      {...props}
    >
      {children}
      <span className="ui-select-chevron" aria-hidden>▾</span>
    </button>
  )
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  const ctx = React.useContext(SelectCtx)!
  return <span className="ui-select-value">{ctx.value || placeholder || ''}</span>
}

export function SelectContent({ className, children, align: _align }: React.HTMLAttributes<HTMLDivElement> & { align?: string }) {
  void _align
  const ctx = React.useContext(SelectCtx)!
  const ref = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    if (!ctx.open) return
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) ctx.setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [ctx.open, ctx])
  if (!ctx.open) return null
  return (
    <div ref={ref} className={['ui-select-content', className].filter(Boolean).join(' ')}>
      {children}
    </div>
  )
}

export function SelectItem({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  const ctx = React.useContext(SelectCtx)!
  const active = ctx.value === value
  return (
    <button
      type="button"
      role="option"
      aria-selected={active}
      data-active={active}
      className={['ui-select-item', className].filter(Boolean).join(' ')}
      onClick={() => {
        ctx.onValueChange(value)
        ctx.setOpen(false)
      }}
    >
      {children}
    </button>
  )
}
