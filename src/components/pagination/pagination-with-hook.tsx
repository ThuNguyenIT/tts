import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PAGE_SIZE_OPTIONS } from '@/constants/pagination'
import type { UsePaginateReturn } from '@/types'

interface PaginationWithHookProps<T> {
  pagination: UsePaginateReturn<T>
  showRowsPerPage?: boolean
  showPageInfo?: boolean
  className?: string
}

export function PaginationWithHook<T>({
  pagination,
  showRowsPerPage = true,
  showPageInfo = true,
  className = '',
}: PaginationWithHookProps<T>) {
  const { paginationInfo, setPageSize, nextPage, previousPage, goToFirstPage, goToLastPage } = pagination

  return (
    <div className={`flex flex-wrap justify-between items-center pt-4 w-full gap-y-3 ${className}`}>
      {/* Left: RowsPerPage */}
      {showRowsPerPage && (
        <div className='flex items-center space-x-2'>
          <p className='whitespace-nowrap text-sm font-medium'>Số dòng trên trang</p>
          <Select value={`${paginationInfo.pageSize}`} onValueChange={(value) => setPageSize(Number(value))}>
            <SelectTrigger className='h-8 w-[70px]'>
              <SelectValue placeholder={paginationInfo.pageSize} />
            </SelectTrigger>
            <SelectContent side='top'>
              {PAGE_SIZE_OPTIONS.map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Center: Page Of */}
      {showPageInfo && (
        <div className='flex w-[100px] items-center justify-center text-sm font-medium'>
          Trang {paginationInfo.currentPage} của {paginationInfo.totalPages}
        </div>
      )}

      {/* Right: Pagination buttons */}
      <div className='flex items-center space-x-2 w-full sm:w-auto sm:justify-end justify-end'>
        <Button
          type='button'
          variant='outline'
          className='h-8 w-8 p-0'
          onClick={goToFirstPage}
          disabled={!paginationInfo.hasPreviousPage}
        >
          <span className='sr-only'>Đến trang đầu</span>
          <ChevronsLeft className='h-4 w-4' />
        </Button>
        <Button
          type='button'
          variant='outline'
          className='h-8 w-8 p-0'
          onClick={previousPage}
          disabled={!paginationInfo.hasPreviousPage}
        >
          <span className='sr-only'>Đến trang trước</span>
          <ChevronLeft className='h-4 w-4' />
        </Button>
        <Button
          type='button'
          variant='outline'
          className='h-8 w-8 p-0'
          onClick={nextPage}
          disabled={!paginationInfo.hasNextPage}
        >
          <span className='sr-only'>Đến trang tiếp theo</span>
          <ChevronRight className='h-4 w-4' />
        </Button>
        <Button
          type='button'
          variant='outline'
          className='h-8 w-8 p-0'
          onClick={goToLastPage}
          disabled={!paginationInfo.hasNextPage}
        >
          <span className='sr-only'>Đến trang cuối</span>
          <ChevronsRight className='h-4 w-4' />
        </Button>
      </div>
    </div>
  )
}
