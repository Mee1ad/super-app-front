// Calendar component based on shadcn/ui
// https://ui.shadcn.com/docs/components/calendar

import * as React from "react"
import { DayPicker } from "react-day-picker"
import "react-day-picker/dist/style.css"

export interface CalendarProps {
  mode: "single"
  selected: Date | undefined
  onSelect: (date: Date | undefined) => void
  initialFocus?: boolean
  className?: string
  captionLayout?: "dropdown" | "label" | "dropdown-months" | "dropdown-years"
}

export function Calendar({ mode, selected, onSelect, initialFocus, className, captionLayout }: CalendarProps) {
  return (
    <DayPicker
      mode={mode}
      selected={selected}
      onSelect={onSelect}
      initialFocus={initialFocus}
      className={className}
      captionLayout={captionLayout}
    />
  )
} 