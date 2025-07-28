import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { apiService } from '../services/apiService'
import { AITool, PaginationInfo } from '../types'

interface UseClientPaginationParams {
  category?: string
  tags?: string[]
  search?: string
  pageSize?: number
}

interface UseClientPaginationReturn {
  tools: AITool[]
  loading: boolean
  error: string | null
  pagination: PaginationInfo | null
  currentPage: number
  setCurrentPage: (page: number) => void
  refetch: () => void
}

export function useClientPagination(params: UseClientPaginationParams): UseClientPaginationReturn {
  const [allTools, setAllTools] = useState<AITool[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const { i18n } = useTranslation()

  const pageSize = params.pageSize || 12

  // 构建筛选条件的key，用于判断是否需要重新获取数据
  const filterKey = useMemo(() => {
    return JSON.stringify({
      category: params.category,
      tags: params.tags?.sort(), // 排序确保一致性
      search: params.search,
      language: i18n.language
    })
  }, [params.category, params.tags, params.search, i18n.language])

  // 获取所有数据
  const fetchAllTools = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiService.getTools({
        category: params.category,
        tags: params.tags,
        search: params.search,
        language: i18n.language,
        minimal: true,
        all: true // 获取所有数据
      })

      if (response.success) {
        setAllTools(response.data)
        setCurrentPage(1) // 重置到第一页
      } else {
        console.warn('API response error:', response.message)
        setAllTools([])
      }
    } catch (err) {
      console.warn('Network error (non-blocking):', err)
      setAllTools([])
    } finally {
      setLoading(false)
    }
  }

  // 当筛选条件改变时重新获取数据
  useEffect(() => {
    fetchAllTools()
  }, [filterKey])

  // 计算当前页的数据和分页信息
  const { paginatedTools, pagination } = useMemo(() => {
    const total = allTools.length
    const totalPages = Math.ceil(total / pageSize)
    
    // 确保当前页在有效范围内
    const validCurrentPage = Math.max(1, Math.min(currentPage, totalPages || 1))
    
    // 计算当前页的数据
    const startIndex = (validCurrentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedData = allTools.slice(startIndex, endIndex)

    const paginationInfo: PaginationInfo = {
      page: validCurrentPage,
      limit: pageSize,
      total: total,
      totalPages: totalPages || 1
    }

    return {
      paginatedTools: paginatedData,
      pagination: paginationInfo
    }
  }, [allTools, currentPage, pageSize])

  // 安全的设置页码函数
  const setCurrentPageSafe = (page: number) => {
    const totalPages = pagination?.totalPages || 1
    const validPage = Math.max(1, Math.min(page, totalPages))
    setCurrentPage(validPage)
  }

  return {
    tools: paginatedTools,
    loading,
    error,
    pagination,
    currentPage: pagination?.page || 1,
    setCurrentPage: setCurrentPageSafe,
    refetch: fetchAllTools
  }
}
