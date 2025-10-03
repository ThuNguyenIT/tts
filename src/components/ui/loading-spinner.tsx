'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

const defaultSpinnerColors = {
  border: 'gray-200',
  borderTop: 'gray-900',
  size: 'w-10 h-10',
}

const spinnerVariants = 'w-10 h-10 border-4 border-t-4 border-gray-200 border-t-gray-600 rounded-full animate-spin'

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  size?: number | string
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>((props, ref) => {
  const { className, size, ...rest } = props
  const borderStyle = cn(`${spinnerVariants}`)
  const sizeStyle = size ? `h-${size} w-${size}` : defaultSpinnerColors.size
  return <div ref={ref} className={cn(spinnerVariants, className, borderStyle, sizeStyle)} {...rest} />
})

LoadingSpinner.displayName = 'LoadingSpinner'

export { LoadingSpinner }
