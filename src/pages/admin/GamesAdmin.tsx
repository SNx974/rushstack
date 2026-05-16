import { useState } from 'react'
import { useGames } from '@/hooks/useGames'
import {
  addMap, deleteMap, updateMap,
  setFormat, setModeSlots, setCustomRule, deleteCustomRule,
  toggleGame, updateGame, createGame,
  type Game,
} from '@/services/games.service'

const S = {
  panel: { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 12 } as const,
  panel2: { background: 'var(--panel-2)', border: '1px solid var(--line)', borderRadius: 8 } as const,
  red: '#ef2434',
  muted: 'rgba(255,255,255,0.4)',
  input: {
    background: 'var(--panel-2)', border: '1px solid var(--line)', borderRadius: 6,
    padding: '7px 10px', color: '#fff', fontSize: 13, outline: 'none', width: '100%',
  } as const,
  btn: (color = 'var(--panel-2)', textColor = 'rgba(255,255,255,0.7)') => ({
    background: color, border: '1px solid var(--line)', borderRadius: 6,
    padding: '7px 14px', color: textColor, fontSize: 12, fontWeight: 700,
    cursor: 'pointer', transition: 'opacity 0.15s',
  } as const),
}

/* ── Map editor ─────────────────────────────────────────── */
function MapEditor({ game, onRefresh }: { game: Game; onRefresh: () => void }) {
  const [name, setName] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAdd = async () => {
    if (!name.trim()) return
    setLoading(true)
    try {
      await addMap(game.id, name.trim(), game.maps?.length ?? 0)
      setName('')
      onRefresh()
    } finally { setLoading(false) }
  }

  const handleDelete = async (mapId: string) => {
    await deleteMap(game.id, mapId)
    onRefresh()
  }

  const handleEdit = async (mapId: string) => {
    if (!editName.trim()) return
    await updateMap(game.id, mapId, { name: editName.trim() })
    setEditId(null)
    onRefresh()
  }

  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 800, color: S.muted, letterSpacing: '0.1em', marginBottom: 10 }}>CARTES ({game.maps?.length ?? 0})</div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Nom de la carte…" style={S.input}
          onKeyDown={e => e.key === 'Enter' && handleAdd()} />
        <button onClick={handleAdd} disabled={loading} style={{ ...S.btn(S.red, '#fff'), whiteSpace: 'nowrap' }}>+ Ajouter</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {(game.maps ?? []).map(m => (
          <div key={m.id} style={{ ...S.panel2, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
            {editId === m.id ? (
              <>
                <input value={editName} onChange={e => setEditName(e.target.value)} style={{ ...S.input, flex: 1 }} />
                <button onClick={() => handleEdit(m.id)} style={S.btn(S.red, '#fff')}>✓</button>
                <button onClick={() => setEditId(null)} style={S.btn()}>✕</button>
              </>
            ) : (
              <>
                <span style={{ flex: 1, fontSize: 13, color: '#fff', fontWeight: 600 }}>{m.name}</span>
                <button onClick={() => { setEditId(m.id); setEditName(m.name) }} style={S.btn()}>✎</button>
                <button onClick={() => handleDelete(m.id)} style={S.btn('rgba(239,36,52,0.15)', S.red)}>✕</button>
              </>
            )}
          </div>
        ))}
        {(game.maps ?? []).length === 0 && (
          <div style={{ fontSize: 12, color: S.muted, textAlign: 'center', padding: '12px 0' }}>Aucune carte — ajoutez-en une ci-dessus</div>
        )}
      </div>
    </div>
  )
}

/* ── Format editor ──────────────────────────────────────── */
function FormatEditor({ game, onRefresh }: { game: Game; onRefresh: () => void }) {
  const [bo, setBo] = useState<1 | 3 | 5>(1)
  const [loading, setLoading] = useState(false)

  const handleAdd = async () => {
    setLoading(true)
    try {
      await setFormat(game.id, `BO${bo}`, true)
      onRefresh()
    } finally { setLoading(false) }
  }

  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 800, color: S.muted, letterSpacing: '0.1em', marginBottom: 10 }}>FORMATS</div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
        {([1, 3, 5] as const).map(v => (
          <button key={v} onClick={() => setBo(v)} style={{
            ...S.btn(bo === v ? 'rgba(239,36,52,0.2)' : 'var(--panel-2)', bo === v ? S.red : S.muted),
            border: bo === v ? `1px solid ${S.red}` : '1px solid var(--line)',
          }}>BO{v}</button>
        ))}
        <button onClick={handleAdd} disabled={loading} style={{ ...S.btn(S.red, '#fff'), marginLeft: 'auto' }}>+ Ajouter</button>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {(game.formats ?? []).map(f => (
          <div key={f.id} style={{
            ...S.panel2, padding: '6px 14px',
            fontSize: 13, fontWeight: 700, color: '#fff',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            {f.type}
            <span style={{ fontSize: 11, color: S.muted }}>{f.active ? '● actif' : '○ inactif'}</span>
          </div>
        ))}
        {(game.formats ?? []).length === 0 && (
          <div style={{ fontSize: 12, color: S.muted }}>Aucun format configuré</div>
        )}
      </div>
    </div>
  )
}

/* ── Mode slots editor ──────────────────────────────────── */
function ModeSlotEditor({ game, onRefresh }: { game: Game; onRefresh: () => void }) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAdd = async () => {
    if (!name.trim()) return
    setLoading(true)
    try {
      const nextOrder = (game.mode_slots ?? []).length
      const existing = (game.mode_slots ?? []).map((s, i) => ({ slot_index: i, mode_name: s.mode_name, description: '' }))
      await setModeSlots(game.id, [...existing, { slot_index: nextOrder, mode_name: name.trim(), description: '' }])
      setName('')
      onRefresh()
    } finally { setLoading(false) }
  }

  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 800, color: S.muted, letterSpacing: '0.1em', marginBottom: 10 }}>MODES DE JEU</div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Hardpoint, Search & Destroy…" style={S.input}
          onKeyDown={e => e.key === 'Enter' && handleAdd()} />
        <button onClick={handleAdd} disabled={loading} style={{ ...S.btn(S.red, '#fff'), whiteSpace: 'nowrap' }}>+ Mode</button>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {(game.mode_slots ?? []).map((m, i) => (
          <div key={m.id} style={{
            ...S.panel2, padding: '5px 12px',
            fontSize: 12, fontWeight: 600, color: '#fff',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{ fontSize: 10, color: S.muted }}>#{i + 1}</span>
            {m.mode_name}
          </div>
        ))}
        {(game.mode_slots ?? []).length === 0 && (
          <div style={{ fontSize: 12, color: S.muted }}>Aucun mode — facultatif pour certains jeux</div>
        )}
      </div>
    </div>
  )
}

/* ── Custom rules editor ────────────────────────────────── */
function CustomRulesEditor({ game, onRefresh }: { game: Game; onRefresh: () => void }) {
  const [key, setKey] = useState('')
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAdd = async () => {
    if (!key.trim() || !value.trim()) return
    setLoading(true)
    try {
      await setCustomRule(game.id, key.trim(), value.trim(), 'string')
      setKey(''); setValue('')
      onRefresh()
    } finally { setLoading(false) }
  }

  const handleDelete = async (ruleId: string) => {
    await deleteCustomRule(game.id, ruleId)
    onRefresh()
  }

  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 800, color: S.muted, letterSpacing: '0.1em', marginBottom: 10 }}>RÈGLES PERSONNALISÉES</div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input value={key} onChange={e => setKey(e.target.value)} placeholder="Clé (ex: score_limit)" style={{ ...S.input, flex: 1 }} />
        <input value={value} onChange={e => setValue(e.target.value)} placeholder="Valeur (ex: 250)" style={{ ...S.input, flex: 1 }} />
        <button onClick={handleAdd} disabled={loading} style={{ ...S.btn(S.red, '#fff'), whiteSpace: 'nowrap' }}>+ Règle</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {(game.custom_rules ?? []).map(r => (
          <div key={r.id} style={{ ...S.panel2, padding: '7px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: S.muted, fontFamily: 'monospace', minWidth: 120 }}>{r.key}</span>
            <span style={{ fontSize: 13, color: '#fff', flex: 1 }}>{r.value}</span>
            <button onClick={() => handleDelete(r.id)} style={S.btn('rgba(239,36,52,0.12)', S.red)}>✕</button>
          </div>
        ))}
        {(game.custom_rules ?? []).length === 0 && (
          <div style={{ fontSize: 12, color: S.muted }}>Aucune règle personnalisée</div>
        )}
      </div>
    </div>
  )
}

/* ── Game row ────────────────────────────────────────────── */
function GameRow({ game, selected, onSelect, onToggle }: {
  game: Game; selected: boolean
  onSelect: () => void; onToggle: () => void
}) {
  return (
    <div onClick={onSelect} style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
      background: selected ? 'rgba(239,36,52,0.08)' : 'transparent',
      borderLeft: selected ? `3px solid ${S.red}` : '3px solid transparent',
      cursor: 'pointer', transition: 'all 0.15s',
      borderBottom: '1px solid var(--line)',
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>{game.name}</div>
        <div style={{ fontSize: 11, color: S.muted }}>{game.maps?.length ?? 0} cartes · {game.formats?.length ?? 0} formats</div>
      </div>
      <div onClick={e => { e.stopPropagation(); onToggle() }} style={{
        width: 36, height: 20, borderRadius: 10,
        background: game.active ? S.red : 'var(--line)',
        position: 'relative', cursor: 'pointer', transition: 'background 0.2s',
        flexShrink: 0,
      }}>
        <div style={{
          position: 'absolute', top: 2, left: game.active ? 18 : 2,
          width: 16, height: 16, borderRadius: 8, background: '#fff',
          transition: 'left 0.2s',
        }} />
      </div>
    </div>
  )
}

/* ── GamesAdmin main ─────────────────────────────────────── */
export default function GamesAdmin() {
  const { games, reload } = useGames()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [addingGame, setAddingGame] = useState(false)
  const [newGameName, setNewGameName] = useState('')
  const [loading, setLoading] = useState(false)

  const selected = games.find(g => g.id === selectedId) ?? null

  const handleToggle = async (game: Game) => {
    await toggleGame(game.id, !game.active)
    reload()
  }

  const handleAddGame = async () => {
    if (!newGameName.trim()) return
    setLoading(true)
    try {
      await createGame({ name: newGameName.trim(), slug: newGameName.toLowerCase().replace(/\s+/g, '-') })
      setNewGameName(''); setAddingGame(false)
      reload()
    } finally { setLoading(false) }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 0, ...S.panel, overflow: 'hidden' }}>
      {/* Left: game list */}
      <div style={{ borderRight: '1px solid var(--line)' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, fontWeight: 800, color: '#fff', letterSpacing: '0.08em' }}>JEUX ({games.length})</span>
          <button onClick={() => setAddingGame(v => !v)} style={S.btn(S.red, '#fff')}>+ Jeu</button>
        </div>

        {addingGame && (
          <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--line)', display: 'flex', gap: 6 }}>
            <input value={newGameName} onChange={e => setNewGameName(e.target.value)} placeholder="Nom du jeu…"
              style={{ ...S.input, flex: 1 }} onKeyDown={e => e.key === 'Enter' && handleAddGame()} />
            <button onClick={handleAddGame} disabled={loading} style={S.btn(S.red, '#fff')}>✓</button>
          </div>
        )}

        <div style={{ overflowY: 'auto', maxHeight: 520 }}>
          {games.map(g => (
            <GameRow key={g.id} game={g} selected={selectedId === g.id}
              onSelect={() => setSelectedId(g.id)} onToggle={() => handleToggle(g)} />
          ))}
        </div>
      </div>

      {/* Right: game config */}
      {selected ? (
        <div style={{ padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 16, borderBottom: '1px solid var(--line)' }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#fff' }}>{selected.name}</div>
              <div style={{ fontSize: 12, color: S.muted }}>{selected.active ? '● Actif' : '○ Inactif'}</div>
            </div>
          </div>

          <MapEditor game={selected} onRefresh={reload} />
          <FormatEditor game={selected} onRefresh={reload} />
          <ModeSlotEditor game={selected} onRefresh={reload} />
          <CustomRulesEditor game={selected} onRefresh={reload} />
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
          <div style={{ textAlign: 'center', color: S.muted }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>🎮</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Sélectionnez un jeu</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>pour configurer cartes, formats et règles</div>
          </div>
        </div>
      )}
    </div>
  )
}
