import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/utils/cn'
import type { Category } from '@/types'

interface CategoryTabsProps {
  categories: Category[]
  activeCategory?: string
  onCategoryChange?: (category: string) => void
  loading?: boolean
}

export default function CategoryTabs({
  categories = [],
  activeCategory = 'all',
  onCategoryChange,
  loading = false
}: CategoryTabsProps) {
  const [selectedCategory, setSelectedCategory] = useState(activeCategory)

  const handleCategoryClick = (categorySlug: string) => {
    setSelectedCategory(categorySlug)
    onCategoryChange?.(categorySlug)
  }



  // 计算所有工具的总数
  const totalToolsCount = categories.reduce((sum, category) => sum + (category.count || 0), 0)

  const allCategories = [
    { id: 'all', name: 'All Tools', slug: 'all', count: totalToolsCount },
    ...categories
  ]

  return (
    <section className="py-12 border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">Browse by Category</h2>
            <p className="text-muted-foreground mt-2">
              Explore AI tools organized by use case and industry
            </p>
          </div>
          <Link to="/categories">
            <Button variant="outline">
              View All Categories
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-3 mb-8">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="h-10 bg-muted rounded-full animate-pulse"
                style={{ width: `${80 + Math.random() * 40}px` }}
              />
            ))
          ) : Array.isArray(allCategories) ? (
            allCategories.slice(0, 12).map((category, index) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.slug ? "default" : "outline"}
                className={cn(
                  "rounded-full transition-all duration-300 hover:scale-105 stagger-animation",
                  selectedCategory === category.slug
                    ? "btn-primary shadow-lg hover:shadow-xl border-0 glow-effect"
                    : "glass-effect hover:glow-effect border-2 border-border hover:border-primary/50 text-foreground"
                )}
                onClick={() => handleCategoryClick(category.slug)}
                style={{animationDelay: `${index * 0.1}s`}}
              >
                {category.name}
                {category.count && (
                  <Badge
                    variant="secondary"
                    className={cn(
                      "ml-2 text-xs",
                      selectedCategory === category.slug
                        ? "bg-white/20 text-white"
                        : "bg-secondary/50 text-muted-foreground"
                    )}
                  >
                    {category.count}
                  </Badge>
                )}
              </Button>
            ))
          ) : (
            // 如果没有分类数据，显示默认分类
            ['All', 'Productivity', 'Image', 'Video', 'Code & IT', 'Marketing'].map((categoryName, index) => (
              <Button
                key={categoryName}
                variant="outline"
                className="rounded-full transition-all duration-300 hover:scale-105 glass-effect hover:glow-effect border-2 border-border hover:border-primary/50 text-foreground"
                onClick={() => handleCategoryClick(categoryName.toLowerCase().replace(/\s+/g, '-'))}
                style={{animationDelay: `${index * 0.1}s`}}
              >
                {categoryName}
              </Button>
            ))
          )}
        </div>

        {/* Category Grid for Mobile */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:hidden">
          {Array.isArray(allCategories) && allCategories.slice(0, 12).map((category) => (
            <button
              key={category.id}
              className={cn(
                "p-4 rounded-lg border text-left transition-all duration-200 hover:shadow-md",
                selectedCategory === category.slug
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
              onClick={() => handleCategoryClick(category.slug)}
            >
              <div className="font-medium text-sm">{category.name}</div>
              {category.count && (
                <div className="text-xs text-muted-foreground mt-1">
                  {category.count} tools
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
