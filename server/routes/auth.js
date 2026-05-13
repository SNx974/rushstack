import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { query } from '../db.js'

const router = Router()

function signToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' },
  )
}

router.post('/register', async (req, res) => {
  const { email, password, username } = req.body
  if (!email || !password || !username) return res.status(400).json({ error: 'Missing fields' })
  try {
    const hash = await bcrypt.hash(password, 12)
    const { rows } = await query(
      `INSERT INTO users (email, password_hash, username) VALUES ($1, $2, $3) RETURNING id, email, username, display_name, avatar_url, role`,
      [email.toLowerCase(), hash, username.toLowerCase()],
    )
    const user = rows[0]
    // Create MMR rows for all games
    await query(
      `INSERT INTO player_mmr (player_id, game_id) SELECT $1, id FROM games WHERE is_active = true`,
      [user.id],
    )
    res.json({ token: signToken(user), user })
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Email or username already taken' })
    res.status(500).json({ error: 'Server error' })
  }
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' })
  try {
    const { rows } = await query(
      `SELECT id, email, username, display_name, avatar_url, role, password_hash, is_banned, ban_reason FROM users WHERE email = $1`,
      [email.toLowerCase()],
    )
    const user = rows[0]
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })
    if (user.is_banned) return res.status(403).json({ error: `Account banned: ${user.ban_reason || 'Contact support'}` })
    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' })
    const { password_hash, ...safeUser } = user
    res.json({ token: signToken(safeUser), user: safeUser })
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

router.get('/me', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const { rows } = await query(
      `SELECT id, email, username, display_name, avatar_url, bio, role, is_banned, created_at FROM users WHERE id = $1`,
      [payload.id],
    )
    if (!rows[0]) return res.status(404).json({ error: 'User not found' })
    res.json(rows[0])
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
})

export default router
