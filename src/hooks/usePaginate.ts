import { useMemo, useState, useCallback, useEffect } from 'react'
import { DEFAULT_PAGE_SIZE } from '@/constants/pagination'
import type { UsePaginateOptions, UsePaginateReturn, PaginationState, PaginationInfo } from '@/types'

export function usePaginate<T>(data: T[], options: UsePaginateOptions = {}): UsePaginateReturn<T> {
  const { initialPageSize = DEFAULT_PAGE_SIZE, initialPageIndex = 0 } = options

  const [paginationState, setPaginationState] = useState<PaginationState>({
    pageIndex: initialPageIndex,
    pageSize: initialPageSize,
  })

  const paginationInfo = useMemo<PaginationInfo>(() => {
    const totalItems = data.length
    const totalPages = Math.ceil(totalItems / paginationState.pageSize)
    const currentPage = paginationState.pageIndex + 1
    const hasNextPage = paginationState.pageIndex < totalPages - 1
    const hasPreviousPage = paginationState.pageIndex > 0
    const startIndex = paginationState.pageIndex * paginationState.pageSize
    const endIndex = Math.min(startIndex + paginationState.pageSize - 1, totalItems - 1)

    return {
      totalItems,
      totalPages,
      currentPage,
      pageSize: paginationState.pageSize,
      hasNextPage,
      hasPreviousPage,
      startIndex,
      endIndex,
    }
  }, [data.length, paginationState])

  const paginatedData = useMemo(() => {
    const startIndex = paginationState.pageIndex * paginationState.pageSize
    const endIndex = startIndex + paginationState.pageSize
    return data.slice(startIndex, endIndex)
  }, [data, paginationState])

  const setPageIndex = useCallback(
    (pageIndex: number) => {
      const totalPages = Math.ceil(data.length / paginationState.pageSize)
      const validPageIndex = Math.max(0, Math.min(pageIndex, totalPages - 1))

      setPaginationState((prev) => ({
        ...prev,
        pageIndex: validPageIndex,
      }))
    },
    [data.length, paginationState.pageSize]
  )

  const setPageSize = useCallback(
    (pageSize: number) => {
      const newTotalPages = Math.ceil(data.length / pageSize)
      const validPageIndex = Math.min(paginationState.pageIndex, newTotalPages - 1)

      setPaginationState({
        pageIndex: Math.max(0, validPageIndex),
        pageSize,
      })
    },
    [data.length, paginationState.pageIndex]
  )

  const nextPage = useCallback(() => {
    if (paginationInfo.hasNextPage) {
      setPageIndex(paginationState.pageIndex + 1)
    }
  }, [paginationInfo.hasNextPage, paginationState.pageIndex, setPageIndex])

  const previousPage = useCallback(() => {
    if (paginationInfo.hasPreviousPage) {
      setPageIndex(paginationState.pageIndex - 1)
    }
  }, [paginationInfo.hasPreviousPage, paginationState.pageIndex, setPageIndex])

  const goToFirstPage = useCallback(() => {
    setPageIndex(0)
  }, [setPageIndex])

  const goToLastPage = useCallback(() => {
    setPageIndex(paginationInfo.totalPages - 1)
  }, [setPageIndex, paginationInfo.totalPages])

  const resetPagination = useCallback(() => {
    setPaginationState({
      pageIndex: 0,
      pageSize: initialPageSize,
    })
  }, [initialPageSize])

  useEffect(() => {
    if (data.length > 0 && paginationState.pageIndex > 0) {
      const newTotalPages = Math.ceil(data.length / paginationState.pageSize)
      if (paginationState.pageIndex >= newTotalPages) {
        setPaginationState((prev) => ({
          ...prev,
          pageIndex: Math.max(0, newTotalPages - 1),
        }))
      }
    }
  }, [data.length, paginationState.pageIndex, paginationState.pageSize])

  return {
    paginatedData,
    paginationState,
    paginationInfo,
    setPageIndex,
    setPageSize,
    nextPage,
    previousPage,
    goToFirstPage,
    goToLastPage,
    resetPagination,
  }
}
