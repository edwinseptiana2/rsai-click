import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { getPageBySlug } from '@/server/pages'
import { User } from 'lucide-react'
import { BACKGROUND_PATTERNS } from '@/components/microsite/background-patterns'

export const Route = createFileRoute('/$slug')({
  component: RouteComponent,
})

function RouteComponent() {
  const { slug } = Route.useParams()
  const [page, setPage] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) {
      setError('Invalid page URL')
      setIsLoading(false)
      return
    }

    async function load() {
      try {
        const data = await getPageBySlug({ data: slug } as any)
        if (!data) {
          setError('Page not found')
          return
        }
        setPage(data)
        
        // Update meta tags for og:image
        if (data.avatarUrl) {
          const ogImageMeta = document.querySelector('meta[property="og:image"]')
          if (ogImageMeta) {
            ogImageMeta.setAttribute('content', data.avatarUrl)
          } else {
            const meta = document.createElement('meta')
            meta.setAttribute('property', 'og:image')
            meta.setAttribute('content', data.avatarUrl)
            document.head.appendChild(meta)
          }
        }
        
        // Update og:title
        const ogTitleMeta = document.querySelector('meta[property="og:title"]')
        if (ogTitleMeta) {
          ogTitleMeta.setAttribute('content', data.title || 'Page')
        } else {
          const meta = document.createElement('meta')
          meta.setAttribute('property', 'og:title')
          meta.setAttribute('content', data.title || 'Page')
          document.head.appendChild(meta)
        }
        
        // Update og:description
        const ogDescMeta = document.querySelector('meta[property="og:description"]')
        if (ogDescMeta) {
          ogDescMeta.setAttribute('content', data.bio || '')
        } else {
          const meta = document.createElement('meta')
          meta.setAttribute('property', 'og:description')
          meta.setAttribute('content', data.bio || '')
          document.head.appendChild(meta)
        }
        
        // Update document title
        document.title = data.title || 'Page'
      } catch (err: any) {
        setError(err?.message || 'Failed to load page')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [slug])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-slate-600">Loading...</div>
      </div>
    )
  }

  if (error || !page) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Page not found</h1>
          <p className="text-slate-600">{error || 'The page you are looking for does not exist.'}</p>
        </div>
      </div>
    )
  }

  const bgPattern = BACKGROUND_PATTERNS.find(p => p.id === page.backgroundPattern) || BACKGROUND_PATTERNS[0]

  const bgStyle = bgPattern.pattern
    ? {
        backgroundColor: bgPattern.preview === "white" ? "white" : bgPattern.preview,
        backgroundImage: `url("${bgPattern.pattern}")`,
        backgroundSize: "40px 40px",
      }
    : bgPattern.bgClass
    ? {}
    : { backgroundColor: bgPattern.preview }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 sm:p-6 ${bgPattern.bgClass || ''}`} style={bgStyle}>
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 space-y-6 text-center">
          {/* Avatar */}
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-full bg-slate-200 border-4 border-white shadow-md overflow-hidden flex items-center justify-center flex-shrink-0">
              {page.avatarUrl ? (
                <img
                  src={page.avatarUrl}
                  alt={page.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={32} className="text-slate-400" />
              )}
            </div>
          </div>

          {/* Title & Bio */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {page.title}
            </h1>
            {page.bio && (
              <p className="text-slate-600 text-sm sm:text-base whitespace-pre-wrap">
                {page.bio}
              </p>
            )}
          </div>

          {/* Links */}
          {page.links && page.links.length > 0 && (
            <div className="space-y-3">
              {page.links.map((link: any) => {
                const buttonStyles = getButtonStyles(link.color, link.textColor)
                return (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block px-4 py-3 rounded-lg font-semibold text-sm sm:text-base transition-all hover:shadow-lg hover:-translate-y-0.5 ${buttonStyles.className}`}
                    style={buttonStyles.style}
                  >
                    {link.title}
                  </a>
                )
              })}
            </div>
          )}

          {/* Footer */}
          <div className="pt-4 border-t border-slate-200">
            <p className="text-xs text-slate-500">
              Created with <a href="/" className="text-slate-600 hover:text-slate-900 font-semibold">rsai.click</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function getButtonStyles(color: string, textColor: string) {
  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    default: { bg: 'bg-slate-900', text: 'text-white', border: 'border-slate-900' },
    blue: { bg: 'bg-blue-600', text: 'text-white', border: 'border-blue-600' },
    purple: { bg: 'bg-purple-600', text: 'text-white', border: 'border-purple-600' },
    pink: { bg: 'bg-pink-600', text: 'text-white', border: 'border-pink-600' },
    red: { bg: 'bg-red-600', text: 'text-white', border: 'border-red-600' },
    green: { bg: 'bg-green-600', text: 'text-white', border: 'border-green-600' },
    yellow: { bg: 'bg-yellow-500', text: 'text-slate-900', border: 'border-yellow-500' },
    orange: { bg: 'bg-orange-600', text: 'text-white', border: 'border-orange-600' },
  }

  const textColorMap: Record<string, string> = {
    default: 'text-white',
    black: 'text-black',
    white: 'text-white',
    gray: 'text-gray-600',
    slate: 'text-slate-600',
  }

  const colorStyle = colorMap[color] || colorMap.default
  const textStyle = textColorMap[textColor] || textColorMap.default

  return {
    className: `${colorStyle.bg} ${textStyle} border-2 ${colorStyle.border}`,
    style: textColor === 'black' || textColor === 'white' 
      ? { color: textColor.toLowerCase() }
      : {},
  }
}
