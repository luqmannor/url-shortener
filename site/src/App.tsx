import { useState, useEffect } from 'react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import {
  Link2,
  Copy,
  Check,
  Trash2,
  LogOut,
  ArrowRight,
  ExternalLink
} from 'lucide-react'

// Immediate redirect check for slug paths
const slugMatch = window.location.pathname.match(/^\/([a-z0-9\-]+)$/i)
if (slugMatch) {
  const slug = slugMatch[1]
  window.location.replace(`https://url-shortener.hakimnoralahyadi.workers.dev/${slug}`)
}

const API = 'https://url-shortener.hakimnoralahyadi.workers.dev'

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }
  })
}

interface LinkItem {
  slug: string
  url: string
  clicks: number
  created: string
}

function App() {
  const [token, setToken] = useState<string>(() => localStorage.getItem('go_token') || '')
  const [password, setPassword] = useState('')
  const [urlInput, setUrlInput] = useState('')
  const [slugInput, setSlugInput] = useState('')
  const [links, setLinks] = useState<LinkItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null)
  
  // Message state
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  const showMessage = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 5000)
  }

  const loadLinks = async (authToken: string) => {
    setIsLoading(true)
    try {
      const res = await fetch(`${API}/api/links`, {
        headers: { 'Authorization': `Bearer ${authToken}` },
      })
      if (!res.ok) {
        if (res.status === 401) {
          showMessage('Invalid password', 'error')
          handleLogout()
          return
        }
        throw new Error('Failed to load links')
      }
      const data = await res.json()
      setLinks(data.links || [])
    } catch (err: any) {
      showMessage(err.message, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      loadLinks(token)
    }
  }, [token])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) return
    localStorage.setItem('go_token', password)
    setToken(password)
    setPassword('')
  }

  const handleLogout = () => {
    localStorage.removeItem('go_token')
    setToken('')
    setLinks([])
    setMessage(null)
  }

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!urlInput.trim()) return
    
    try {
      const res = await fetch(`${API}/api/shorten`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ url: urlInput, slug: slugInput || undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to shorten URL')
      
      showMessage(`Created short URL: go.luqmannor.com/${data.slug || slugInput}`)
      setUrlInput('')
      setSlugInput('')
      loadLinks(token)
    } catch (err: any) {
      showMessage(err.message, 'error')
    }
  }

  const handleDelete = async (slug: string) => {
    if (!confirm(`Are you sure you want to delete /${slug}?`)) return
    try {
      const res = await fetch(`${API}/api/links/${slug}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Failed to delete link')
      showMessage('Link deleted successfully')
      loadLinks(token)
    } catch (err: any) {
      showMessage(err.message, 'error')
    }
  }

  const handleCopy = (slug: string) => {
    navigator.clipboard.writeText(`https://go.luqmannor.com/${slug}`)
    setCopiedSlug(slug)
    setTimeout(() => setCopiedSlug(null), 2000)
  }

  return (
    <div className="relative w-full min-h-screen font-sans flex flex-col items-center justify-center p-4 sm:p-8 overflow-x-hidden">
      {/* Background Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover -z-10"
      >
        <source src="/0527.mov" type="video/quicktime" />
        <source src="/0527.mov" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-[#070708]/65 backdrop-blur-[3px] -z-10" />

      {/* Main Container */}
      <div className="w-full max-w-[640px] bg-white/10 backdrop-blur-[20px] border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-2xl flex flex-col z-10">
        
        {/* Header Block */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-4xl sm:text-5xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <Link2 className="w-8 h-8 text-[#7342E2]" />
              <span>go/</span>
            </h1>
            <p className="text-white/60 text-sm mt-1">go.luqmannor.com — URL Shortener</p>
          </div>
          {token && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:text-white hover:bg-white/10 transition-all text-xs font-medium cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          )}
        </div>

        {/* Message Banner */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-4 rounded-xl mb-6 text-sm flex items-center justify-between border ${
                message.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                  : 'bg-red-500/10 border-red-500/20 text-red-300'
              }`}
            >
              <span>{message.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Conditional Sections */}
        {!token ? (
          /* Login View */
          <motion.form
            onSubmit={handleLogin}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-4 items-center w-full"
          >
            <motion.div variants={fadeUp} custom={0} className="w-full flex flex-col gap-1 text-center">
              <p className="text-white/80 text-sm mb-2">Please enter the admin password to start the URL shortener.</p>
            </motion.div>
            
            <motion.div variants={fadeUp} custom={1} className="w-full max-w-[360px]">
              <input
                type="password"
                placeholder="Admin Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/40 border border-white/10 focus:border-[#7342E2]/60 focus:ring-2 focus:ring-[#7342E2]/20 rounded-xl px-4 py-3 text-white text-center placeholder-white/30 focus:outline-none transition-all"
                required
              />
            </motion.div>

            <motion.div variants={fadeUp} custom={2} className="w-full max-w-[360px]">
              <button
                type="submit"
                className="w-full bg-[#7342E2] hover:brightness-110 active:scale-[0.98] text-white rounded-xl py-3 px-5 font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#7342E2]/25"
              >
                <span>Start Shortening</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          </motion.form>
        ) : (
          /* Shortener Dashboard View */
          <div className="flex flex-col w-full">
            {/* Shortener Form */}
            <form onSubmit={handleShorten} className="flex flex-col gap-4 mb-8">
              <div className="flex flex-col gap-1">
                <input
                  type="url"
                  placeholder="https://example.com/very-long-url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 focus:border-[#7342E2]/60 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none transition-all"
                  required
                />
              </div>
              
              <div className="flex flex-col gap-1">
                <input
                  type="text"
                  placeholder="custom-slug (optional)"
                  value={slugInput}
                  onChange={(e) => setSlugInput(e.target.value)}
                  pattern="[a-z0-9\-]+"
                  title="Only lowercase letters, numbers, and hyphens are allowed"
                  className="w-full bg-black/30 border border-white/10 focus:border-[#7342E2]/60 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#7342E2] hover:brightness-110 active:scale-[0.98] text-white rounded-xl py-3 font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#7342E2]/25"
              >
                <span>Shorten URL</span>
              </button>
            </form>

            {/* Links Header */}
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
              <h2 className="text-white font-semibold text-lg">Shortened Links</h2>
              {isLoading && <span className="text-xs text-white/50 animate-pulse">refreshing...</span>}
            </div>

            {/* Links List */}
            <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1">
              {links.length === 0 ? (
                <div className="text-center py-8 text-white/40 text-sm">
                  {isLoading ? 'Loading links...' : 'No links created yet.'}
                </div>
              ) : (
                links.map((link) => (
                  <div
                    key={link.slug}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/5 border border-white/5 hover:border-white/10 rounded-xl p-4 transition-all"
                  >
                    <div className="flex-grow min-w-0">
                      <a
                        href={`https://go.luqmannor.com/${link.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#c084fc] hover:underline font-mono font-semibold text-sm flex items-center gap-1.5 break-all transition-colors"
                      >
                        <span>go.luqmannor.com/{link.slug}</span>
                        <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-70" />
                      </a>
                      <div className="text-white/40 text-xs truncate mt-1">{link.url}</div>
                      <div className="text-white/30 text-[10px] mt-1.5 flex items-center gap-2">
                        <span>{link.clicks} clicks</span>
                        <span>•</span>
                        <span>{new Date(link.created).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 self-end sm:self-center shrink-0">
                      <button
                        onClick={() => handleCopy(link.slug)}
                        className="p-2 rounded-lg bg-white/5 border border-white/5 text-white/80 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
                        title="Copy to clipboard"
                      >
                        {copiedSlug === link.slug ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      
                      <button
                        onClick={() => handleDelete(link.slug)}
                        className="p-2 rounded-lg bg-red-500/10 border border-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all cursor-pointer"
                        title="Delete short link"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
