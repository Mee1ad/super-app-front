import * as React from "react"

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ children, className = "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", ...props }, ref) => (
    <label ref={ref} className={className} {...props}>
      {children}
    </label>
  )
)
Label.displayName = "Label" 