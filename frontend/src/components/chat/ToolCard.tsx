import { ExternalLink, Star, Users, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'
import type { AITool } from '@/types'

interface ToolCardProps {
  tool: AITool
  reason?: string
  score?: number
  className?: string
}

export default function ToolCard({ tool, reason, score, className }: ToolCardProps) {
  const getPricingColor = (pricing: string) => {
    switch (pricing) {
      case 'free':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'freemium':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'paid':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getPricingText = (pricing: string) => {
    switch (pricing) {
      case 'free':
        return '免费'
      case 'freemium':
        return '免费试用'
      case 'paid':
        return '付费'
      default:
        return '未知'
    }
  }

  return (
    <div className={cn(
      "p-4 bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:border-primary/20",
      className
    )}>
      {/* Header */}
      <div className="flex items-start space-x-3 mb-3">
        {tool.thumbnail_url && (
          <img 
            src={tool.thumbnail_url} 
            alt={tool.title}
            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-foreground truncate">{tool.title}</h4>
            {score && (
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span>{(score * 100).toFixed(0)}%</span>
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{tool.description}</p>
        </div>
      </div>

      {/* Tags */}
      {tool.tags && tool.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {tool.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded-full"
            >
              {tag}
            </span>
          ))}
          {tool.tags.length > 3 && (
            <span className="text-xs text-muted-foreground">+{tool.tags.length - 3}</span>
          )}
        </div>
      )}

      {/* Recommendation Reason */}
      {reason && (
        <div className="mb-3 p-2 bg-primary/5 border border-primary/10 rounded-lg">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-primary">推荐理由：</span>
            {reason}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className={cn(
            "text-xs px-2 py-1 rounded-full font-medium",
            getPricingColor(tool.pricing)
          )}>
            {getPricingText(tool.pricing)}
          </span>
          {tool.featured && (
            <span className="text-xs px-2 py-1 bg-gradient-to-r from-primary/20 to-accent/20 text-primary rounded-full font-medium">
              精选
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {tool.traffic && (
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              <span>{tool.traffic > 1000 ? `${(tool.traffic / 1000).toFixed(1)}k` : tool.traffic}</span>
            </div>
          )}
          <Button variant="ghost" size="sm" asChild>
            <a 
              href={tool.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              访问
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}
