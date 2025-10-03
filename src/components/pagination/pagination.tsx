import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { Table } from '@tanstack/react-table'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PAGE_SIZE_OPTIONS } from '@/constants/pagination'

interface PaginationProps<TData> {
  table: Table<TData>
}

export function Pagination<TData>({ table }: PaginationProps<TData>) {
  return (
    // <div className='flex justify-between items-center pt-4 w-full'>
    <div className='flex flex-wrap justify-between items-center pt-4 w-full gap-y-3'>
      {/* Left: RowsPerPage */}
      <div className='flex items-center space-x-2'>
        <p className='whitespace-nowrap text-sm font-medium'>Số dòng trên trang</p>
        <Select
          value={`${table.getState().pagination.pageSize}`}
          onValueChange={(value) => table.setPageSize(Number(value))}
        >
          <SelectTrigger className='h-8 w-[70px]'>
            <SelectValue placeholder={table.getState().pagination.pageSize} />
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

      {/* Center: Page Of */}
      <div className='flex w-[100px] items-center justify-center text-sm font-medium'>
        Trang {table.getState().pagination.pageIndex + 1} của {table.getPageCount()}
      </div>

      {/* Right: Pagination buttons */}
      <div className='flex items-center space-x-2 w-full sm:w-auto  sm:justify-end justify-end'>
        <Button
          type='button'
          variant='outline'
          className='h-8 w-8 p-0'
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          <span className='sr-only'>Đến trang đầu</span>
          <ChevronsLeft className='h-4 w-4' />
        </Button>
        <Button
          type='button'
          variant='outline'
          className='h-8 w-8 p-0'
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <span className='sr-only'>Đến trang trước</span>
          <ChevronLeft className='h-4 w-4' />
        </Button>
        <Button
          type='button'
          variant='outline'
          className='h-8 w-8 p-0'
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <span className='sr-only'>Đến trang tiếp theo</span>
          <ChevronRight className='h-4 w-4' />
        </Button>
        <Button
          type='button'
          variant='outline'
          className='h-8 w-8 p-0'
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          <span className='sr-only'>Đến trang cuối</span>
          <ChevronsRight className='h-4 w-4' />
        </Button>
      </div>
    </div>
  )
}
