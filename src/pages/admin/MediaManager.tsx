import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Trash2, Edit3, Eye, EyeOff, Image, X, Check, Plus } from 'lucide-react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { MediaItem } from '@/hooks/useMedia'

export const SECTIONS = [
  // Icônes du site
  { value: 'icon_favicon', label: '🌐 Icône — Favicon (onglet navigateur)', accept: '.ico,.png,.svg' },
  { value: 'icon_navbar', label: '🔴 Icône — Navbar (logo barre du haut)', accept: '.ico,.png,.svg,.gif' },
  { value: 'icon_sidebar', label: '📐 Icône — Sidebar (menu desktop)', accept: '.ico,.png,.svg,.gif' },
  { value: 'icon_login', label: '🔐 Icône — Page connexion', accept: '.ico,.png,.svg,.gif' },
  // Hero
  { value: 'hero_background', label: '🖼 Hero — Arrière-plan', accept: 'image/*' },
  { value: 'hero_character', label: '🧑‍🚀 Hero — Personnage / GIF', accept: 'image/*,.gif' },
  // Jeux
  { value: 'game_valorant', label: '🎮 Jeu — Valorant', accept: 'image/*' },
  { value: 'game_cs2', label: '🎮 Jeu — CS2', accept: 'image/*' },
  { value: 'game_fortnite', label: '🎮 Jeu — Fortnite', accept: 'image/*' },
  { value: 'game_apex', label: '🎮 Jeu — Apex Legends', accept: 'image/*' },
  { value: 'game_cod', label: '🎮 Jeu — Call of Duty', accept: 'image/*' },
  { value: 'game_lol', label: '🎮 Jeu — League of Legends', accept: 'image/*' },
  // Layout
  { value: 'banner_cta', label: '📢 Bannière CTA', accept: 'image/*' },
  { value: 'sidebar_bg', label: '📐 Sidebar — Fond', accept: 'image/*' },
  { value: 'custom', label: '✨ Section personnalisée', accept: 'image/*,.ico' },
]

function getToken() { return localStorage.getItem('token') }

export default function MediaManager() {
  const qc = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({ section: 'hero_background', label: '', alt: '', sort_order: '0', custom_section: '' })
  const [editId, setEditId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<MediaItem>>({})
  const [filterSection, setFilterSection] = useState('all')
  const [preview, setPreview] = useState<string | null>(null)

  const { data: allMedia = [], isLoading } = useQuery<MediaItem[]>({
    queryKey: ['media-admin'],
    queryFn: () => api.get<MediaItem[]>('/media/all'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/media/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['media-admin'] }); qc.invalidateQueries({ queryKey: ['media'] }) },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MediaItem> }) => api.patch(`/media/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['media-admin'] }); qc.invalidateQueries({ queryKey: ['media'] }); setEditId(null) },
  })

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('section', form.section === 'custom' ? form.custom_section || 'custom' : form.section)
      fd.append('label', form.label)
      fd.append('alt', form.alt)
      fd.append('sort_order', form.sort_order)
      const res = await fetch('/api/media/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: fd,
      })
      if (!res.ok) throw new Error('Upload failed')
      qc.invalidateQueries({ queryKey: ['media-admin'] })
      qc.invalidateQueries({ queryKey: ['media'] })
      if (fileRef.current) fileRef.current.value = ''
      setForm(f => ({ ...f, label: '', alt: '' }))
    } catch (e: any) {
      alert(e.message)
    } finally {
      setUploading(false)
    }
  }

  const filtered = filterSection === 'all' ? allMedia : allMedia.filter(m => m.section === filterSection)

  return (
    <div className="space-y-6">
      {/* Upload zone */}
      <div className="card border-brand-500/20 bg-brand-500/5">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Upload className="w-4 h-4 text-brand-400" /> Uploader une image
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <div>
            <label className="text-xs text-white/50 mb-1 block">Zone du site</label>
            <select
              value={form.section}
              onChange={e => setForm(f => ({ ...f, section: e.target.value }))}
              className="input-field text-sm"
            >
              {SECTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          {form.section === 'custom' && (
            <Input
              label="Nom de section"
              placeholder="ma_section"
              value={form.custom_section}
              onChange={e => setForm(f => ({ ...f, custom_section: e.target.value }))}
            />
          )}
          <Input label="Label (affiché)" placeholder="ex: Hero principal" value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} />
          <Input label="Texte alternatif" placeholder="Description de l'image" value={form.alt} onChange={e => setForm(f => ({ ...f, alt: e.target.value }))} />
          <Input label="Ordre (priorité)" type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))} />
        </div>

        {/* Drop zone */}
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-white/20 hover:border-brand-500/50 rounded-xl p-8 text-center cursor-pointer transition-all group"
        >
          <Image className="w-8 h-8 text-white/20 group-hover:text-brand-500/50 mx-auto mb-2 transition-colors" />
          <p className="text-sm text-white/40 group-hover:text-white/60 transition-colors">
            Clique pour choisir une image <span className="text-white/20">(JPG, PNG, WebP, GIF, SVG — max 10MB)</span>
          </p>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={() => {
            const f = fileRef.current?.files?.[0]
            if (f) setPreview(URL.createObjectURL(f))
          }} />
        </div>

        {preview && (
          <div className="mt-3 flex items-center gap-3">
            <img src={preview} className="w-20 h-20 rounded-lg object-cover border border-white/10" />
            <div className="flex-1">
              <p className="text-xs text-white/60">{fileRef.current?.files?.[0]?.name}</p>
              <Button size="sm" onClick={handleUpload} loading={uploading} className="mt-2">
                <Upload className="w-3.5 h-3.5" /> Uploader
              </Button>
            </div>
            <button onClick={() => { setPreview(null); if (fileRef.current) fileRef.current.value = '' }} className="p-1.5 rounded text-white/40 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setFilterSection('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterSection === 'all' ? 'bg-brand-500 text-white' : 'bg-surface-200 text-white/50 hover:text-white border border-white/10'}`}
        >
          Toutes ({allMedia.length})
        </button>
        {[...new Set(allMedia.map(m => m.section))].map(sec => (
          <button
            key={sec}
            onClick={() => setFilterSection(sec)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterSection === sec ? 'bg-brand-500 text-white' : 'bg-surface-200 text-white/50 hover:text-white border border-white/10'}`}
          >
            {SECTIONS.find(s => s.value === sec)?.label.replace(/^.+ — /, '') ?? sec} ({allMedia.filter(m => m.section === sec).length})
          </button>
        ))}
      </div>

      {/* Media grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-white/30">
          <Image className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Aucune image uploadée</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          <AnimatePresence>
            {filtered.map(item => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`relative group rounded-xl overflow-hidden border transition-all ${item.is_active ? 'border-white/10' : 'border-red-500/20 opacity-50'}`}
              >
                {/* Image */}
                <div className="aspect-video bg-surface-100">
                  <img src={item.url} alt={item.alt || ''} className="w-full h-full object-cover" />
                </div>

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => updateMutation.mutate({ id: item.id, data: { is_active: !item.is_active } })}
                      className="p-1.5 rounded bg-black/50 text-white/70 hover:text-white transition-colors"
                      title={item.is_active ? 'Désactiver' : 'Activer'}
                    >
                      {item.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => { setEditId(item.id); setEditData({ section: item.section, label: item.label || '', alt: item.alt || '', sort_order: item.sort_order }) }}
                      className="p-1.5 rounded bg-black/50 text-white/70 hover:text-white transition-colors"
                      title="Modifier"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => { if (confirm('Supprimer ?')) deleteMutation.mutate(item.id) }}
                      className="p-1.5 rounded bg-black/50 text-red-400 hover:text-red-300 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div>
                    <p className="text-[10px] text-brand-400 font-medium">{SECTIONS.find(s => s.value === item.section)?.label ?? item.section}</p>
                    {item.label && <p className="text-xs text-white font-semibold truncate">{item.label}</p>}
                  </div>
                </div>

                {/* Status badge */}
                {!item.is_active && (
                  <div className="absolute top-1 left-1 bg-red-500/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                    INACTIF
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Edit modal */}
      <AnimatePresence>
        {editId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={e => { if (e.target === e.currentTarget) setEditId(null) }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95 }}
              className="card w-full max-w-md border-white/20 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white">Modifier l'image</h3>
                <button onClick={() => setEditId(null)} className="text-white/40 hover:text-white"><X className="w-4 h-4" /></button>
              </div>

              <div>
                <label className="text-xs text-white/50 mb-1 block">Zone du site</label>
                <select
                  value={editData.section}
                  onChange={e => setEditData(d => ({ ...d, section: e.target.value }))}
                  className="input-field text-sm"
                >
                  {SECTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <Input label="Label" value={editData.label as string} onChange={e => setEditData(d => ({ ...d, label: e.target.value }))} />
              <Input label="Texte alt" value={editData.alt as string} onChange={e => setEditData(d => ({ ...d, alt: e.target.value }))} />
              <Input label="Ordre" type="number" value={String(editData.sort_order)} onChange={e => setEditData(d => ({ ...d, sort_order: parseInt(e.target.value) }))} />

              <div className="flex gap-3">
                <Button className="flex-1" onClick={() => updateMutation.mutate({ id: editId, data: editData })} loading={updateMutation.isPending}>
                  <Check className="w-4 h-4" /> Sauvegarder
                </Button>
                <Button variant="ghost" onClick={() => setEditId(null)}>Annuler</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
