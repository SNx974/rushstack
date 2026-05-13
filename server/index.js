import express from 'express'
import cors from 'cors'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { pool } from './db.js'
import authRoutes from './routes/auth.js'
import profileRoutes from './routes/profiles.js'
import leaderboardRoutes from './routes/leaderboard.js'
import adminRoutes from './routes/admin.js'
import mediaRoutes from './routes/media.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// Serve uploaded files
app.use('/uploads', express.static('/app/uploads'))

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/profiles', profileRoutes)
app.use('/api/leaderboard', leaderboardRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/media', mediaRoutes)

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({ status: 'ok', db: 'connected' })
  } catch {
    res.status(500).json({ status: 'error', db: 'disconnected' })
  }
})

// Serve frontend
const distPath = join(__dirname, '../dist')
app.use(express.static(distPath))
app.get('*', (req, res) => {
  res.sendFile(join(distPath, 'index.html'))
})

app.listen(PORT, () => {
  console.log(`RUSH STACK server running on port ${PORT}`)
})
