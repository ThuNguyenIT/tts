export interface PaginationState {
  pageIndex: number
  pageSize: number
}

export interface PaginationInfo {
  totalItems: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  startIndex: number
  endIndex: number
}

export interface UsePaginateOptions {
  initialPageSize?: number
  initialPageIndex?: number
}

export interface UsePaginateReturn<T> {
  paginatedData: T[]
  paginationState: PaginationState
  paginationInfo: PaginationInfo
  setPageIndex: (pageIndex: number) => void
  setPageSize: (pageSize: number) => void
  nextPage: () => void
  previousPage: () => void
  goToFirstPage: () => void
  goToLastPage: () => void
  resetPagination: () => void
}
