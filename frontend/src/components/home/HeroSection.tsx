import { useState } from 'react'
import { Search, ArrowRight, Bot, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTranslation } from 'react-i18next'

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchMode, setSearchMode] = useState<'search' | 'chat'>('search')
  const { t } = useTranslation()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      if (searchMode === 'search') {
        window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`
      } else {
        // Handle chat mode - navigate to chat page with initial query
        window.location.href = `/chat?q=${encodeURIComponent(searchQuery)}`
      }
    }
  }

  return (
    <section className="relative py-20 md:py-32 bg-background overflow-hidden">
      {/* 科技风背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        {/* 主要发光球体 */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/30 to-accent/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-accent/30 to-info/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl"></div>

        {/* 网格背景 */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(37,99,235,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,0.1)_1px,transparent_1px)] bg-[size:50px_50px] opacity-20"></div>

        {/* 额外的小光点 */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-info/40 to-success/40 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-gradient-to-br from-warning/40 to-accent/40 rounded-full blur-2xl"></div>
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Main Heading */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              {t('home.hero.title')}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              {t('home.hero.subtitle')}
            </p>
          </div>

          {/* Search Mode Toggle */}
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Button
                variant={searchMode === 'search' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSearchMode('search')}
                className="rounded-full"
              >
                <Search className="h-4 w-4 mr-2" />
                {t('common.search')}
              </Button>
              <Button
                variant={searchMode === 'chat' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSearchMode('chat')}
                className="rounded-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              >
                <Bot className="h-4 w-4 mr-2" />
                {t('navigation.chat')}
                <Sparkles className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative flex items-center glass-effect rounded-2xl p-3 glow-effect">
                {searchMode === 'search' ? (
                  <Search className="absolute left-6 h-5 w-5 text-muted-foreground" />
                ) : (
                  <Bot className="absolute left-6 h-5 w-5 text-primary" />
                )}
                <Input
                  type="search"
                  placeholder={
                    searchMode === 'search'
                      ? t('home.hero.searchPlaceholder')
                      : t('chat.placeholder')
                  }
                  className="h-12 md:h-14 pl-14 pr-20 md:pr-32 text-base md:text-lg border-0 bg-transparent focus:ring-2 focus:ring-primary/30 rounded-xl text-foreground placeholder:text-muted-foreground"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button
                  type="submit"
                  className={`absolute right-3 h-8 md:h-10 text-sm md:text-base ${
                    searchMode === 'chat'
                      ? 'bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90'
                      : 'btn-primary'
                  }`}
                  disabled={!searchQuery.trim()}
                >
                  {searchMode === 'search' ? (
                    <>
                      <span className="hidden sm:inline">{t('common.search')}</span>
                      <span className="sm:hidden">{t('common.search')}</span>
                      <ArrowRight className="ml-1 md:ml-2 h-3 w-3 md:h-4 md:w-4" />
                    </>
                  ) : (
                    <>
                      <span className="hidden sm:inline">{t('navigation.chat')}</span>
                      <span className="sm:hidden">AI</span>
                      <Sparkles className="ml-1 md:ml-2 h-3 w-3 md:h-4 md:w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Popular Searches */}
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Popular searches:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                'ChatGPT',
                'Image Generation',
                'Code Assistant',
                'Writing Tools',
                'Video Editing',
                'Data Analysis'
              ].map((term) => (
                <Button
                  key={term}
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => {
                    setSearchQuery(term)
                    window.location.href = `/search?q=${encodeURIComponent(term)}`
                  }}
                >
                  {term}
                </Button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">1000+</div>
              <div className="text-sm text-muted-foreground">{t('home.stats.tools')}</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">50+</div>
              <div className="text-sm text-muted-foreground">{t('home.stats.categories')}</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">10K+</div>
              <div className="text-sm text-muted-foreground">{t('home.stats.users')}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
