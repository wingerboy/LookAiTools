import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Filter, SortAsc } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import ToolGrid from '@/components/tools/ToolGrid'
import type { AITool } from '@/types'

// Mock data - same as HomePage for now
const mockTools: AITool[] = [
  {
    id: '1',
    name: 'chatgpt',
    title: 'ChatGPT',
    description: 'Advanced AI chatbot for conversations, writing, coding, and problem-solving with natural language understanding.',
    url: 'https://chat.openai.com',
    thumbnail_url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop',
    category: 'writing',
    tags: ['chatbot', 'writing', 'coding', 'ai-assistant'],
    pricing: 'freemium',
    featured: true,
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  },
  {
    id: '2',
    name: 'midjourney',
    title: 'Midjourney',
    description: 'AI-powered image generation tool that creates stunning artwork and images from text descriptions.',
    url: 'https://midjourney.com',
    thumbnail_url: 'https://images.unsplash.com/photo-1686191128892-c1c5d5e8e4b8?w=400&h=300&fit=crop',
    category: 'image-generation',
    tags: ['image-generation', 'art', 'creative', 'design'],
    pricing: 'paid',
    featured: true,
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  },
  // Add more mock tools as needed
]

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [filteredTools, setFilteredTools] = useState<AITool[]>([])
  const [selectedPricing, setSelectedPricing] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')

  useEffect(() => {
    const query = searchParams.get('q') || ''
    setSearchQuery(query)
    
    // Filter tools based on search query
    let filtered = mockTools
    
    if (query) {
      filtered = filtered.filter(tool => 
        tool.title.toLowerCase().includes(query.toLowerCase()) ||
        tool.description.toLowerCase().includes(query.toLowerCase()) ||
        tool.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      )
    }
    
    if (selectedPricing) {
      filtered = filtered.filter(tool => tool.pricing === selectedPricing)
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(tool => tool.category === selectedCategory)
    }
    
    setFilteredTools(filtered)
  }, [searchParams, selectedPricing, selectedCategory])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchParams({ q: searchQuery })
  }

  const clearFilters = () => {
    setSelectedPricing('')
    setSelectedCategory('')
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for AI tools..."
              className="h-12 pl-12 pr-4 text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
          
          {searchParams.get('q') && (
            <div className="mt-4">
              <p className="text-muted-foreground">
                Search results for: <span className="font-semibold text-foreground">"{searchParams.get('q')}"</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Found {filteredTools.length} tools
              </p>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium">Filters:</span>
          </div>
          
          {/* Pricing Filter */}
          <div className="flex gap-2">
            {['free', 'freemium', 'paid'].map((pricing) => (
              <Badge
                key={pricing}
                variant={selectedPricing === pricing ? 'default' : 'outline'}
                className="cursor-pointer capitalize"
                onClick={() => setSelectedPricing(selectedPricing === pricing ? '' : pricing)}
              >
                {pricing}
              </Badge>
            ))}
          </div>
          
          {/* Category Filter */}
          <div className="flex gap-2">
            {['writing', 'image-generation', 'code-assistant', 'productivity'].map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                className="cursor-pointer capitalize"
                onClick={() => setSelectedCategory(selectedCategory === category ? '' : category)}
              >
                {category.replace('-', ' ')}
              </Badge>
            ))}
          </div>
          
          {(selectedPricing || selectedCategory) && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>

        {/* Results */}
        {searchParams.get('q') ? (
          <ToolGrid
            tools={filteredTools}
            title={`Search Results (${filteredTools.length})`}
            subtitle={`Results for "${searchParams.get('q')}"`}
            showViewAll={false}
          />
        ) : (
          <div className="text-center py-12">
            <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-2">Search AI Tools</h2>
            <p className="text-muted-foreground">
              Enter a search term to find the perfect AI tool for your needs
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
