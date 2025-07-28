import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ExternalLink, Star, Share2, Bookmark, ArrowLeft, ChevronRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import ToolGrid from '@/components/tools/ToolGrid'
import { useTool, useRelatedTools } from '@/hooks/useTools'
import { useTranslation } from 'react-i18next'
import type { AITool, BilingualText } from '@/types'

// 辅助函数
function getPricingColor(pricing: string) {
  switch (pricing) {
    case 'free':
      return 'text-green-600 border-green-600'
    case 'freemium':
      return 'text-blue-600 border-blue-600'
    case 'paid':
      return 'text-orange-600 border-orange-600'
    default:
      return 'text-gray-600 border-gray-600'
  }
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

export default function ToolDetailPage() {
  const { slug } = useParams()
  const [isBookmarked, setIsBookmarked] = useState(false)
  const { i18n, t } = useTranslation()

  // 使用自定义Hooks获取数据
  const { tool, loading: toolLoading, error: toolError } = useTool(slug || '')
  const { tools: relatedTools, loading: relatedLoading } = useRelatedTools(slug || '', 4)

  // Loading状态
  if (toolLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading tool details...</p>
        </div>
      </div>
    )
  }

  // 错误状态
  if (toolError || !tool) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Tool not found</h2>
          <p className="text-muted-foreground mb-4">
            {toolError || "The tool you're looking for doesn't exist."}
          </p>
          <Link to="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  const getPricingColor = (pricing: string) => {
    switch (pricing) {
      case 'free':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'freemium':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'paid':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <Link to="/categories" className="hover:text-foreground">Categories</Link>
          <ChevronRight className="h-4 w-4" />
          <Link to={`/category/${tool.category}`} className="hover:text-foreground capitalize">
            {tool.category.replace('-', ' ')}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{tool.title}</span>
        </nav>

        {/* Back Button */}
        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to tools
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Section */}
            <div className="space-y-6">
              <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                <img
                  src={tool.thumbnail_url}
                  alt={tool.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-4xl font-bold mb-2">
                      {tool.full_data?.title ? getBilingualText(tool.full_data.title, i18n.language) : tool.title}
                    </h1>
                    <div className="flex items-center gap-2 mb-4">
                      <Badge 
                        variant="outline" 
                        className={`capitalize ${getPricingColor(tool.pricing)}`}
                      >
                        {tool.pricing}
                      </Badge>
                      {tool.featured && (
                        <Badge className="bg-yellow-500 text-yellow-50">
                          <Star className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setIsBookmarked(!isBookmarked)}
                    >
                      <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <p className="text-lg text-muted-foreground leading-relaxed">
                  {tool.full_data?.description ? getBilingualText(tool.full_data.description, i18n.language) : tool.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {(tool.full_data?.tags || tool.tags || []).map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {typeof tag === 'string' ? tag : getBilingualText(tag, i18n.language)}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Features Section */}
            {tool.full_data?.key_features && tool.full_data.key_features.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('tool.keyFeatures', 'Key Features')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {tool.full_data.key_features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                        {getBilingualText(feature, i18n.language)}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Long Description */}
            {tool.full_data?.long_description && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {t('tool.about', 'About')} {tool.full_data?.title ? getBilingualText(tool.full_data.title, i18n.language) : tool.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {getBilingualText(tool.full_data.long_description, i18n.language)}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Use Cases */}
            {tool.full_data?.use_cases && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('tool.useCases', 'Use Cases')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {getBilingualText(tool.full_data.use_cases, i18n.language)}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* CTA Card */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {t('tool.try', 'Try')} {tool.full_data?.title ? getBilingualText(tool.full_data.title, i18n.language) : tool.title}
                </CardTitle>
                <CardDescription>
                  {t('tool.startUsing', 'Start using this AI tool today')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <a href={tool.url} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full" size="lg">
                    Visit Website
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </a>
                <div className="text-sm text-muted-foreground text-center">
                  {tool.pricing === 'free' ? 'Free to use' :
                   tool.pricing === 'freemium' ? 'Free to try • Premium features available' :
                   'Paid service'}
                </div>
              </CardContent>
            </Card>

            {/* Tool Info */}
            <Card>
              <CardHeader>
                <CardTitle>{t('tool.information', 'Tool Information')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-medium">{t('tool.category', 'Category')}</div>
                  <div className="text-sm text-muted-foreground capitalize">
                    {tool.category.replace('-', ' ')}
                  </div>
                </div>
                <Separator />
                <div>
                  <div className="text-sm font-medium">{t('tool.pricing', 'Pricing')}</div>
                  <div className="text-sm text-muted-foreground capitalize">
                    {tool.pricing}
                  </div>
                </div>
                <Separator />
                {tool.full_data?.rating && tool.full_data.rating > 0 && (
                  <>
                    <div>
                      <div className="text-sm font-medium">{t('tool.rating', 'Rating')}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {tool.full_data.rating.toFixed(1)}
                      </div>
                    </div>
                    <Separator />
                  </>
                )}
                {tool.full_data?.view_count && tool.full_data.view_count > 0 && (
                  <>
                    <div>
                      <div className="text-sm font-medium">{t('tool.views', 'Views')}</div>
                      <div className="text-sm text-muted-foreground">
                        {tool.full_data.view_count.toLocaleString()}
                      </div>
                    </div>
                    <Separator />
                  </>
                )}
                <div>
                  <div className="text-sm font-medium">{t('tool.added', 'Added')}</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(tool.created_at).toLocaleDateString()}
                  </div>
                </div>
                {tool.updated_at !== tool.created_at && (
                  <>
                    <Separator />
                    <div>
                      <div className="text-sm font-medium">{t('tool.lastUpdated', 'Last Updated')}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(tool.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Related Tools */}
        <div className="mt-16">
          <ToolGrid
            tools={relatedTools}
            title={t('tool.relatedTools', 'Related Tools')}
            subtitle={t('tool.relatedToolsSubtitle', 'Other AI tools you might find useful')}
            showViewAll={false}
            loading={relatedLoading}
          />
        </div>
      </div>
    </div>
  )
}
