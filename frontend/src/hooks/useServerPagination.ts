import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { apiService } from '../services/apiService'
import { AITool, PaginationInfo } from '../types'

interface UseServerPaginationParams {
  category?: string
  tags?: string[]
  search?: string
  pageSize?: number
  debounceMs?: number
}

interface UseServerPaginationReturn {
  tools: AITool[]
  loading: boolean
  error: string | null
  pagination: PaginationInfo | null
  currentPage: number
  setCurrentPage: (page: number) => void
  refetch: () => void
}

// 防抖函数
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export function useServerPagination(params: UseServerPaginationParams): UseServerPaginationReturn {
  const [tools, setTools] = useState<AITool[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const { i18n } = useTranslation()

  const pageSize = params.pageSize || 12
  const debounceMs = params.debounceMs || 300

  // 对搜索关键词进行防抖处理
  const debouncedSearch = useDebounce(params.search || '', debounceMs)

  // 获取工具数据的函数
  const fetchTools = useCallback(async (page: number = currentPage) => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiService.getTools({
        page,
        limit: pageSize,
        category: params.category || undefined,
        tags: params.tags && params.tags.length > 0 ? params.tags : undefined,
        search: debouncedSearch || undefined,
        language: i18n.language,
        minimal: true
      })

      if (response.success) {
        setTools(response.data)
        if (response.pagination) {
          setPagination(response.pagination)
        }
      } else {
        console.warn('API response error:', response.message)
        setTools([])
        setError(response.message || 'Failed to fetch tools')
      }
    } catch (err) {
      console.error('Network error:', err)
      setTools([])
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }, [currentPage, pageSize, params.category, params.tags, debouncedSearch, i18n.language])

  // 当筛选条件改变时重置到第一页并重新获取数据
  useEffect(() => {
    setCurrentPage(1)
    fetchTools(1)
  }, [params.category, params.tags, debouncedSearch, i18n.language])

  // 当页码改变时获取数据（但不重置页码）
  useEffect(() => {
    if (currentPage !== 1) {
      fetchTools(currentPage)
    }
  }, [currentPage])

  // 初始加载
  useEffect(() => {
    fetchTools(1)
  }, [])

  // 安全的设置页码函数
  const setCurrentPageSafe = useCallback((page: number) => {
    const totalPages = pagination?.totalPages || 1
    const validPage = Math.max(1, Math.min(page, totalPages))
    setCurrentPage(validPage)
  }, [pagination?.totalPages])

  return {
    tools,
    loading,
    error,
    pagination,
    currentPage,
    setCurrentPage: setCurrentPageSafe,
    refetch: () => fetchTools(currentPage)
  }
}