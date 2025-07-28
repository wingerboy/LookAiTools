import { useState } from 'react'
import { ChevronRight, Filter, Grid, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import ToolCard from './ToolCard'
import type { AITool } from '@/types'

interface ToolGridProps {
  tools: AITool[]
  title?: string
  subtitle?: string
  showViewAll?: boolean
  viewAllLink?: string
  className?: string
  loading?: boolean
}

export default function ToolGrid({
  tools,
  title = "Featured AI Tools",
  subtitle = "Discover the most popular and trending AI tools",
  showViewAll = true,
  viewAllLink = "/categories",
  className,
  loading = false
}: ToolGridProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)



  return (
    <section className={`py-12 ${className}`}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0">
          <div>
            <h2 className="text-3xl font-bold">{title}</h2>
            <p className="text-muted-foreground mt-2">{subtitle}</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* View Mode Toggle */}
            <div className="flex items-center border rounded-lg p-1">
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

            {/* Filter Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>

            {/* View All Button */}
            {showViewAll && (
              <Button variant="outline" asChild>
                <a href={viewAllLink}>
                  View All
                  <ChevronRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mb-8 p-4 border rounded-lg bg-muted/50">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                All
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                Free
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                Freemium
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                Featured
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                New
              </Badge>
            </div>
          </div>
        )}

        {/* Tools Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
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
            <div className="text-muted-foreground mb-4">
              <Grid className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No tools found</p>
              <p className="text-sm">Try adjusting your filters or search terms</p>
            </div>
            <Button variant="outline">
              Browse All Tools
            </Button>
          </div>
        )}

        {/* Load More */}
        {tools.length > 0 && tools.length >= 12 && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Load More Tools
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
