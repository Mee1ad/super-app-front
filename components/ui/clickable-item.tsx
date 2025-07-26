'use client'

import React from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ClickableItemProps extends Omit<HTMLMotionProps<"div">, "onClick"> {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
}

export function ClickableItem({
  children,
  onClick,
  disabled = false,
  className,
  ...props
}: ClickableItemProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (disabled) return
    e.stopPropagation()
    onClick?.()
  }

  const baseClasses = cn(
    'cursor-pointer transition-all duration-150 ease-out',
    'hover:bg-muted/50 active:bg-muted/30 active:scale-[0.98]',
    'focus:outline-none',
    disabled && 'cursor-not-allowed opacity-50 pointer-events-none',
    className
  )

  return (
    <motion.div
      whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className={baseClasses}
      onClick={handleClick}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Variant for list items (mobile-friendly)
export function ClickableListItem({
  children,
  onClick,
  disabled = false,
  className,
  ...props
}: ClickableItemProps) {
  return (
    <ClickableItem
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'py-4 px-4',
        className
      )}
      {...props}
    >
      {children}
    </ClickableItem>
  )
}

// Variant for cards
export function ClickableCard({
  children,
  onClick,
  disabled = false,
  className,
  ...props
}: ClickableItemProps) {
  return (
    <ClickableItem
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'rounded-lg border bg-card text-card-foreground shadow-sm',
        'hover:shadow-md',
        className
      )}
      {...props}
    >
      {children}
    </ClickableItem>
  )
} 