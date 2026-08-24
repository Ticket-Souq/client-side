import * as React from 'react'
import { ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts'
import type { TooltipProps } from 'recharts'
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'
import './chart.css'

export type ChartConfig = Record<string, { label?: string; color?: string; icon?: React.ComponentType }>

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig
  id?: string
}

export function ChartContainer({ config: _config, className, children, ...props }: ChartContainerProps) {
  void _config
  return (
    <div className={['ui-chart-container', className].filter(Boolean).join(' ')} {...props}>
      <ResponsiveContainer width="100%" height="100%">
        {children as React.ReactElement}
      </ResponsiveContainer>
    </div>
  )
}

export function ChartStyle({ id, config }: { id: string; config: ChartConfig }) {
  const css = Object.entries(config)
    .filter(([, v]) => v.color)
    .map(([key, v]) => `  --color-${key}: ${v.color};`)
    .join('\n')
  if (!css) return null
  return <style data-chart-style={id}>{`[data-chart="${id}"] {\n${css}\n}`}</style>
}

export function ChartTooltip(props: TooltipProps<ValueType, NameType>) {
  return <RechartsTooltip {...props} />
}

interface ChartTooltipContentProps {
  active?: boolean
  payload?: Array<{ value: ValueType; name: NameType; color?: string; dataKey?: string; payload?: Record<string, unknown> }>
  label?: unknown
  hideLabel?: boolean
  hideIndicator?: boolean
  nameKey?: string
  labelFormatter?: (label: unknown, payload: unknown[]) => React.ReactNode
  formatter?: (value: ValueType, name: NameType, item: unknown, index: number, payload: unknown) => React.ReactNode
  className?: string
  color?: string
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  hideLabel,
  hideIndicator,
  nameKey,
  labelFormatter,
  formatter,
  className,
}: ChartTooltipContentProps) {
  if (!active || !payload || payload.length === 0) return null

  const labelNode = !hideLabel && label != null
    ? (labelFormatter ? labelFormatter(label, payload) : String(label))
    : null

  return (
    <div className={['ui-chart-tooltip', className].filter(Boolean).join(' ')}>
      {labelNode && <div className="ui-chart-tooltip-label">{labelNode}</div>}
      <div className="ui-chart-tooltip-items">
        {payload.map((item, idx) => {
          const key = String(item.dataKey ?? item.name ?? idx)
          const displayName = nameKey && item.payload && typeof item.payload === 'object' && nameKey in (item.payload as Record<string, unknown>)
            ? String((item.payload as Record<string, unknown>)[nameKey])
            : String(item.name ?? key)
          const valueNode = formatter ? formatter(item.value, item.name, item, idx, item.payload as unknown) : String(item.value)
          return (
            <div key={idx} className="ui-chart-tooltip-row">
              {!hideIndicator && <span className="ui-chart-tooltip-dot" style={{ background: item.color }} />}
              <span className="ui-chart-tooltip-name">{displayName}</span>
              <span className="ui-chart-tooltip-value">{valueNode}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
