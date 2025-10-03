import { LoadingSpinner } from '@/components/ui/loading-spinner'

export function LoadingBackDrop() {
  return (
    <div className='z-50 flex justify-center items-center h-screen'>
      <LoadingSpinner />
    </div>
  )
}
