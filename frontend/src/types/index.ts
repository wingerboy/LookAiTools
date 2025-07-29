// 双语文本接口
export interface BilingualText {
  en: string;
  cn: string;
}

// AI工具接口 - 兼容数据库结构
export interface AITool {
  id: string;
  slug?: string; // 工具的URL友好标识符
  name: string; // 简化的名称（当前语言）
  title: string; // 简化的标题（当前语言）
  description: string; // 简化的描述（当前语言）
  url: string;
  thumbnail_url?: string;
  category: string;
  tags?: string[]; // 简化的标签数组（当前语言）
  pricing: 'free' | 'freemium' | 'paid' | 'unknown';
  featured: boolean;
  rating?: number;
  traffic?: number;
  created_at: string;
  updated_at: string;
  // 详情页额外字段
  long_description?: string;
  use_cases?: string;
  target_audience?: string;
  subcategory?: string;
  industry_tags?: string[];
  key_features?: string[];
  category_description?: string;
  // 完整的双语数据（可选，用于详情页面）
  full_data?: {
    name: BilingualText;
    title: BilingualText;
    description: BilingualText;
    long_description?: BilingualText;
    key_features?: BilingualText[];
    use_cases?: BilingualText;
    target_audience?: BilingualText;
    subcategory?: BilingualText;
    tags?: BilingualText[];
    industry_tags?: BilingualText[];
    pricing_type?: BilingualText;
    pricing_details?: any;
    trial_available?: BilingualText;
    rating?: number;
    view_count?: number;
    traffic_estimate?: number;
    featured?: boolean;
    status?: string;
    slug?: string;
    page_screenshot?: string;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  count?: number;
}

export interface SearchFilters {
  category?: string;
  pricing?: string;
  tags?: string[];
  featured?: boolean;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface APIResponse<T> {
  data: T;
  pagination?: PaginationInfo;
  success: boolean;
  message?: string;
}

// Chat-related types
export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: {
    tools?: AITool[];
    suggestions?: string[];
    intent?: string;
  };
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  status: 'active' | 'completed' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface ToolRecommendation {
  tool: AITool;
  score: number;
  reason: string;
  matchedFeatures: string[];
}
