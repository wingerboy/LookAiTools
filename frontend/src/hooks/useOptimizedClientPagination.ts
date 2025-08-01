import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { apiService } from '../services/apiService'
import { AITool, PaginationInfo } from '../types'

interface UseOptimizedClientPaginationParams {
  category?: string
  tags?: string[]
  search?: string
  pageSize?: number
}

interface UseOptimizedClientPaginationReturn {
  tools: AITool[]
  loading: boolean
  error: string | null
  pagination: PaginationInfo | null
  currentPage: number
  setCurrentPage: (page: number) => void
  refetch: () => void
}

export function useOptimizedClientPagination(params: UseOptimizedClientPaginationParams): UseOptimizedClientPaginationReturn {
  const [allTools, setAllTools] = useState<AITool[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const { i18n } = useTranslation()

  const pageSize = params.pageSize || 12

  // 只在首次加载或语言改变时获取数据
  const fetchAllTools = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiService.getTools({
        language: i18n.language,
        minimal: true,
        all: true // 一次性获取所有数据
      })

      if (response.success) {
        setAllTools(response.data)
      } else {
        console.warn('API response error:', response.message)
        setAllTools([])
        setError(response.message || 'Failed to fetch tools')
      }
    } catch (err) {
      console.error('Network error:', err)
      setAllTools([])
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }

  // 只在首次加载和语言改变时重新获取数据
  useEffect(() => {
    fetchAllTools()
  }, [i18n.language])

  // 前端筛选逻辑
  const filteredTools = useMemo(() => {
    let filtered = allTools

    // 分类筛选
    if (params.category) {
      filtered = filtered.filter(tool => tool.category === params.category)
    }

    // 标签筛选 - 精确匹配tag keys
    if (params.tags && params.tags.length > 0) {
      filtered = filtered.filter(tool => {
        if (!tool.tags || tool.tags.length === 0) return false
        return params.tags!.some(filterTag => 
          tool.tags!.includes(filterTag)
        )
      })
    }

    // 搜索筛选
    if (params.search) {
      const searchLower = params.search.toLowerCase()
      filtered = filtered.filter(tool => 
        tool.name?.toLowerCase().includes(searchLower) ||
        tool.title?.toLowerCase().includes(searchLower) ||
        tool.description?.toLowerCase().includes(searchLower)
      )
    }

    return filtered
  }, [allTools, params.category, params.tags, params.search])

  // 计算当前页的数据和分页信息
  const { paginatedTools, pagination } = useMemo(() => {
    const total = filteredTools.length
    const totalPages = Math.ceil(total / pageSize)
    
    // 确保当前页在有效范围内
    const validCurrentPage = Math.max(1, Math.min(currentPage, totalPages || 1))
    
    // 计算当前页的数据
    const startIndex = (validCurrentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedData = filteredTools.slice(startIndex, endIndex)

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
  }, [filteredTools, currentPage, pageSize])

  // 当筛选条件改变时重置到第一页
  useEffect(() => {
    setCurrentPage(1)
  }, [params.category, params.tags, params.search])

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