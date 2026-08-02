import { useCallback, useState } from 'react'
import type { ReactNode } from 'react'
import { Modal } from '../components/form/Modal/Modal'

export interface ConfirmOptions {
  title: string
  message: ReactNode
  confirmLabel: string
  cancelLabel: string
  danger: boolean
}

export function useConfirm() {
  const [options, setOptions] = useState<ConfirmOptions | null>(null)
  const [resolve, setResolve] = useState<((ok: boolean) => void) | null>(null)

  const confirm = useCallback((message: ReactNode, opts: Partial<ConfirmOptions> = {}): Promise<boolean> => {
    return new Promise((res) => {
      setResolve(() => res)
      setOptions({
        title: 'Confirm',
        message,
        confirmLabel: 'Confirm',
        cancelLabel: 'Cancel',
        danger: false,
        ...opts,
      })
    })
  }, [])

  const close = useCallback((ok: boolean) => {
    setOptions(null)
    resolve?.(ok)
    setResolve(null)
  }, [resolve])

  const dialog = options ? (
    <Modal
      open
      onClose={() => close(false)}
      title={options.title}
      actions={
        <>
          <button className="btn btn-ghost btn-sm" onClick={() => close(false)}>
            {options.cancelLabel}
          </button>
          <button
            className={`btn ${options.danger ? 'btn-danger' : 'btn-primary'} btn-sm`}
            onClick={() => close(true)}
          >
            {options.confirmLabel}
          </button>
        </>
      }
    >
      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: 'var(--text-secondary)' }}>
        {options.message}
      </p>
    </Modal>
  ) : null

  return { confirm, dialog }
}
