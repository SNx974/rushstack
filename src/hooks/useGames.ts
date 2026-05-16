import { useState, useEffect } from 'react'
import { getGames, getGameConfig, type Game } from '@/services/games.service'

export function useGames() {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getGames().then(g => { setGames(g); setLoading(false) })
  }, [])

  const reload = () => {
    setLoading(true)
    getGames().then(g => { setGames(g); setLoading(false) })
  }

  return { games, loading, reload, setGames }
}

export function useGameConfig(gameId: string | null) {
  const [game, setGame] = useState<Game | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!gameId) return
    setLoading(true)
    getGameConfig(gameId).then(g => { setGame(g); setLoading(false) })
  }, [gameId])

  return { game, loading }
}
