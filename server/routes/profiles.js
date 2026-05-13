import { Router } from 'express'
import { query } from '../db.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/:id', async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT id, username, display_name, avatar_url, bio, role, created_at FROM users WHERE id = $1`,
      [req.params.id],
    )
    if (!rows[0]) return res.status(404).json({ error: 'Not found' })
    const mmr = await query(
      `SELECT pm.*, g.name as game_name, g.slug FROM player_mmr pm JOIN games g ON g.id = pm.game_id WHERE pm.player_id = $1`,
      [req.params.id],
    )
    res.json({ ...rows[0], mmr: mmr.rows })
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

router.patch('/me', requireAuth, async (req, res) => {
  const { display_name, bio, avatar_url } = req.body
  try {
    const { rows } = await query(
      `UPDATE users SET display_name=$1, bio=$2, avatar_url=$3, updated_at=NOW() WHERE id=$4 RETURNING id, username, display_name, avatar_url, bio, role`,
      [display_name, bio, avatar_url, req.user.id],
    )
    res.json(rows[0])
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

export default router
