import { useState, useEffect } from 'react'
import { apiService } from '@/services/apiService'
import type { AITool } from '@/types'

export default function TestPage() {
  const [tools, setTools] = useState<AITool[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTestData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await apiService.getFeaturedTools('en')
        
        if (response.success) {
          setTools(response.data)
          console.log('✅ API调用成功:', response.data)
        } else {
          setError(response.message || '获取数据失败')
          console.error('❌ API响应错误:', response.message)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '网络错误')
        console.error('❌ 网络错误:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTestData()
  }, [])

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">API测试页面</h1>
        
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">加载中...</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong>错误:</strong> {error}
          </div>
        )}
        
        {!loading && !error && (
          <div className="space-y-6">
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              <strong>成功:</strong> 获取到 {tools.length} 个工具
            </div>
            
            {tools.map((tool, index) => (
              <div key={tool.id} className="border rounded-lg p-6 bg-card">
                <h3 className="text-xl font-semibold mb-2">{tool.title}</h3>
                <p className="text-muted-foreground mb-4">{tool.description}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>ID:</strong> {tool.id}
                  </div>
                  <div>
                    <strong>分类:</strong> {tool.category}
                  </div>
                  <div>
                    <strong>定价:</strong> {tool.pricing}
                  </div>
                  <div>
                    <strong>精选:</strong> {tool.featured ? '是' : '否'}
                  </div>
                  <div className="col-span-2">
                    <strong>标签:</strong> 
                    {Array.isArray(tool.tags) ? (
                      tool.tags.length > 0 ? (
                        <span className="ml-2">
                          {tool.tags.join(', ')}
                        </span>
                      ) : (
                        <span className="ml-2 text-muted-foreground">无标签</span>
                      )
                    ) : (
                      <span className="ml-2 text-red-500">标签字段未定义</span>
                    )}
                  </div>
                </div>
                
                <details className="mt-4">
                  <summary className="cursor-pointer text-primary">查看原始数据</summary>
                  <pre className="mt-2 p-4 bg-muted rounded text-xs overflow-auto">
                    {JSON.stringify(tool, null, 2)}
                  </pre>
                </details>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
