import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { getPageBySlug } from '@/server/pages'
import { getButtonStyles, ICON_MAP } from '@/components/microsite/button-templates'
import { User, ExternalLink } from 'lucide-react'
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
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (error || !page) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Page not found</h1>
          <p className="text-muted-foreground">{error || 'The page you are looking for does not exist.'}</p>
        </div>
      </div>
    )
  }

  // Check for custom gradient stored in backgroundPattern
  const isCustomGradient = page.backgroundPattern?.startsWith('custom-gradient:')
  const customGradientCss = isCustomGradient ? page.backgroundPattern.replace('custom-gradient:', '') : null
  const bgPattern = isCustomGradient ? null : (BACKGROUND_PATTERNS.find(p => p.id === page.backgroundPattern) || BACKGROUND_PATTERNS[0])

  const bgStyle = customGradientCss
    ? { background: customGradientCss }
    : bgPattern?.pattern
    ? {
        backgroundColor: bgPattern.preview === "white" ? "white" : bgPattern.preview,
        backgroundImage: `url("${bgPattern.pattern}")`,
        backgroundSize: "40px 40px",
      }
    : bgPattern?.bgClass
    ? {}
    : bgPattern ? { backgroundColor: bgPattern.preview } : {}

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 sm:p-6 ${bgPattern?.bgClass || ''}`} style={bgStyle}>
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-lg p-6 sm:p-8 space-y-6 text-center">
          {/* Avatar */}
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-full bg-muted border-4 border-card shadow-md overflow-hidden flex items-center justify-center flex-shrink-0">
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
          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              {page.title}
            </h1>
            {page.bio && (
              <p className="text-base font-light text-muted-foreground leading-relaxed">
                {page.bio}
              </p>
            )}
          </div>

          {/* Links */}
          {page.links && page.links.length > 0 && (
            <div className="space-y-3">
              {page.links.map((link: any) => {
                const buttonStyle = getButtonStyles(link.color, link.textColor)
                const IconComponent = link.icon ? ICON_MAP[link.icon] : null
                
                let customIcon = null
                try {
                  if (link.customIcon) {
                    customIcon = typeof link.customIcon === 'string' ? JSON.parse(link.customIcon) : link.customIcon
                  }
                } catch (e) {
                  customIcon = null
                }
                
                return (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-between px-4 py-3 rounded-lg font-semibold text-sm sm:text-base transition-all hover:shadow-lg hover:-translate-y-0.5 ${buttonStyle.bg} ${buttonStyle.text} border-2 ${buttonStyle.border}`}
                    style={buttonStyle.textStyle}
                  >
                    <div className="flex items-center gap-3">
                      {(customIcon || IconComponent) && (
                        <div className="flex-shrink-0">
                          {customIcon?.type === 'emoji' && (
                            <span className="text-lg">{customIcon.value}</span>
                          )}
                          {customIcon?.type === 'image' && (
                            <img src={customIcon.value} alt="" className="w-5 h-5 object-contain" />
                          )}
                          {!customIcon && IconComponent && (
                            <IconComponent size={20} />
                          )}
                        </div>
                      )}
                      <span>{link.title}</span>
                    </div>
                    <ExternalLink size={16} className="flex-shrink-0 ml-2" />
                  </a>
                )
              })}
            </div>
          )}

          {/* Footer */}
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Created with <a href="/" className="text-foreground hover:text-foreground/80 font-semibold">rsai.click</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RouteComponent
