import { Router } from 'express'
import { query } from '../db.js'
import { requireAdmin } from '../middleware/auth.js'

const router = Router()
router.use(requireAdmin)

router.get('/stats', async (req, res) => {
  try {
    const [users, matches, bans] = await Promise.all([
      query(`SELECT COUNT(*) FROM users`),
      query(`SELECT COUNT(*) FROM matches WHERE DATE(created_at) = CURRENT_DATE`),
      query(`SELECT COUNT(*) FROM users WHERE is_banned = true`),
    ])
    res.json({
      totalUsers: parseInt(users.rows[0].count),
      matchesToday: parseInt(matches.rows[0].count),
      activeBans: parseInt(bans.rows[0].count),
    })
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

router.get('/users', async (req, res) => {
  const { search = '', limit = 50 } = req.query
  try {
    const { rows } = await query(
      `SELECT id, username, display_name, email, role, is_banned, ban_reason, created_at FROM users WHERE username ILIKE $1 OR email ILIKE $1 ORDER BY created_at DESC LIMIT $2`,
      [`%${search}%`, limit],
    )
    res.json(rows)
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

router.post('/users/:id/ban', async (req, res) => {
  const { reason } = req.body
  try {
    await query(`UPDATE users SET is_banned=true, ban_reason=$1 WHERE id=$2`, [reason || 'Banned by admin', req.params.id])
    res.json({ ok: true })
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

router.post('/users/:id/unban', async (req, res) => {
  try {
    await query(`UPDATE users SET is_banned=false, ban_reason=NULL WHERE id=$1`, [req.params.id])
    res.json({ ok: true })
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

router.patch('/users/:id/role', async (req, res) => {
  const { role } = req.body
  if (!['player', 'moderator', 'admin'].includes(role)) return res.status(400).json({ error: 'Invalid role' })
  try {
    await query(`UPDATE users SET role=$1 WHERE id=$2`, [role, req.params.id])
    res.json({ ok: true })
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

export default router
