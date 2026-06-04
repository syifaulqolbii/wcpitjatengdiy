export interface User {
  id: string;
  name: string;
  email: string;
  role: 'player' | 'admin';
  createdAt: Date;
}

export interface Match {
  id: string;
  teamA: string;
  teamB: string;
  flagA: string;        // emoji bendera
  flagB: string;
  group: string;        // "Group A", "Round of 32", dst
  stage: string;        // 'group_stage', 'round_16', dst
  kickoffTime: Date;    // selalu UTC
  status: 'upcoming' | 'live' | 'finished';
  scoreA: number | null;
  scoreB: number | null;
}

export interface Prediction {
  id: string;
  userId: string;
  matchId: string;
  predictedA: number;
  predictedB: number;
  points: number | null;
  submittedAt: Date;
  match?: Match;
  user?: Pick<User, 'id' | 'name' | 'email'>;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  image: string | null;
  totalPoints: number;
  stagePoints: Record<string, number>;
  perfectScores: number;
  correctResults: number;
  totalPredicted: number;
  rankChange: number | null;
}
