import { Router } from 'express'
import { query } from '../db.js'

const router = Router()

router.get('/', async (req, res) => {
  const { game, limit = 50, offset = 0 } = req.query
  try {
    let q, params
    if (game) {
      q = `SELECT * FROM leaderboard_view WHERE game_id = (SELECT id FROM games WHERE slug = $1) ORDER BY rank LIMIT $2 OFFSET $3`
      params = [game, limit, offset]
    } else {
      q = `SELECT DISTINCT ON (player_id) * FROM leaderboard_view ORDER BY player_id, mmr DESC LIMIT $1 OFFSET $2`
      params = [limit, offset]
    }
    const { rows } = await query(q, params)
    res.json(rows)
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

router.get('/games', async (req, res) => {
  try {
    const { rows } = await query(`SELECT * FROM games WHERE is_active = true ORDER BY name`)
    res.json(rows)
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

export default router
