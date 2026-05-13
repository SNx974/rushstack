export const APP_NAME = 'RUSH STACK';
export const APP_SCHEME = 'rushstack';

export const RANK_COLORS = {
  bronze:      '#cd7f32',
  silver:      '#c0c0c0',
  gold:        '#ffd700',
  platinum:    '#00d4ff',
  diamond:     '#b9f2ff',
  master:      '#9b59b6',
  grandmaster: '#e74c3c',
  challenger:  '#f39c12',
} as const;

export const QUEUE_STATUS_LABELS = {
  searching: 'Searching...',
  found:     'Match found!',
  in_match:  'In match',
  cancelled: 'Cancelled',
} as const;

export const MATCH_STATUS_COLORS = {
  pending:   '#6b7280',
  active:    '#22c55e',
  completed: '#3b82f6',
  cancelled: '#ef4444',
  disputed:  '#f59e0b',
} as const;

export const DEFAULT_MMR = 1000;
export const DEFAULT_K_FACTOR = 32;
export const PLACEMENT_MATCHES_COUNT = 10;

export const PAGE_SIZE = 20;
export const LEADERBOARD_PAGE_SIZE = 50;

export const NOTIFICATION_ICONS: Record<string, string> = {
  match_found:      '⚔️',
  match_invite:     '🎮',
  friend_request:   '👋',
  rank_up:          '🏆',
  rank_down:        '📉',
  result_submitted: '📋',
  dispute_opened:   '⚠️',
  dispute_resolved: '✅',
  system:           '📢',
};

export const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'BR', name: 'Brazil' },
  { code: 'KR', name: 'South Korea' },
  { code: 'JP', name: 'Japan' },
  { code: 'CN', name: 'China' },
] as const;
