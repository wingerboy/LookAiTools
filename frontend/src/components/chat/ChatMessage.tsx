import { Bot, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'
import type { ChatMessage as ChatMessageType } from '@/types'
import ToolCard from './ToolCard'

interface ChatMessageProps {
  message: ChatMessageType
  onSuggestionClick: (suggestion: string) => void
}

export default function ChatMessage({ message, onSuggestionClick }: ChatMessageProps) {
  const isUser = message.type === 'user'

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div className={cn("flex max-w-[80%] space-x-2", isUser && "flex-row-reverse space-x-reverse")}>
        {/* Avatar */}
        <div className={cn(
          "flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center",
          isUser 
            ? "bg-gradient-to-br from-accent to-primary" 
            : "bg-gradient-to-br from-primary to-accent"
        )}>
          {isUser ? (
            <User className="h-4 w-4 text-primary-foreground" />
          ) : (
            <Bot className="h-4 w-4 text-primary-foreground" />
          )}
        </div>

        {/* Message Content */}
        <div className="space-y-2">
          <div className={cn(
            "px-4 py-2 rounded-2xl",
            isUser 
              ? "bg-gradient-to-br from-primary to-accent text-primary-foreground" 
              : "bg-muted text-muted-foreground"
          )}>
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          </div>

          {/* Tool Recommendations */}
          {message.metadata?.tools && message.metadata.tools.length > 0 && (
            <div className="space-y-3">
              {message.metadata.tools.map((tool) => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  reason={`基于您的需求推荐`}
                />
              ))}
            </div>
          )}

          {/* Quick Suggestions */}
          {message.metadata?.suggestions && message.metadata.suggestions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {message.metadata.suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs rounded-full"
                  onClick={() => onSuggestionClick(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          )}

          {/* Timestamp */}
          <p className="text-xs text-muted-foreground">
            {new Date(message.timestamp).toLocaleTimeString('zh-CN', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>
    </div>
  )
}
