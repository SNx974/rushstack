import { useEffect } from 'react'
import { useMedia } from './useMedia'

export function useSiteIcons() {
  const { data: media } = useMedia()

  useEffect(() => {
    if (!media) return

    // Favicon
    const favicon = media['icon_favicon']?.[0]?.url
    if (favicon) {
      let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
      if (!link) {
        link = document.createElement('link')
        link.rel = 'icon'
        document.head.appendChild(link)
      }
      link.href = favicon
    }
  }, [media])

  return {
    navbarIcon: media?.['icon_navbar']?.[0]?.url ?? null,
    sidebarIcon: media?.['icon_sidebar']?.[0]?.url ?? null,
    loginIcon: media?.['icon_login']?.[0]?.url ?? null,
    favicon: media?.['icon_favicon']?.[0]?.url ?? null,
  }
}
