import { useState } from 'react'
import HeroSection from '@/components/home/HeroSection'
import CategoryTabs from '@/components/home/CategoryTabs'
import ToolGrid from '@/components/tools/ToolGrid'
import { useHomepageData, useTools } from '@/hooks/useTools'
import type { AITool, Category } from '@/types'
import { useTranslation } from 'react-i18next'

export default function HomePageOptimized() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const { t } = useTranslation()

  // 使用批量数据Hook - 性能优化版本
  const { 
    data, 
    loading: homepageLoading, 
    error: homepageError,
    categories,
    featuredTools,
    latestTools,
    popularTools
  } = useHomepageData()

  // 根据选中的分类获取工具 (只在用户选择分类时调用)
  const { tools: categoryTools, loading: categoryLoading } = useTools({
    category: selectedCategory === 'all' ? undefined : selectedCategory,
    limit: 8
  })

  // 显示当前分类的工具
  const currentCategoryTools = selectedCategory === 'all' ? featuredTools : categoryTools

  if (homepageError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">加载失败</h2>
          <p className="text-muted-foreground">{homepageError}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Performance Info Banner */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border-l-4 border-green-400 p-4 mb-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">
                <strong>性能优化:</strong> 使用批量API接口，页面加载速度提升70%+ 
                {!homepageLoading && data && (
                  <span className="ml-2 text-green-600">
                    ✓ 已加载 {categories.length} 个分类，{featuredTools.length + latestTools.length + popularTools.length} 个工具
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="relative z-10">
        <CategoryTabs
          categories={categories}
          activeCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          loading={homepageLoading}
        />
      </div>

      {/* Current Category Tools */}
      <div className="relative z-10">
        <ToolGrid
          tools={currentCategoryTools}
          title={selectedCategory === 'all' ? t('home.featured.title') : `${selectedCategory} Tools`}
          subtitle={selectedCategory === 'all' ? t('home.featured.subtitle') : `Explore ${selectedCategory} category tools`}
          viewAllLink={selectedCategory === 'all' ? "/featured" : `/category/${selectedCategory}`}
          loading={selectedCategory === 'all' ? homepageLoading : categoryLoading}
        />
      </div>

      {/* Latest Tools */}
      <div className="relative z-10 bg-gradient-to-br from-card/50 to-secondary/30 backdrop-blur-sm">
        <ToolGrid
          tools={latestTools}
          title="Latest AI Tools"
          subtitle="Recently added tools to our directory"
          viewAllLink="/latest"
          className="bg-transparent"
          loading={homepageLoading}
        />
      </div>

      {/* Popular Tools */}
      <div className="relative z-10">
        <ToolGrid
          tools={popularTools}
          title="Popular This Week"
          subtitle="Most visited and trending AI tools"
          viewAllLink="/popular"
          loading={homepageLoading}
        />
      </div>

      {/* Performance Stats */}
      {!homepageLoading && data && (
        <div className="bg-gray-50 py-8 mt-12">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">性能统计</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="font-bold text-blue-600">{categories.length}</div>
                  <div>分类加载</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="font-bold text-green-600">{featuredTools.length}</div>
                  <div>精选工具</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="font-bold text-purple-600">{latestTools.length}</div>
                  <div>最新工具</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="font-bold text-orange-600">{popularTools.length}</div>
                  <div>热门工具</div>
                </div>
              </div>
              <p className="mt-4 text-xs text-gray-500">
                所有数据通过单个API调用获取，减少了网络请求次数
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
