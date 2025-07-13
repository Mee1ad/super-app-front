"use client"

import * as React from "react"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    const handleClick = () => {
      onCheckedChange?.(!checked);
    };

    return (
      <div 
        ref={ref}
        className={cn(
          "h-4 w-4 shrink-0 rounded-sm border-2 transition-colors cursor-pointer flex items-center justify-center",
          checked 
            ? "bg-blue-600 border-blue-600" 
            : "bg-white border-gray-300 hover:border-gray-400",
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {checked && (
          <Check className="h-3 w-3 text-white" />
        )}
      </div>
    )
  }
)
Checkbox.displayName = "Checkbox"

export { Checkbox } 