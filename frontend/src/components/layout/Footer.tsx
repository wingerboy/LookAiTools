import { Link } from 'react-router-dom'
import { Github, Twitter, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useTranslation } from 'react-i18next'

export default function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="border-t border-border glass-effect">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-effect">
                <span className="text-primary-foreground font-bold text-lg">L</span>
              </div>
              <span className="font-bold text-xl gradient-text">Look AI Tools</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('footer.subtitle')}
            </p>
            <div className="flex space-x-2">
              <Button variant="ghost" size="icon">
                <Github className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h3 className="font-semibold">{t('footer.quickLinks')}</h3>
            <div className="space-y-2 text-sm">
              <Link to="/categories" className="block text-muted-foreground hover:text-foreground transition-colors">
                Browse Tools
              </Link>
              <Link to="/categories" className="block text-muted-foreground hover:text-foreground transition-colors">
                Categories
              </Link>
              <Link to="/submit" className="block text-muted-foreground hover:text-foreground transition-colors">
                Submit Tool
              </Link>
              <Link to="/api" className="block text-muted-foreground hover:text-foreground transition-colors">
                API
              </Link>
            </div>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="font-semibold">{t('footer.resources')}</h3>
            <div className="space-y-2 text-sm">
              <Link to="/blog" className="block text-muted-foreground hover:text-foreground transition-colors">
                Blog
              </Link>
              <Link to="/guides" className="block text-muted-foreground hover:text-foreground transition-colors">
                Guides
              </Link>
              <Link to="/help" className="block text-muted-foreground hover:text-foreground transition-colors">
                Help Center
              </Link>
              <Link to="/changelog" className="block text-muted-foreground hover:text-foreground transition-colors">
                Changelog
              </Link>
            </div>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="font-semibold">{t('footer.support')}</h3>
            <div className="space-y-2 text-sm">
              <Link to="/about" className="block text-muted-foreground hover:text-foreground transition-colors">
                {t('footer.about')}
              </Link>
              <Link to="/contact" className="block text-muted-foreground hover:text-foreground transition-colors">
                {t('footer.contact')}
              </Link>
              <Link to="/privacy" className="block text-muted-foreground hover:text-foreground transition-colors">
                {t('footer.privacy')}
              </Link>
              <Link to="/terms" className="block text-muted-foreground hover:text-foreground transition-colors">
                {t('footer.terms')}
              </Link>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-muted-foreground">
            {t('footer.copyright')}
          </p>
          <p className="text-sm text-muted-foreground">
            Made with ❤️ for the AI community
          </p>
        </div>
      </div>
    </footer>
  )
}
