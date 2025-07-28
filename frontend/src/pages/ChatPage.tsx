import { useState, useRef, useEffect } from 'react'
import { Send, Bot, ArrowLeft, Sparkles } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { sendChatMessage, getWelcomeMessage, createChatSession } from '@/services/chatService'
import type { ChatMessage } from '@/types'
import ChatMessageComponent from '@/components/chat/ChatMessage'

export default function ChatPage() {
  const [searchParams] = useSearchParams()
  const [messages, setMessages] = useState<ChatMessage[]>([getWelcomeMessage()])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId] = useState(() => createChatSession())
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Handle initial query from URL params
  useEffect(() => {
    const initialQuery = searchParams.get('q')
    if (initialQuery) {
      setInputValue(initialQuery)
      // Auto-send the initial query
      setTimeout(() => {
        handleSendWithQuery(initialQuery)
      }, 500)
    }
  }, [searchParams])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendWithQuery = async (query: string) => {
    if (!query.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: query,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      const assistantMessage = await sendChatMessage(query, sessionId)
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: '抱歉，我遇到了一些问题。请稍后再试或重新描述您的需求。',
        timestamp: new Date().toISOString(),
        metadata: {
          suggestions: ['重新提问', '查看热门工具', '浏览分类']
        }
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSend = async () => {
    const query = inputValue
    setInputValue('')
    await handleSendWithQuery(query)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Bot className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="font-semibold text-foreground">AI工具助手</h1>
                  <p className="text-sm text-muted-foreground">智能推荐 • 精准匹配</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">在线</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6 mb-6">
            {messages.map((message) => (
              <ChatMessageComponent
                key={message.id}
                message={message}
                onSuggestionClick={handleSuggestionClick}
              />
            ))}
            {isLoading && (
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Bot className="h-4 w-4" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm">AI正在思考...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="sticky bottom-0 bg-background/80 backdrop-blur-sm border-t border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="描述您的需求，或者问我任何关于AI工具的问题..."
                    className="h-12 pr-12 text-base"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isLoading}
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 bg-gradient-to-br from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  按 Enter 发送消息，Shift + Enter 换行
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
