// Increasing threshold per level: level N->N+1 requires N * BASE_POINTS_PER_LEVEL points.
export const BASE_POINTS_PER_LEVEL = 100;

export interface LevelInfo {
  level: number;
  pointsIntoLevel: number;
  pointsForNextLevel: number;
  progress: number;
  totalPoints: number;
}

export function getLevelInfo(totalPoints: number): LevelInfo {
  let level = 1;
  let floor = 0;
  let pointsForNextLevel = level * BASE_POINTS_PER_LEVEL;

  while (totalPoints >= floor + pointsForNextLevel) {
    floor += pointsForNextLevel;
    level += 1;
    pointsForNextLevel = level * BASE_POINTS_PER_LEVEL;
  }

  const pointsIntoLevel = totalPoints - floor;
  return {
    level,
    pointsIntoLevel,
    pointsForNextLevel,
    progress: pointsIntoLevel / pointsForNextLevel,
    totalPoints,
  };
}
