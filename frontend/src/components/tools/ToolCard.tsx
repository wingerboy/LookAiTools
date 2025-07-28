import { Link } from 'react-router-dom'
import { Star, ArrowRight, ExternalLink } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'
import { useTranslation } from 'react-i18next'
import type { AITool, BilingualText } from '@/types'

interface ToolCardProps {
  tool: AITool
  className?: string
}

// 格式化流量数字
const formatTraffic = (traffic: number): string => {
  if (traffic >= 1000000) {
    return `${(traffic / 1000000).toFixed(1)}M`
  } else if (traffic >= 1000) {
    return `${(traffic / 1000).toFixed(1)}K`
  }
  return traffic.toString()
}

// 获取双语文本的辅助函数
function getBilingualText(text: BilingualText | string | undefined, language: string): string {
  if (!text) return ''

  if (typeof text === 'string') return text

  if (typeof text === 'object') {
    // 根据当前语言选择文本，如果当前语言不存在则fallback到另一种语言
    if (language === 'zh' || language === 'zh-CN') {
      return text.cn || text.en || ''
    } else {
      return text.en || text.cn || ''
    }
  }

  return ''
}

export default function ToolCard({ tool, className }: ToolCardProps) {
  const { t, i18n } = useTranslation()
  const getPricingColor = (pricing: string) => {
    switch (pricing) {
      case 'free':
        return 'bg-gradient-to-r from-success to-emerald-400 text-white border-0 shadow-lg glow-effect'
      case 'freemium':
        return 'bg-gradient-to-r from-primary to-info text-white border-0 shadow-lg glow-effect'
      case 'paid':
        return 'bg-gradient-to-r from-warning to-orange-400 text-white border-0 shadow-lg glow-effect'
      default:
        return 'bg-gradient-to-r from-muted to-secondary text-white border-0 shadow-lg'
    }
  }

  return (
    <Card className={cn("group hover-lift overflow-hidden glass-effect hover:glow-effect transition-all duration-500", className)}>
      <CardContent className="p-0">
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden bg-muted">
          {tool.thumbnail_url ? (
            <img
              src={tool.thumbnail_url}
              alt={tool.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
              <div className="text-4xl font-bold text-primary/30">
                {tool.title.charAt(0).toUpperCase()}
              </div>
            </div>
          )}
          
          {/* Featured Badge */}
          {tool.featured && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-gradient-to-r from-warning to-accent text-white border-0 shadow-lg animate-pulse-slow neon-glow">
                <Star className="w-3 h-3 mr-1 fill-current" />
                {t('common.featured')}
              </Badge>
            </div>
          )}

          {/* Pricing Badge */}
          <div className="absolute top-3 right-3">
            <Badge 
              variant="outline" 
              className={cn("capitalize", getPricingColor(tool.pricing))}
            >
              {tool.pricing}
            </Badge>
          </div>

          {/* Quick Action Overlay - Hidden on mobile */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:flex items-center justify-center">
            <div className="flex space-x-2">
              <Link to={`/tools/${tool.full_data?.slug || tool.id}`}>
                <Button size="sm" variant="secondary">
                  {t('common.viewDetails')}
                  <ArrowRight className="ml-2 h-3 w-3" />
                </Button>
              </Link>
              <a
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                <Button size="sm">
                  {t('common.visitSite')}
                  <ExternalLink className="ml-2 h-3 w-3" />
                </Button>
              </a>
            </div>
          </div>


        </div>

        {/* Content */}
        <div className="p-6 relative">
          <div className="space-y-3">
            {/* Title */}
            <Link to={`/tools/${tool.full_data?.slug || tool.id}`}>
              <h3 className="font-semibold text-lg leading-tight hover:text-primary transition-colors line-clamp-2">
                {tool.full_data?.title ? getBilingualText(tool.full_data.title, i18n.language) : tool.title}
              </h3>
            </Link>

            {/* Description */}
            <p className="text-sm text-muted-foreground line-clamp-3">
              {tool.full_data?.description ? getBilingualText(tool.full_data.description, i18n.language) : tool.description}
            </p>

            {/* Tags */}
            {Array.isArray(tool.tags) && tool.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {tool.tags.slice(0, 3).map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-xs"
                  >
                    {tag}
                  </Badge>
                ))}
                {tool.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{tool.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* Bottom metrics bar */}
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-border/50">
              {/* Stars */}
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="h-3 w-3 fill-current text-yellow-500" />
                <span className="font-medium">{tool.full_data?.rating || '4.5'}</span>
              </div>

              {/* Traffic */}
              <div className="flex items-center gap-1 text-xs">
                <svg className="w-3 h-3 text-success" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium text-success">
                  {formatTraffic(tool.traffic || Math.floor(Math.random() * 5000000) + 100000)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
