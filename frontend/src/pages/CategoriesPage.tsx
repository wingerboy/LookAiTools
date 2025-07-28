import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Grid, List, Search, Filter, ChevronDown, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import ToolCard from '@/components/tools/ToolCard'
import { useCategoriesPageData } from '@/hooks/useTools'
import { useClientPagination } from '@/hooks/useClientPagination'
import type { Category, AITool } from '@/types'

interface FilterState {
  category: string
  tags: string[]
  search: string
}

export default function CategoriesPage() {
  const { t, i18n } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)

  const [filters, setFilters] = useState<FilterState>({
    category: searchParams.get('category') || '',
    tags: searchParams.get('tags')?.split(',').filter(Boolean) || [],
    search: searchParams.get('search') || ''
  })

  // 获取数据 - 使用批量Hook避免重复请求
  const {
    categories,
    tags,
    loading: pageDataLoading,
    error: pageDataError
  } = useCategoriesPageData()

  // 使用客户端分页 - 一次性获取所有数据，前端分页
  const {
    tools,
    loading: toolsLoading,
    pagination,
    currentPage,
    setCurrentPage
  } = useClientPagination({
    category: filters.category || undefined,
    tags: filters.tags.length > 0 ? filters.tags : undefined,
    search: filters.search || undefined,
    pageSize: 12
  })

  // 更新筛选器
  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    // 注意：不需要手动重置页码，useClientPagination会自动处理

    // 更新URL参数
    const params = new URLSearchParams()
    if (updatedFilters.category) params.set('category', updatedFilters.category)
    if (updatedFilters.tags.length > 0) params.set('tags', updatedFilters.tags.join(','))
    if (updatedFilters.search) params.set('search', updatedFilters.search)
    setSearchParams(params)
  }

  // 清除筛选器
  const clearFilters = () => {
    setFilters({ category: '', tags: [], search: '' })
    setCurrentPage(1)
    setSearchParams({})
  }

  // 移除单个标签
  const removeTag = (tagToRemove: string) => {
    updateFilters({ tags: filters.tags.filter(tag => tag !== tagToRemove) })
  }

  const totalTools = categories.reduce((sum, category) => sum + (category.count || 0), 0)
  const hasActiveFilters = filters.category || filters.tags.length > 0 || filters.search

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-white">{t('categories.title')}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('categories.subtitle')}
          </p>
          <div className="mt-6 flex justify-center items-center gap-8 text-sm text-muted-foreground">
            <div>
              <span className="text-2xl font-bold text-primary">{categories.length}</span>
              <div>{t('home.stats.categories')}</div>
            </div>
            <div>
              <span className="text-2xl font-bold text-primary">{totalTools}+</span>
              <div>{t('home.stats.tools')}</div>
            </div>
            <div>
              <span className="text-2xl font-bold text-primary">{pagination?.total || 0}</span>
              <div>{t('search.resultsFor')}</div>
            </div>
          </div>
        </div>

        {/* Search and Controls */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t('common.searchPlaceholder')}
              className="pl-10 bg-card border-border text-white"
              value={filters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="border-border text-white hover:bg-card"
            >
              <Filter className="h-4 w-4 mr-2" />
              {t('search.filters')}
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2 bg-primary text-white">
                  {[filters.category, ...filters.tags].filter(Boolean).length}
                </Badge>
              )}
            </Button>

            <div className="flex items-center border border-border rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="h-8 w-8 p-0"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-8 w-8 p-0"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-sm text-muted-foreground">{t('categories.activeFilters')}</span>
            {filters.category && (
              <Badge variant="secondary" className="bg-primary text-white">
                {t('navigation.categories')}: {categories.find(c => c.slug === filters.category)?.name || filters.category}
                <button
                  onClick={() => updateFilters({ category: '' })}
                  className="ml-2 hover:text-red-300"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {filters.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="bg-green-600 text-white">
                {t('categories.tags')}: {tags.find(t => t.slug === tag)?.name || tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="ml-2 hover:text-red-300"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-red-400 hover:text-red-300"
            >
              {t('categories.clearAll')}
            </Button>
          </div>
        )}

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-card border border-border rounded-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Categories */}
              <div>
                <h3 className="font-semibold mb-3 text-white">{t('navigation.categories')}</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {pageDataLoading ? (
                    <div className="text-muted-foreground">{t('common.loading')}</div>
                  ) : (
                    categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => updateFilters({ category: category.slug === filters.category ? '' : category.slug })}
                        className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                          filters.category === category.slug
                            ? 'bg-primary text-white'
                            : 'text-muted-foreground hover:text-white hover:bg-muted'
                        }`}
                      >
                        {category.name} ({category.count})
                      </button>
                    ))
                  )}
                </div>
              </div>



              {/* Tags */}
              <div>
                <h3 className="font-semibold mb-3 text-white">{t('categories.tags')}</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {pageDataLoading ? (
                    <div className="text-muted-foreground">{t('common.loading')}</div>
                  ) : Array.isArray(tags) ? (
                    tags.slice(0, 20).map((tag) => (
                      <button
                        key={tag.id}
                        onClick={() => {
                          const newTags = filters.tags.includes(tag.slug)
                            ? filters.tags.filter(t => t !== tag.slug)
                            : [...filters.tags, tag.slug]
                          updateFilters({ tags: newTags })
                        }}
                        className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                          filters.tags.includes(tag.slug)
                            ? 'bg-green-600 text-white'
                            : 'text-muted-foreground hover:text-white hover:bg-muted'
                        }`}
                      >
                        {tag.name} ({tag.count})
                      </button>
                    ))
                  ) : (
                    <div className="text-muted-foreground">暂无标签</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tools Grid */}
        <div className="mb-8">
          {toolsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 12 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-muted rounded-lg h-48 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-full"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : tools.length > 0 ? (
            <div className={
              viewMode === 'grid'
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
            }>
              {tools.map((tool) => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  className={viewMode === 'list' ? 'flex flex-row' : ''}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2 text-white">{t('categories.noToolsFound')}</h3>
              <p className="text-muted-foreground">
                {t('categories.tryAdjusting')}
              </p>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="mt-4 border-border text-white hover:bg-card"
                >
                  {t('categories.clearAllFilters')}
                </Button>
              )}
            </div>
          )}
        </div>



        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8 mb-8 p-4 bg-gray-800 rounded-lg">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-blue-700"
            >
              Previous
            </button>

            <span className="text-white">
              Page {currentPage} of {pagination.totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
              disabled={currentPage === pagination.totalPages}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-blue-700"
            >
              Next
            </button>
          </div>
        )}

        {/* Results Info */}
        {pagination && (
          <div className="text-center mt-6 text-muted-foreground">
            {t('categories.showing')} {((currentPage - 1) * 12) + 1} {t('categories.to')} {Math.min(currentPage * 12, pagination.total)} {t('categories.of')} {pagination.total} {t('categories.results')}
          </div>
        )}
      </div>
    </div>
  )
}
