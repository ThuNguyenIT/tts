'use client'

import { Toaster as Sonner } from 'sonner'

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme='light'
      className='toaster group'
      toastOptions={{
        classNames: {
          toast: 'group toast bg-white text-black border border-border shadow-lg',
          title: 'text-black font-semibold',
          description: 'text-black/80',
          actionButton: 'bg-primary text-primary-foreground hover:brightness-110',
          cancelButton: 'bg-muted text-black hover:brightness-110',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
