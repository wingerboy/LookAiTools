import type { AITool, Category, APIResponse, PaginationInfo, SearchFilters } from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

class APIService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<APIResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // 工具相关API
  async getTools(params: {
    page?: number
    limit?: number
    category?: string
    subcategory?: string
    tags?: string[]
    featured?: boolean
    search?: string
    language?: string
    minimal?: boolean
    all?: boolean
  } = {}): Promise<APIResponse<AITool[]>> {
    const searchParams = new URLSearchParams()

    if (params.page) searchParams.append('page', params.page.toString())
    if (params.limit) searchParams.append('limit', params.limit.toString())
    if (params.category) searchParams.append('category', params.category)
    if (params.subcategory) searchParams.append('subcategory', params.subcategory)
    if (params.tags && params.tags.length > 0) searchParams.append('tags', params.tags.join(','))
    if (params.featured !== undefined) searchParams.append('featured', params.featured.toString())
    if (params.search) searchParams.append('search', params.search)
    if (params.language) searchParams.append('language', params.language)
    if (params.minimal !== undefined) searchParams.append('minimal', params.minimal.toString())
    if (params.all !== undefined) searchParams.append('all', params.all.toString())

    const endpoint = `/api/tools${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
    return this.request<AITool[]>(endpoint)
  }

  async getTool(identifier: string, language: string = 'en'): Promise<APIResponse<AITool>> {
    return this.request<AITool>(`/api/tools/${identifier}?language=${language}`)
  }

  async getRelatedTools(identifier: string, language: string = 'en', limit: number = 4): Promise<APIResponse<AITool[]>> {
    return this.request<AITool[]>(`/api/tools/${identifier}/related?language=${language}&limit=${limit}`)
  }

  async getFeaturedTools(language: string = 'en'): Promise<APIResponse<AITool[]>> {
    return this.request<AITool[]>(`/api/tools?featured=true&limit=8&language=${language}&minimal=true`)
  }

  async getLatestTools(language: string = 'en'): Promise<APIResponse<AITool[]>> {
    return this.request<AITool[]>(`/api/tools?limit=8&language=${language}&minimal=true`)
  }

  async getPopularTools(language: string = 'en'): Promise<APIResponse<AITool[]>> {
    return this.request<AITool[]>(`/api/tools?limit=8&language=${language}&minimal=true`)
  }

  async getToolsByCategory(category: string, params: {
    page?: number
    limit?: number
    language?: string
    minimal?: boolean
  } = {}): Promise<APIResponse<AITool[]>> {
    return this.getTools({
      ...params,
      category,
      minimal: params.minimal !== undefined ? params.minimal : true // 默认使用minimal模式
    })
  }

  async searchTools(query: string, filters: SearchFilters = {}, params: {
    page?: number
    limit?: number
    language?: string
  } = {}): Promise<APIResponse<AITool[]>> {
    return this.getTools({
      ...params,
      search: query,
      category: filters.category,
      featured: filters.featured
    })
  }

  // 分类相关API
  async getCategories(language: string = 'en'): Promise<APIResponse<Category[]>> {
    return this.request<Category[]>(`/api/categories?language=${language}`)
  }

  async getSubcategories(language: string = 'en'): Promise<APIResponse<Category[]>> {
    return this.request<Category[]>(`/api/subcategories?language=${language}`)
  }

  async getTags(language: string = 'en'): Promise<APIResponse<Category[]>> {
    return this.request<Category[]>(`/api/tags?language=${language}`)
  }

  // 提交工具
  async submitTool(toolData: any): Promise<APIResponse<any>> {
    return this.request<any>('/api/tools/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(toolData)
    })
  }

  // 批量获取首页数据 - 性能优化
  async getHomepageData(language: string = 'en'): Promise<APIResponse<{
    categories: Category[]
    featured_tools: AITool[]
    latest_tools: AITool[]
    popular_tools: AITool[]
  }>> {
    return this.request<{
      categories: Category[]
      featured_tools: AITool[]
      latest_tools: AITool[]
      popular_tools: AITool[]
    }>(`/api/homepage-data?language=${language}`)
  }

  // 健康检查
  async healthCheck(): Promise<{ status: string; database: string }> {
    const response = await fetch(`${API_BASE_URL}/health`)
    return response.json()
  }
}

export const apiService = new APIService()
export default apiService
