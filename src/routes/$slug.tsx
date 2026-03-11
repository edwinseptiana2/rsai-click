import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect } from 'react'
import { getPageBySlug } from '@/server/pages'
import { trackClick } from '@/server/clicks'
import { resolveShortLinkRedirect } from '@/server/shortLinks'
import { getButtonStyles, ICON_MAP, TEXT_COLORS } from '@/components/microsite/button-templates'
import { User, ExternalLink, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { BACKGROUND_PATTERNS } from '@/components/microsite/background-patterns'

export const Route = createFileRoute('/$slug')({
  loader: async ({ params }) => {
    // Server-side: check if it's a short link (also tracks click server-side)
    const shortLinkResult = await resolveShortLinkRedirect({ data: params.slug })
    if (shortLinkResult) {
      return { type: 'redirect' as const, targetUrl: shortLinkResult.targetUrl, page: null }
    }

    // If not a short link, load as a page
    const page = await getPageBySlug({ data: params.slug } as any)
    if (!page) {
      return { type: 'notfound' as const, targetUrl: null, page: null }
    }
    return { type: 'page' as const, targetUrl: null, page }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const loaderData = Route.useLoaderData()

  // Handle short link redirect client-side
  useEffect(() => {
    if (loaderData.type === 'redirect' && loaderData.targetUrl) {
      window.location.href = loaderData.targetUrl
    }
  }, [loaderData])

  if (loaderData.type === 'redirect') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-muted-foreground">Redirecting...</div>
      </div>
    )
  }

  if (loaderData.type === 'notfound' || !loaderData.page) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Page not found</h1>
          <p className="text-muted-foreground">The page you are looking for does not exist.</p>
        </div>
      </div>
    )
  }

  const { page } = loaderData

  // Handle link click with tracking
  const handleLinkClick = async (e: React.MouseEvent<HTMLAnchorElement>, link: any) => {
    e.preventDefault()
    
    try {
      await trackClick({
        data: {
          linkId: link.id,
          userAgent: navigator.userAgent,
          referer: document.referrer || undefined,
        }
      })
    } catch (err) {
      console.error('Failed to track click:', err)
    }
    
    window.open(link.url, '_blank', 'noopener,noreferrer')
  }

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareTitle = page.title || "Check out my microsite";
    const shareText = page.bio || shareTitle;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        toast.success("Shared successfully!");
      } catch (err) {
        if ((err as any).name !== "AbortError") {
          copyToClipboard(shareUrl);
        }
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Link copied to clipboard!");
    }).catch(err => {
      console.error("Failed to copy:", err);
      toast.error("Failed to copy link");
    });
  };

  // Check for custom gradient stored in backgroundPattern
  const isCustomGradient = page.backgroundPattern?.startsWith('custom-gradient:')
  const customGradientCss = isCustomGradient ? page.backgroundPattern?.replace('custom-gradient:', '') : null
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
    <div className={`min-h-screen flex flex-col items-center overflow-x-hidden ${bgPattern?.bgClass || ''}`} style={bgStyle}>
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 w-full px-4 pt-4 flex-shrink-0">
        <div className="w-fit mx-auto flex items-center gap-4 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/10 shadow-sm">
          <div className="flex items-center gap-1.5">
            <img src="/rsai-click-new-icon-only.png" alt="Logo" className="w-5 h-5 object-contain" />
            <span className="text-[10px] sm:text-xs font-bold text-white">RSAI Click</span>
          </div>
          <div className="w-[1px] h-3 bg-white/10" />
          <button 
            className="p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            onClick={handleShare}
          >
            <Share2 size={14} className="text-white/80" />
          </button>
        </div>
      </div>

      <div className="w-full max-w-md flex-1 flex flex-col space-y-6 text-center px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex-1 space-y-6">
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
            <h1 className={`text-2xl sm:text-3xl font-bold line-clamp-2 ${
              page.titleColor && page.titleColor !== "default"
                ? TEXT_COLORS.find(c => c.id === page.titleColor)?.class || "text-foreground"
                : (page.textColor && page.textColor !== "default" ? TEXT_COLORS.find(c => c.id === page.textColor)?.class : "text-foreground")
            }`} style={page.titleColor && page.titleColor !== "default" ? TEXT_COLORS.find(c => c.id === page.titleColor)?.style : (page.textColor && page.textColor !== "default" ? TEXT_COLORS.find(c => c.id === page.textColor)?.style : {})}>
              {page.title}
            </h1>
            {page.bio && (
              <p className={`text-base font-light leading-relaxed line-clamp-4 ${
                page.bioColor && page.bioColor !== "default"
                  ? TEXT_COLORS.find(c => c.id === page.bioColor)?.class || "text-muted-foreground"
                  : (page.textColor && page.textColor !== "default" ? TEXT_COLORS.find(c => c.id === page.textColor)?.class : "text-muted-foreground")
              }`} style={page.bioColor && page.bioColor !== "default" ? TEXT_COLORS.find(c => c.id === page.bioColor)?.style : (page.textColor && page.textColor !== "default" ? TEXT_COLORS.find(c => c.id === page.textColor)?.style : {})}>
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
                    onClick={(e) => handleLinkClick(e, link)}
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

        </div>

        {/* Footer */}
        <div className="pt-8 pb-4">
          <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/10 shadow-sm w-fit mx-auto">
            <span className="text-[10px] text-white/50">Powered by</span>
            <Link to="/" className="text-[10px] font-bold text-white hover:text-white/80 transition-colors">
              RSAI Click
            </Link>
          </div>
        </div>
      </div>
    </div>
    )
}

export default RouteComponent
