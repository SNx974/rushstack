import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export type MediaItem = {
  id: string
  filename: string
  original_name: string
  url: string
  section: string
  label: string | null
  alt: string | null
  sort_order: number
  is_active: boolean
  created_at: string
}

export type MediaMap = Record<string, MediaItem[]>

export function useMedia() {
  return useQuery<MediaMap>({
    queryKey: ['media'],
    queryFn: () => api.get<MediaMap>('/media'),
    staleTime: 1000 * 60 * 5,
  })
}

export function useMediaSection(section: string, fallback?: string) {
  const { data } = useMedia()
  const items = data?.[section]
  const first = items?.[0]
  return first?.url ?? fallback ?? null
}
