export interface RewardMilestone {
  level: number;
  points: number;
  title: string;
  reward: string;
  emoji: string;
  color: string;
  isMajor?: boolean;
  type: 'pizza' | 'kino' | 'nintendo';
}

export const REWARD_LADDER: RewardMilestone[] = [
  {
    level: 1,
    points: 1000,
    title: 'Stufe 1',
    reward: 'Pizza + Fanta Fest',
    emoji: '🍕🥤',
    color: 'from-amber-500 to-red-500',
    type: 'pizza',
  },
  {
    level: 2,
    points: 2000,
    title: 'Stufe 2',
    reward: 'Pizza + Fanta Fest',
    emoji: '🍕🥤',
    color: 'from-amber-500 to-orange-500',
    type: 'pizza',
  },
  {
    level: 3,
    points: 3000,
    title: 'Stufe 3',
    reward: 'Pizza + Fanta Fest',
    emoji: '🍕🥤',
    color: 'from-orange-500 to-amber-600',
    type: 'pizza',
  },
  {
    level: 4,
    points: 4000,
    title: 'Stufe 4',
    reward: 'Kino & Popcorn Nachmittag',
    emoji: '🎬🍿',
    color: 'from-blue-500 to-indigo-600',
    type: 'kino',
  },
  {
    level: 5,
    points: 5000,
    title: 'Stufe 5',
    reward: 'Pizza + Fanta Fest',
    emoji: '🍕🥤',
    color: 'from-amber-500 to-red-500',
    type: 'pizza',
  },
  {
    level: 6,
    points: 6000,
    title: 'Stufe 6',
    reward: 'Pizza + Fanta Fest',
    emoji: '🍕🥤',
    color: 'from-amber-500 to-orange-500',
    type: 'pizza',
  },
  {
    level: 7,
    points: 7000,
    title: 'Stufe 7',
    reward: 'Pizza + Fanta Fest',
    emoji: '🍕🥤',
    color: 'from-orange-500 to-amber-600',
    type: 'pizza',
  },
  {
    level: 8,
    points: 8000,
    title: 'Stufe 8',
    reward: 'Kino & Popcorn Nachmittag',
    emoji: '🎬🍿',
    color: 'from-blue-500 to-indigo-600',
    type: 'kino',
  },
  {
    level: 9,
    points: 9000,
    title: 'Stufe 9',
    reward: 'Pizza + Fanta Fest',
    emoji: '🍕🥤',
    color: 'from-amber-500 to-red-500',
    type: 'pizza',
  },
  {
    level: 10,
    points: 10000,
    title: 'Stufe 10',
    reward: 'Pizza + Fanta Fest',
    emoji: '🍕🥤',
    color: 'from-amber-500 to-orange-500',
    type: 'pizza',
  },
  {
    level: 11,
    points: 11000,
    title: 'Stufe 11',
    reward: 'Pizza + Fanta Fest',
    emoji: '🍕🥤',
    color: 'from-orange-500 to-amber-600',
    type: 'pizza',
  },
  {
    level: 12,
    points: 12000,
    title: 'Stufe 12',
    reward: 'Kino & Popcorn Nachmittag',
    emoji: '🎬🍿',
    color: 'from-blue-500 to-indigo-600',
    type: 'kino',
  },
  {
    level: 13,
    points: 13000,
    title: 'Stufe 13',
    reward: 'Pizza + Fanta Fest',
    emoji: '🍕🥤',
    color: 'from-amber-500 to-red-500',
    type: 'pizza',
  },
  {
    level: 14,
    points: 14000,
    title: 'Stufe 14',
    reward: 'Pizza + Fanta Fest',
    emoji: '🍕🥤',
    color: 'from-amber-500 to-orange-500',
    type: 'pizza',
  },
  {
    level: 15,
    points: 15000,
    title: 'Stufe 15',
    reward: 'Pizza + Fanta Fest',
    emoji: '🍕🥤',
    color: 'from-orange-500 to-amber-600',
    type: 'pizza',
  },
  {
    level: 16,
    points: 16000,
    title: 'Stufe 16',
    reward: 'Kino & Popcorn Nachmittag',
    emoji: '🎬🍿',
    color: 'from-blue-500 to-indigo-600',
    type: 'kino',
  },
  {
    level: 17,
    points: 17000,
    title: 'Stufe 17',
    reward: 'Pizza + Fanta Fest',
    emoji: '🍕🥤',
    color: 'from-amber-500 to-red-500',
    type: 'pizza',
  },
  {
    level: 18,
    points: 18000,
    title: 'Stufe 18',
    reward: 'Pizza + Fanta Fest',
    emoji: '🍕🥤',
    color: 'from-amber-500 to-orange-500',
    type: 'pizza',
  },
  {
    level: 19,
    points: 19000,
    title: 'Stufe 19',
    reward: 'Pizza + Fanta Fest',
    emoji: '🍕🥤',
    color: 'from-orange-500 to-amber-600',
    type: 'pizza',
  },
  {
    level: 20,
    points: 20000,
    title: 'Stufe 20',
    reward: 'Smith Toys Gift Card for a Nintendo Game',
    emoji: '🎮🏆',
    color: 'from-violet-600 via-fuchsia-600 to-amber-400',
    isMajor: true,
    type: 'nintendo',
  },
];

/**
 * Finds the upcoming reward milestone based on cumulative points.
 */
export function getNextRewardMilestone(cumulativePoints: number): {
  nextMilestone: RewardMilestone;
  previousThreshold: number;
  pointsToNext: number;
  progressPercent: number;
} {
  const next = REWARD_LADDER.find((m) => cumulativePoints < m.points) || REWARD_LADDER[REWARD_LADDER.length - 1];
  const nextIndex = REWARD_LADDER.findIndex((m) => m.level === next.level);
  const previousThreshold = nextIndex > 0 ? REWARD_LADDER[nextIndex - 1].points : 0;
  const pointsToNext = Math.max(0, next.points - cumulativePoints);

  // Milestone slice: e.g. from 0 to 1000, or from 1000 to 2000
  const span = next.points - previousThreshold;
  const pointsInCurrentSpan = Math.max(0, cumulativePoints - previousThreshold);
  const progressPercent = Math.min(100, Math.max(0, Math.round((pointsInCurrentSpan / span) * 100)));

  return {
    nextMilestone: next,
    previousThreshold,
    pointsToNext,
    progressPercent,
  };
}

/**
 * Format numbers according to German locale, e.g. 1.000 or 20.000
 */
export function formatPoints(num: number): string {
  return num.toLocaleString('de-DE');
}
