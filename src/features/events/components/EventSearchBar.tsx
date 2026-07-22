import { Input } from '../../../shared/components/form/Input/Input'
import { Select } from '../../../shared/components/form/Select/Select'
import { FilterBar } from '../../../shared/components/layout/FilterBar/FilterBar'
import { CATEGORIES } from '../constants/categories'
import { STATUS_OPTIONS } from '../constants/statuses'
import type { DateRange, EventStatus } from '../types/event.types'

interface Props {
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  category?: string
  onCategoryChange?: (value: string) => void
  status?: string
  onStatusChange?: (value: string) => void
  dateRange?: DateRange
  onDateRangeChange?: (value: DateRange) => void
  showStatus?: boolean
  showDateRange?: boolean
  showCategory?: boolean
}

export function EventSearchBar({
  searchPlaceholder = 'Search events...',
  searchValue = '',
  onSearchChange,
  category = '',
  onCategoryChange,
  status = '',
  onStatusChange,
  dateRange = 'all',
  onDateRangeChange,
  showStatus = false,
  showDateRange = false,
  showCategory = true,
}: Props) {
  return (
    <FilterBar>
      <Input
        type="search"
        placeholder={searchPlaceholder}
        value={searchValue}
        onChange={(e) => onSearchChange?.(e.target.value)}
      />
      {showCategory && (
        <Select value={category} onChange={(e) => onCategoryChange?.(e.target.value)}>
          <option value="">All categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </Select>
      )}
      {showStatus && (
        <Select value={status} onChange={(e) => onStatusChange?.(e.target.value)}>
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </Select>
      )}
      {showDateRange && (
        <Select value={dateRange} onChange={(e) => onDateRangeChange?.(e.target.value as DateRange)}>
          <option value="all">All dates</option>
          <option value="this_week">This week</option>
          <option value="this_month">This month</option>
          <option value="next_month">Next month</option>
        </Select>
      )}
    </FilterBar>
  )
}
