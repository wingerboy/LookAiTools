import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { apiService } from '@/services/apiService'
import type { AITool, Category, SearchFilters } from '@/types'

// 工具列表Hook
export function useTools(params: {
  page?: number
  limit?: number
  category?: string
  subcategory?: string
  tags?: string[]
  featured?: boolean
  search?: string
  minimal?: boolean
} = {}) {
  const [tools, setTools] = useState<AITool[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  })
  const { i18n } = useTranslation()

  const fetchTools = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiService.getTools({
        ...params,
        language: i18n.language,
        minimal: params.minimal !== undefined ? params.minimal : true // 默认使用minimal模式
      })

      if (response.success) {
        setTools(response.data)
        if (response.pagination) {
          setPagination(response.pagination)
        }
      } else {
        // 设置错误状态以便调试
        console.error('API response error:', response.message)
        setError(response.message || 'API响应错误')
        setTools([])
      }
    } catch (err) {
      // 设置错误状态以便调试
      console.error('Network error:', err)
      setError(err instanceof Error ? err.message : '网络错误')
      setTools([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTools()
  }, [
    params.page,
    params.limit,
    params.category,
    params.subcategory,
    params.featured,
    params.search,
    params.minimal,
    JSON.stringify(params.tags), // 序列化数组以避免引用比较问题
    i18n.language
  ])

  return {
    tools,
    loading,
    error,
    pagination,
    refetch: fetchTools
  }
}

// 精选工具Hook
export function useFeaturedTools() {
  const [tools, setTools] = useState<AITool[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { i18n } = useTranslation()

  useEffect(() => {
    const fetchFeaturedTools = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await apiService.getFeaturedTools(i18n.language)

        if (response.success) {
          setTools(response.data)
        } else {
          console.error('Featured tools API error:', response.message)
          setError(response.message || 'API响应错误')
          setTools([])
        }
      } catch (err) {
        console.error('Featured tools network error:', err)
        setError(err instanceof Error ? err.message : '网络错误')
        setTools([])
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedTools()
  }, [i18n.language])

  return { tools, loading, error }
}

// 最新工具Hook
export function useLatestTools() {
  const [tools, setTools] = useState<AITool[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { i18n } = useTranslation()

  useEffect(() => {
    const fetchLatestTools = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await apiService.getLatestTools(i18n.language)

        if (response.success) {
          setTools(response.data)
        } else {
          console.error('Latest tools API error:', response.message)
          setError(response.message || 'API响应错误')
          setTools([])
        }
      } catch (err) {
        console.error('Latest tools network error:', err)
        setError(err instanceof Error ? err.message : '网络错误')
        setTools([])
      } finally {
        setLoading(false)
      }
    }

    fetchLatestTools()
  }, [i18n.language])

  return { tools, loading, error }
}

// 热门工具Hook
export function usePopularTools() {
  const [tools, setTools] = useState<AITool[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { i18n } = useTranslation()

  useEffect(() => {
    const fetchPopularTools = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await apiService.getPopularTools(i18n.language)

        if (response.success) {
          setTools(response.data)
        } else {
          console.error('Popular tools API error:', response.message)
          setError(response.message || 'API响应错误')
          setTools([])
        }
      } catch (err) {
        console.error('Popular tools network error:', err)
        setError(err instanceof Error ? err.message : '网络错误')
        setTools([])
      } finally {
        setLoading(false)
      }
    }

    fetchPopularTools()
  }, [i18n.language])

  return { tools, loading, error }
}

// 单个工具Hook
export function useTool(identifier: string) {
  const [tool, setTool] = useState<AITool | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { i18n } = useTranslation()

  useEffect(() => {
    if (!identifier) return

    const fetchTool = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await apiService.getTool(identifier, i18n.language)

        if (response.success) {
          setTool(response.data)
        } else {
          setError(response.message || '获取工具详情失败')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '网络错误')
        console.error('Failed to fetch tool:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTool()
  }, [identifier, i18n.language])

  return { tool, loading, error }
}

// 相关工具Hook
export function useRelatedTools(identifier: string, limit: number = 4) {
  const [tools, setTools] = useState<AITool[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { i18n } = useTranslation()

  useEffect(() => {
    if (!identifier) return

    const fetchRelatedTools = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await apiService.getRelatedTools(identifier, i18n.language, limit)

        if (response.success) {
          setTools(response.data)
        } else {
          setError(response.message || '获取相关工具失败')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '网络错误')
        console.error('Failed to fetch related tools:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchRelatedTools()
  }, [identifier, limit, i18n.language])

  return { tools, loading, error }
}

// 分类Hook
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { i18n } = useTranslation()

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await apiService.getCategories(i18n.language)

        if (response.success) {
          setCategories(response.data)
        } else {
          console.error('Categories API error:', response.message)
          setError(response.message || 'API响应错误')
          setCategories([])
        }
      } catch (err) {
        console.error('Categories network error:', err)
        setError(err instanceof Error ? err.message : '网络错误')
        setCategories([])
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [i18n.language])

  return { categories, loading, error }
}

// 批量首页数据Hook - 性能优化版本
export function useHomepageData() {
  const [data, setData] = useState<{
    categories: Category[]
    featured_tools: AITool[]
    latest_tools: AITool[]
    popular_tools: AITool[]
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { i18n } = useTranslation()

  useEffect(() => {
    const fetchHomepageData = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await apiService.getHomepageData(i18n.language)

        if (response.success) {
          setData(response.data)
        } else {
          setError(response.message || '获取首页数据失败')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '网络错误')
        console.error('Failed to fetch homepage data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchHomepageData()
  }, [i18n.language])

  return {
    data,
    loading,
    error,
    categories: data?.categories || [],
    featuredTools: data?.featured_tools || [],
    latestTools: data?.latest_tools || [],
    popularTools: data?.popular_tools || []
  }
}

// 批量获取分类页面数据Hook - 解决重复请求问题
export function useCategoriesPageData() {
  const [data, setData] = useState<{
    categories: Category[]
    tags: Category[]
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { i18n } = useTranslation()

  useEffect(() => {
    let isCancelled = false

    const fetchCategoriesPageData = async () => {
      try {
        if (!isCancelled) {
          setLoading(true)
          setError(null)
        }

        // 并发获取分类和标签数据
        const [categoriesResponse, tagsResponse] = await Promise.all([
          apiService.getCategories(i18n.language),
          apiService.getTags(i18n.language, { popular: true, limit: 20 })  // 获取热门标签
        ])

        if (!isCancelled) {
          if (categoriesResponse.success && tagsResponse.success) {
            setData({
              categories: categoriesResponse.data,
              tags: tagsResponse.data
            })
          } else {
            setError('获取分类页面数据失败')
          }
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : '网络错误')
          console.error('Failed to fetch categories page data:', err)
        }
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }

    fetchCategoriesPageData()

    return () => {
      isCancelled = true
    }
  }, [i18n.language])

  return {
    data,
    loading,
    error,
    categories: data?.categories || [],
    tags: data?.tags || []
  }
}

// 子分类Hook
export function useSubcategories() {
  const [subcategories, setSubcategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { i18n } = useTranslation()

  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await apiService.getSubcategories(i18n.language)

        if (response.success) {
          setSubcategories(response.data)
        } else {
          setError(response.message || '获取子分类列表失败')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '网络错误')
        console.error('Failed to fetch subcategories:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSubcategories()
  }, [i18n.language])

  return { subcategories, loading, error }
}

// 标签Hook - 优化版本，避免重复请求
export function useTags() {
  const [tags, setTags] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { i18n } = useTranslation()

  useEffect(() => {
    let isCancelled = false // 防止组件卸载后的状态更新

    const fetchTags = async () => {
      try {
        if (!isCancelled) {
          setLoading(true)
          setError(null)
        }

        const response = await apiService.getTags(i18n.language, { popular: true, limit: 20 })

        if (!isCancelled) {
          if (response.success) {
            setTags(response.data)
          } else {
            setError(response.message || '获取标签列表失败')
          }
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : '网络错误')
          console.error('Failed to fetch tags:', err)
        }
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }

    fetchTags()

    return () => {
      isCancelled = true // 清理函数，防止内存泄漏
    }
  }, [i18n.language])

  return { tags, loading, error }
}

// 搜索Hook
export function useSearch() {
  const [results, setResults] = useState<AITool[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  })
  const { i18n } = useTranslation()

  const search = async (query: string, filters: SearchFilters = {}, page: number = 1) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await apiService.searchTools(query, filters, {
        page,
        language: i18n.language
      })
      
      if (response.success) {
        setResults(response.data)
        if (response.pagination) {
          setPagination(response.pagination)
        }
      } else {
        setError(response.message || '搜索失败')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '网络错误')
      console.error('Failed to search tools:', err)
    } finally {
      setLoading(false)
    }
  }

  return {
    results,
    loading,
    error,
    pagination,
    search
  }
}
