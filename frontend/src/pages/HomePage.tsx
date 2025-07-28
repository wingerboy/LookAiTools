import { useState, useEffect } from 'react'
import HeroSection from '@/components/home/HeroSection'
import CategoryTabs from '@/components/home/CategoryTabs'
import ToolGrid from '@/components/tools/ToolGrid'
import { useFeaturedTools, useLatestTools, usePopularTools, useCategories, useTools } from '@/hooks/useTools'
import type { AITool, Category } from '@/types'
import { useTranslation } from 'react-i18next'



export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const { t } = useTranslation()

  // 使用自定义Hooks获取数据
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories()

  const { tools: featuredTools, loading: featuredLoading, error: featuredError } = useFeaturedTools()
  const { tools: latestTools, loading: latestLoading, error: latestError } = useLatestTools()
  const { tools: popularTools, loading: popularLoading, error: popularError } = usePopularTools()

  // 根据选中的分类获取工具
  const { tools: categoryTools, loading: categoryLoading, error: categoryError } = useTools({
    category: selectedCategory === 'all' ? undefined : selectedCategory,
    limit: 8
  })

  // 移除严格的错误处理，让页面始终能够渲染



  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* 科技风背景装饰 */}
      <div className="fixed inset-0 pointer-events-none">
        {/* 主要发光球体 */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-gradient-to-br from-accent/20 to-info/20 rounded-full blur-3xl animate-float" style={{animationDelay: '3s'}}></div>
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-gradient-to-br from-info/20 to-success/20 rounded-full blur-3xl animate-float" style={{animationDelay: '1.5s'}}></div>

        {/* 网格背景 */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(37,99,235,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,0.05)_1px,transparent_1px)] bg-[size:100px_100px] opacity-30"></div>

        {/* 额外的装饰光点 */}
        <div className="absolute top-40 left-1/3 w-32 h-32 bg-gradient-to-br from-warning/30 to-accent/30 rounded-full blur-2xl animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-40 right-1/3 w-48 h-48 bg-gradient-to-br from-success/20 to-primary/20 rounded-full blur-3xl animate-float" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Hero Section */}
      <HeroSection />

      {/* Category Tabs */}
      <div className="relative z-10">

        {/* Category Tabs Implementation */}
        <section className="py-12 border-b border-border/50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-white">{t('home.categories.title')}</h2>
                <p className="text-muted-foreground mt-2">
                  {t('home.categories.subtitle')}
                </p>
              </div>
              <button className="text-white border border-gray-600 px-4 py-2 rounded-lg hover:border-blue-400 transition-colors">
                {t('categories.allCategories')} →
              </button>
            </div>

            {/* Category Buttons */}
            <div className="flex flex-wrap gap-3 mb-8">
              {categoriesLoading ? (
                // Loading skeleton
                Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-10 bg-muted rounded-full animate-pulse"
                    style={{ width: `${80 + Math.random() * 40}px` }}
                  />
                ))
              ) : (
                <>
                  {/* All Tools Button */}
                  <button
                    className={`px-6 py-3 rounded-full border-2 transition-all duration-300 hover:scale-105 ${
                      selectedCategory === 'all'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent shadow-lg glow-effect'
                        : 'bg-transparent text-white border-gray-600 hover:border-blue-400 hover:bg-blue-600/10'
                    }`}
                    onClick={() => setSelectedCategory('all')}
                  >
                    {t('home.stats.tools')}
                    <span className="ml-2 text-xs bg-white/20 px-2 py-1 rounded-full">
                      {categories?.reduce((sum, cat) => sum + (cat.count || 0), 0) || '?'}
                    </span>
                  </button>

                  {/* Category Buttons */}
                  {Array.isArray(categories) && categories.length > 0 ? (
                    categories.slice(0, 10).map((category, index) => (
                      <button
                        key={category.id || category.slug || index}
                        className={`px-6 py-3 rounded-full border-2 transition-all duration-300 hover:scale-105 ${
                          selectedCategory === category.slug
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent shadow-lg glow-effect'
                            : 'bg-transparent text-white border-gray-600 hover:border-blue-400 hover:bg-blue-600/10'
                        }`}
                        onClick={() => setSelectedCategory(category.slug)}
                        style={{animationDelay: `${index * 0.1}s`}}
                      >
                        {category.name || category.slug}
                        <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
                          selectedCategory === category.slug
                            ? 'bg-white/20 text-white'
                            : 'bg-gray-700 text-gray-300'
                        }`}>
                          {category.count || 0}
                        </span>
                      </button>
                    ))
                  ) : (
                    // 如果没有分类数据，显示默认分类
                    ['Productivity', 'Image', 'Video', 'Code & IT', 'Marketing'].map((categoryName, index) => (
                      <button
                        key={categoryName}
                        className="px-6 py-3 rounded-full border-2 transition-all duration-300 hover:scale-105 bg-transparent text-white border-gray-600 hover:border-blue-400 hover:bg-blue-600/10"
                        onClick={() => setSelectedCategory(categoryName.toLowerCase().replace(/\s+/g, '-'))}
                        style={{animationDelay: `${index * 0.1}s`}}
                      >
                        {categoryName}
                        <span className="ml-2 text-xs px-2 py-1 rounded-full bg-gray-700 text-gray-300">
                          ?
                        </span>
                      </button>
                    ))
                  )}
                </>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Category Tools */}
      {selectedCategory !== 'all' && (
        <div className="relative z-10">
          <ToolGrid
            tools={categoryTools || []}
            title={`${categories?.find(c => c.slug === selectedCategory)?.name || selectedCategory} ${t('home.stats.tools')}`}
            subtitle={`${t('categories.subtitle')} - ${categories?.find(c => c.slug === selectedCategory)?.name || selectedCategory}`}
            viewAllLink={`/category/${selectedCategory}`}
            loading={categoryLoading}
          />
        </div>
      )}

      {/* Featured Tools */}
      <div className="relative z-10">
        <ToolGrid
          tools={featuredTools || []}
          title={t('home.featured.title')}
          subtitle={t('home.featured.subtitle')}
          viewAllLink="/featured"
          loading={featuredLoading}
        />
      </div>

      {/* Latest Tools */}
      <div className="relative z-10 bg-gradient-to-br from-card/50 to-secondary/30 backdrop-blur-sm">
        <ToolGrid
          tools={latestTools || []}
          title={t('home.latest.title')}
          subtitle={t('home.latest.subtitle')}
          viewAllLink="/latest"
          className="bg-transparent"
          loading={latestLoading}
        />
      </div>

      {/* Popular Tools */}
      <div className="relative z-10">
        <ToolGrid
          tools={popularTools || []}
          title={t('home.popular.title')}
          subtitle={t('home.popular.subtitle')}
          viewAllLink="/popular"
          loading={popularLoading}
        />
      </div>
    </div>
  )
}
