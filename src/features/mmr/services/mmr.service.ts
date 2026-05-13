import type { MmrSystem } from '@/types';

// ─── ELO-based MMR calculation (client-side mirror of DB function) ─────────────

export interface MmrCalculationResult {
  winnerDelta: number;
  loserDelta: number;
  expectedScore: number;
}

export function calculateMmrChange(
  winnerMmr: number,
  loserMmr: number,
  system: Pick<MmrSystem, 'k_factor' | 'streak_bonus_enabled' | 'streak_bonus_amount' | 'streak_threshold'>,
  winnerStreak = 0
): MmrCalculationResult {
  const kFactor = Number(system.k_factor);

  // Expected score for winner based on ELO formula
  const expectedScore = 1 / (1 + Math.pow(10, (loserMmr - winnerMmr) / 400));

  // Base gains
  const streakBonus =
    system.streak_bonus_enabled && winnerStreak >= system.streak_threshold
      ? system.streak_bonus_amount
      : 0;

  const winnerDelta = Math.max(1, Math.min(100, Math.round(kFactor * (1 - expectedScore)) + streakBonus));
  const loserDelta = Math.max(1, Math.min(100, Math.round(kFactor * expectedScore)));

  return { winnerDelta, loserDelta, expectedScore };
}

// ─── Rank determination ───────────────────────────────────────────────────────

export function getRankForMmr(
  mmr: number,
  rankTiers: Array<{ min_mmr: number; max_mmr: number; name: string; division?: string | null; color: string; order: number }>
) {
  return (
    rankTiers
      .sort((a, b) => b.order - a.order)
      .find((tier) => mmr >= tier.min_mmr && mmr < tier.max_mmr) ?? null
  );
}

// ─── MMR progress within a rank tier ─────────────────────────────────────────

export function getRankProgress(mmr: number, tier: { min_mmr: number; max_mmr: number } | null) {
  if (!tier) return 0;
  const range = tier.max_mmr - tier.min_mmr;
  if (range === 0) return 100;
  return Math.min(100, Math.max(0, Math.round(((mmr - tier.min_mmr) / range) * 100)));
}

// ─── Win rate helper ──────────────────────────────────────────────────────────

export function calcWinRate(wins: number, losses: number): number {
  const total = wins + losses;
  if (total === 0) return 0;
  return Math.round((wins / total) * 100);
}

// ─── MMR decay calculation ────────────────────────────────────────────────────

export function shouldApplyDecay(
  lastPlayedAt: string | null,
  system: Pick<MmrSystem, 'decay_enabled' | 'decay_days'>
): boolean {
  if (!system.decay_enabled || !lastPlayedAt) return false;
  const daysSincePlay = (Date.now() - new Date(lastPlayedAt).getTime()) / (1000 * 60 * 60 * 24);
  return daysSincePlay >= system.decay_days;
}

export function calculateDecayAmount(
  mmr: number,
  lastPlayedAt: string | null,
  system: Pick<MmrSystem, 'decay_enabled' | 'decay_days' | 'decay_amount' | 'base_mmr'>
): number {
  if (!shouldApplyDecay(lastPlayedAt, system)) return 0;
  const daysSincePlay = (Date.now() - new Date(lastPlayedAt!).getTime()) / (1000 * 60 * 60 * 24);
  const decayCycles = Math.floor((daysSincePlay - system.decay_days) / system.decay_days) + 1;
  const totalDecay = decayCycles * system.decay_amount;
  return Math.min(totalDecay, mmr - system.base_mmr); // Never decay below base
}
