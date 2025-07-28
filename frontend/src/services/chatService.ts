import type { ChatMessage, AITool } from '@/types'

// Mock tools data for demonstration
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
    traffic: 15000,
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
    traffic: 8500,
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  },
  {
    id: '3',
    name: 'github-copilot',
    title: 'GitHub Copilot',
    description: 'AI pair programmer that helps you write code faster with intelligent code completions and suggestions.',
    url: 'https://github.com/features/copilot',
    thumbnail_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop',
    category: 'code-assistant',
    tags: ['coding', 'programming', 'developer-tools', 'ai-assistant'],
    pricing: 'paid',
    featured: false,
    traffic: 12000,
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  },
  {
    id: '4',
    name: 'canva-ai',
    title: 'Canva AI',
    description: 'AI-powered design platform with smart design suggestions, background removal, and content generation.',
    url: 'https://canva.com',
    thumbnail_url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop',
    category: 'design',
    tags: ['design', 'graphics', 'templates', 'creative'],
    pricing: 'freemium',
    featured: true,
    traffic: 9200,
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  },
  {
    id: '5',
    name: 'runway-ml',
    title: 'Runway ML',
    description: 'AI-powered video editing and generation platform with advanced machine learning capabilities.',
    url: 'https://runwayml.com',
    thumbnail_url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=300&fit=crop',
    category: 'video-editing',
    tags: ['video-editing', 'ai-generation', 'creative', 'machine-learning'],
    pricing: 'freemium',
    featured: false,
    traffic: 3400,
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  }
]

// Intent classification patterns
const intentPatterns = {
  writing: ['写作', '文案', '写文章', '内容创作', '博客', '文字'],
  'image-generation': ['图片', '图像', '画图', '生成图片', '设计图', '插画', '艺术'],
  'code-assistant': ['代码', '编程', '开发', '程序', 'coding', 'programming'],
  'video-editing': ['视频', '剪辑', '视频编辑', '影片'],
  design: ['设计', '平面设计', '海报', '模板'],
  productivity: ['效率', '生产力', '办公', '工作']
}

// Simulate AI response with tool recommendations
export async function sendChatMessage(message: string, sessionId?: string): Promise<ChatMessage> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000))

  // Simple intent detection
  const detectedIntent = detectIntent(message)
  const recommendedTools = getRecommendedTools(detectedIntent, message)

  // Generate response based on intent
  let responseContent = generateResponse(detectedIntent, message, recommendedTools)

  const response: ChatMessage = {
    id: Date.now().toString(),
    type: 'assistant',
    content: responseContent,
    timestamp: new Date().toISOString(),
    metadata: {
      tools: recommendedTools,
      suggestions: generateSuggestions(detectedIntent),
      intent: detectedIntent
    }
  }

  return response
}

function detectIntent(message: string): string {
  const lowerMessage = message.toLowerCase()
  
  for (const [intent, patterns] of Object.entries(intentPatterns)) {
    if (patterns.some(pattern => lowerMessage.includes(pattern))) {
      return intent
    }
  }
  
  return 'general'
}

function getRecommendedTools(intent: string, message: string): AITool[] {
  if (intent === 'general') {
    // Return popular tools for general queries
    return mockTools.filter(tool => tool.featured).slice(0, 2)
  }
  
  // Filter tools by category/intent
  const filteredTools = mockTools.filter(tool => 
    tool.category === intent || 
    tool.tags.some(tag => intentPatterns[intent as keyof typeof intentPatterns]?.includes(tag))
  )
  
  return filteredTools.slice(0, 3)
}

function generateResponse(intent: string, message: string, tools: AITool[]): string {
  const responses = {
    writing: `我理解您需要写作相关的AI工具。根据您的需求，我为您推荐以下${tools.length}个优秀的写作工具：`,
    'image-generation': `看起来您想要图片生成工具！以下是我为您精选的${tools.length}个AI图像生成工具：`,
    'code-assistant': `作为开发者，您一定需要强大的代码助手。这里有${tools.length}个顶级的AI编程工具推荐：`,
    'video-editing': `视频编辑确实需要专业工具。我为您找到了${tools.length}个优秀的AI视频编辑平台：`,
    design: `设计工作需要创意和效率并重。以下${tools.length}个AI设计工具值得尝试：`,
    general: `我为您推荐一些热门的AI工具，这些都是用户评价很高的选择：`
  }

  const baseResponse = responses[intent as keyof typeof responses] || responses.general

  if (tools.length === 0) {
    return `抱歉，我暂时没有找到完全匹配您需求的工具。不过我可以为您推荐一些相关的优秀AI工具，或者您可以更详细地描述您的具体需求？`
  }

  return baseResponse
}

function generateSuggestions(intent: string): string[] {
  const suggestions = {
    writing: ['比较价格', '查看免费版功能', '了解中文支持', '寻找替代工具'],
    'image-generation': ['了解生成质量', '比较不同风格', '查看价格方案', '免费试用'],
    'code-assistant': ['支持的编程语言', '集成开发环境', '价格对比', '免费版限制'],
    'video-editing': ['支持的格式', '导出质量', '学习难度', '价格信息'],
    design: ['模板数量', '协作功能', '导出格式', '商用授权'],
    general: ['了解更多功能', '查看用户评价', '比较同类工具', '获取使用教程']
  }

  return suggestions[intent as keyof typeof suggestions] || suggestions.general
}

// Create a new chat session
export function createChatSession(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Get initial welcome message
export function getWelcomeMessage(): ChatMessage {
  return {
    id: 'welcome',
    type: 'assistant',
    content: '欢迎使用AI工具助手！我可以帮您：\n\n• 根据需求推荐最适合的AI工具\n• 比较不同工具的优缺点\n• 解答工具使用相关问题\n• 发现您可能不知道的优秀工具\n\n请告诉我您想要解决什么问题？',
    timestamp: new Date().toISOString(),
    metadata: {
      suggestions: [
        '我想要写作工具',
        '需要图片生成工具', 
        '寻找代码助手',
        '视频编辑工具',
        '数据分析工具',
        '语音处理工具'
      ]
    }
  }
}
