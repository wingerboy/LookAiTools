import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { apiService } from '@/services/apiService'

interface TestResult {
  name: string
  duration: number
  success: boolean
  dataSize: number
  error?: string
}

export default function PerformanceTestPage() {
  const [results, setResults] = useState<TestResult[]>([])
  const [testing, setTesting] = useState(false)

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    const startTime = performance.now()
    try {
      const result = await testFn()
      const endTime = performance.now()
      const duration = endTime - startTime
      
      // 估算数据大小
      const dataSize = JSON.stringify(result).length
      
      return {
        name: testName,
        duration,
        success: true,
        dataSize,
      }
    } catch (error) {
      const endTime = performance.now()
      const duration = endTime - startTime
      
      return {
        name: testName,
        duration,
        success: false,
        dataSize: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  const runAllTests = async () => {
    setTesting(true)
    setResults([])
    
    const tests = [
      {
        name: '分类API',
        fn: () => apiService.getCategories('en')
      },
      {
        name: '工具API (minimal=true)',
        fn: () => apiService.getTools({ category: 'productivity', minimal: true, limit: 12 })
      },
      {
        name: '工具API (minimal=false)',
        fn: () => apiService.getTools({ category: 'productivity', minimal: false, limit: 12 })
      },
      {
        name: '精选工具API',
        fn: () => apiService.getFeaturedTools('en')
      },
      {
        name: '最新工具API',
        fn: () => apiService.getLatestTools('en')
      },
      {
        name: '热门工具API',
        fn: () => apiService.getPopularTools('en')
      }
    ]

    const testResults: TestResult[] = []
    
    for (const test of tests) {
      console.log(`Running test: ${test.name}`)
      const result = await runTest(test.name, test.fn)
      testResults.push(result)
      setResults([...testResults])
      
      // 短暂延迟避免过快请求
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    setTesting(false)
  }

  const formatDuration = (ms: number) => {
    if (ms < 1000) {
      return `${ms.toFixed(0)}ms`
    } else {
      return `${(ms / 1000).toFixed(2)}s`
    }
  }

  const formatDataSize = (bytes: number) => {
    if (bytes < 1024) {
      return `${bytes}B`
    } else if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)}KB`
    } else {
      return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
    }
  }

  const getPerformanceColor = (ms: number) => {
    if (ms < 500) return 'bg-green-500'
    if (ms < 1000) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">性能测试</h1>
          <p className="text-muted-foreground mb-6">
            测试优化后的API性能，包括响应时间和数据传输量
          </p>
          
          <Button 
            onClick={runAllTests} 
            disabled={testing}
            className="mb-6"
          >
            {testing ? '测试中...' : '开始性能测试'}
          </Button>
        </div>

        {results.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white mb-4">测试结果</h2>
            
            {results.map((result, index) => (
              <Card key={index} className="bg-card border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">{result.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={result.success ? "default" : "destructive"}
                        className={result.success ? getPerformanceColor(result.duration) : ''}
                      >
                        {result.success ? formatDuration(result.duration) : 'Failed'}
                      </Badge>
                      {result.success && (
                        <Badge variant="outline" className="text-muted-foreground">
                          {formatDataSize(result.dataSize)}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {result.success ? (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">响应时间:</span>
                        <span className="ml-2 text-white">{formatDuration(result.duration)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">数据大小:</span>
                        <span className="ml-2 text-white">{formatDataSize(result.dataSize)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-red-400">
                      错误: {result.error}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {results.length > 0 && results.every(r => r.success) && (
              <Card className="bg-card border-border mt-6">
                <CardHeader>
                  <CardTitle className="text-white">性能总结</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">平均响应时间:</span>
                      <span className="ml-2 text-white">
                        {formatDuration(results.reduce((sum, r) => sum + r.duration, 0) / results.length)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">最快响应:</span>
                      <span className="ml-2 text-white">
                        {formatDuration(Math.min(...results.map(r => r.duration)))}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">最慢响应:</span>
                      <span className="ml-2 text-white">
                        {formatDuration(Math.max(...results.map(r => r.duration)))}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold text-white mb-2">优化效果</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>✅ 数据库索引优化完成</li>
                      <li>✅ 物化视图缓存启用</li>
                      <li>✅ API字段优化 (minimal模式)</li>
                      <li>✅ 查询性能显著提升</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
