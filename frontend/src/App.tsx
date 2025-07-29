import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navigation from '@/components/layout/Navigation'
import Footer from '@/components/layout/Footer'
import ChatButton from '@/components/chat/ChatButton'
import ErrorBoundary from '@/components/ErrorBoundary'
import HomePage from '@/pages/HomePage'
import SearchPage from '@/pages/SearchPage'
import CategoriesPage from '@/pages/CategoriesPage'
import ToolDetailPage from '@/pages/ToolDetailPage'
import DemoPage from '@/pages/DemoPage'
import ChatPage from '@/pages/ChatPage'
import SubmitToolPage from '@/pages/SubmitToolPage'
import DebugPage from '@/pages/DebugPage'






import { LanguageProvider } from '@/contexts/LanguageContext'
import '@/i18n'
import '@/styles/globals.css'

function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <Router>
          <div className="min-h-screen flex flex-col">
            <Navigation />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                {/* Add more routes as needed */}
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/submit" element={<SubmitToolPage />} />

                <Route path="/search" element={<SearchPage />} />
                <Route path="/tools/:slug" element={<ToolDetailPage />} />
                <Route path="/demo" element={<DemoPage />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/debug" element={<DebugPage />} />





              </Routes>
            </main>
            <Footer />

            {/* Global Chat Button */}
            <ChatButton />
          </div>
        </Router>
      </LanguageProvider>
    </ErrorBoundary>
  )
}

export default App
