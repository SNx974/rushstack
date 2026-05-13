import { Router } from 'express'
import multer from 'multer'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import fs from 'fs'
import { query } from '../db.js'
import { requireAdmin, requireAuth } from '../middleware/auth.js'

const router = Router()

const UPLOADS_DIR = '/app/uploads'
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, `${uuidv4()}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|gif|webp|svg)$/i
    if (!allowed.test(file.originalname)) return cb(new Error('Images only'))
    cb(null, true)
  },
})

// Public: get all active media (optionally filtered by section)
router.get('/', async (req, res) => {
  const { section } = req.query
  try {
    const q = section
      ? `SELECT * FROM media WHERE is_active = true AND section = $1 ORDER BY sort_order ASC, created_at DESC`
      : `SELECT * FROM media WHERE is_active = true ORDER BY section, sort_order ASC, created_at DESC`
    const { rows } = await query(q, section ? [section] : [])
    // Group by section
    const grouped = rows.reduce((acc, row) => {
      if (!acc[row.section]) acc[row.section] = []
      acc[row.section].push(row)
      return acc
    }, {})
    res.json(grouped)
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

// Admin: get all media including inactive
router.get('/all', requireAdmin, async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT m.*, u.username as uploaded_by_name FROM media m LEFT JOIN users u ON u.id = m.uploaded_by ORDER BY m.created_at DESC`
    )
    res.json(rows)
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

// Admin: upload image
router.post('/upload', requireAdmin, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' })
  const { section = 'custom', label = '', alt = '', sort_order = 0 } = req.body
  const url = `/uploads/${req.file.filename}`
  try {
    const { rows } = await query(
      `INSERT INTO media (filename, original_name, url, section, label, alt, sort_order, uploaded_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [req.file.filename, req.file.originalname, url, section, label, alt, parseInt(sort_order), req.user.id]
    )
    res.json(rows[0])
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

// Admin: update media (section, label, alt, sort_order, is_active)
router.patch('/:id', requireAdmin, async (req, res) => {
  const { section, label, alt, sort_order, is_active } = req.body
  try {
    const { rows } = await query(
      `UPDATE media SET section=COALESCE($1,section), label=COALESCE($2,label), alt=COALESCE($3,alt), sort_order=COALESCE($4,sort_order), is_active=COALESCE($5,is_active) WHERE id=$6 RETURNING *`,
      [section, label, alt, sort_order, is_active, req.params.id]
    )
    res.json(rows[0])
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

// Admin: delete media
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { rows } = await query(`DELETE FROM media WHERE id=$1 RETURNING filename`, [req.params.id])
    if (rows[0]) {
      const filepath = path.join(UPLOADS_DIR, rows[0].filename)
      if (fs.existsSync(filepath)) fs.unlinkSync(filepath)
    }
    res.json({ ok: true })
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

export default router
