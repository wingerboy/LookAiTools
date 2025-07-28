import { useState } from 'react'
import { Sparkles, Zap, Heart, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EnhancedButton } from '@/components/ui/enhanced-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function DemoPage() {
  const [liked, setLiked] = useState(false)

  return (
    <div className="min-h-screen bg-background relative overflow-hidden cyber-grid">
      {/* 科技风背景装饰 */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-br from-primary/30 to-accent/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-gradient-to-br from-accent/30 to-info/30 rounded-full blur-3xl animate-float" style={{animationDelay: '3s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl animate-pulse-slow"></div>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-5xl font-bold mb-6">
            <span className="gradient-text neon-glow">Cyber Tech UI Components</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience our cutting-edge design system with cyberpunk aesthetics, holographic effects, and futuristic interactions.
          </p>
        </div>

        {/* Button Showcase */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Enhanced Buttons</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="glass-effect hover-lift">
              <CardHeader>
                <CardTitle>Default Buttons</CardTitle>
                <CardDescription>Beautiful gradient buttons with hover effects</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <EnhancedButton className="w-full">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Primary Button
                </EnhancedButton>
                <EnhancedButton variant="secondary" className="w-full">
                  Secondary Button
                </EnhancedButton>
                <EnhancedButton variant="outline" className="w-full">
                  Outline Button
                </EnhancedButton>
              </CardContent>
            </Card>

            <Card className="glass-effect hover-lift">
              <CardHeader>
                <CardTitle>Special Effects</CardTitle>
                <CardDescription>Buttons with unique animations and styles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <EnhancedButton variant="gradient" className="w-full">
                  <Zap className="mr-2 h-4 w-4" />
                  Gradient Button
                </EnhancedButton>
                <EnhancedButton 
                  variant={liked ? "destructive" : "outline"} 
                  className="w-full"
                  onClick={() => setLiked(!liked)}
                >
                  <Heart className={`mr-2 h-4 w-4 ${liked ? 'fill-current' : ''}`} />
                  {liked ? 'Liked!' : 'Like This'}
                </EnhancedButton>
                <EnhancedButton variant="ghost" className="w-full">
                  Ghost Button
                </EnhancedButton>
              </CardContent>
            </Card>

            <Card className="glass-effect hover-lift">
              <CardHeader>
                <CardTitle>Interactive Elements</CardTitle>
                <CardDescription>Buttons with feedback and animations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <EnhancedButton size="lg" className="w-full animate-pulse-slow">
                  <Star className="mr-2 h-4 w-4" />
                  Featured Action
                </EnhancedButton>
                <EnhancedButton size="sm" className="w-full">
                  Small Button
                </EnhancedButton>
                <EnhancedButton variant="link" className="w-full">
                  Link Button
                </EnhancedButton>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Badge Showcase */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Enhanced Badges</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white animate-bounce-slow">
              Free
            </Badge>
            <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
              Freemium
            </Badge>
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              Premium
            </Badge>
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white animate-pulse-slow">
              <Star className="w-3 h-3 mr-1 fill-current" />
              Featured
            </Badge>
            <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white">
              Hot
            </Badge>
            <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
              New
            </Badge>
          </div>
        </div>

        {/* Card Showcase */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Glass Effect Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="glass-effect hover-lift stagger-animation">
                <CardHeader>
                  <div className="w-full h-32 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-lg mb-4 flex items-center justify-center">
                    <div className="text-4xl font-bold text-primary/30">#{i}</div>
                  </div>
                  <CardTitle>Glass Card {i}</CardTitle>
                  <CardDescription>
                    Beautiful glass effect with backdrop blur and subtle shadows
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 mb-4">
                    <Badge variant="secondary">Design</Badge>
                    <Badge variant="outline">Modern</Badge>
                  </div>
                  <EnhancedButton size="sm" className="w-full">
                    Explore
                  </EnhancedButton>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Animation Showcase */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-8">Smooth Animations</h2>
          <div className="space-y-4">
            <div className="animate-float">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mx-auto mb-4"></div>
            </div>
            <p className="text-muted-foreground">
              All elements feature smooth transitions, hover effects, and delightful micro-interactions
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
