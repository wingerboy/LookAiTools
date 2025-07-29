import { useState, useEffect } from 'react'
import { apiService } from '@/services/apiService'
import type { AITool, Category } from '@/types'

export default function DebugPage() {
  const [tools, setTools] = useState<AITool[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`])
  }

  useEffect(() => {
    const testApis = async () => {
      try {
        setLoading(true)
        addLog('开始测试API连接...')

        // 测试健康检查
        try {
          const health = await apiService.healthCheck()
          addLog(`✅ 健康检查成功: ${JSON.stringify(health)}`)
        } catch (err) {
          addLog(`❌ 健康检查失败: ${err}`)
        }

        // 测试分类API
        try {
          const categoriesResponse = await apiService.getCategories('en')
          addLog(`✅ 分类API响应: success=${categoriesResponse.success}, 数量=${categoriesResponse.data?.length || 0}`)
          if (categoriesResponse.success) {
            setCategories(categoriesResponse.data)
          }
        } catch (err) {
          addLog(`❌ 分类API失败: ${err}`)
        }

        // 测试工具API
        try {
          const toolsResponse = await apiService.getTools({ limit: 5, language: 'en' })
          addLog(`✅ 工具API响应: success=${toolsResponse.success}, 数量=${toolsResponse.data?.length || 0}`)
          if (toolsResponse.success) {
            setTools(toolsResponse.data)
          }
        } catch (err) {
          addLog(`❌ 工具API失败: ${err}`)
        }

        // 测试featured工具API
        try {
          const featuredResponse = await apiService.getFeaturedTools('en')
          addLog(`✅ Featured工具API响应: success=${featuredResponse.success}, 数量=${featuredResponse.data?.length || 0}`)
        } catch (err) {
          addLog(`❌ Featured工具API失败: ${err}`)
        }

        addLog('✅ API测试完成')
      } catch (err) {
        setError(err instanceof Error ? err.message : '未知错误')
        addLog(`❌ 测试过程出错: ${err}`)
      } finally {
        setLoading(false)
      }
    }

    testApis()
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">API 调试页面</h1>

      {/* 日志区域 */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">API 测试日志:</h2>
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-64 overflow-y-auto font-mono text-sm">
          {logs.map((log, index) => (
            <div key={index}>{log}</div>
          ))}
        </div>
      </div>

      {/* 错误信息 */}
      {error && (
        <div className="mb-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <h3 className="font-bold">错误信息:</h3>
          <p>{error}</p>
        </div>
      )}

      {/* 分类信息 */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">分类数据 ({categories.length}):</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.map((category) => (
            <div key={category.id} className="p-4 border rounded-lg">
              <h3 className="font-semibold">{category.name}</h3>
              <p className="text-sm text-gray-600">Slug: {category.slug}</p>
              <p className="text-sm text-gray-600">数量: {category.count || 0}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 工具信息 */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">工具数据 ({tools.length}):</h2>
        <div className="space-y-4">
          {tools.map((tool) => (
            <div key={tool.id} className="p-4 border rounded-lg">
              <h3 className="font-semibold">{tool.title}</h3>
              <p className="text-sm text-gray-600">{tool.description}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                  {tool.category}
                </span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                  {tool.pricing}
                </span>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                  评分: {tool.rating || tool.full_data?.rating || 'N/A'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2">正在测试API...</p>
        </div>
      )}
    </div>
  )
} 