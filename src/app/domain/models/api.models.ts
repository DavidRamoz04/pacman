// Modelos de la API REST para el juego Pacman

export interface Player {
  playerId: number;
  username: string;
  createdAt: string;
  gameSessions?: GameSession[];
}

export interface GameSession {
  gameSessionId: number;
  playerId: number;
  score: number;
  maxLevelReached: number;
  playedAt: string;
  player?: Player;
}

export interface PlayerStatistics {
  playerId: number;
  maxLevelReached: number;
  averageScore: number;
  totalGameSessions: number;
  bestScore: number;
}

export interface CreatePlayerRequest {
  username: string;
}

export interface CreateGameSessionRequest {
  playerId: number;
  score: number;
  maxLevelReached: number;
}

export interface HealthStatus {
  status: string;
  databaseStatus: string;
  timestamp: string;
  version: string;
  statistics: DatabaseStatistics;
  error?: string;
}

export interface DatabaseHealth {
  canConnect: boolean;
  status: string;
  databaseName: string;
  connectionString: string;
  timestamp: string;
  error?: string;
}

export interface DatabaseStatistics {
  totalPlayers: number;
  totalGameSessions: number;
}

export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
}

// Modelo extendido para compatibilidad con el sistema actual
export interface HighScore {
  score: number;
  date: string;
  rank: number;
  playerName: string;
  playerId?: number;
  gameSessionId?: number;
}

// Configuración de la API
export interface ApiConfig {
  baseUrl: string;
  timeout: number;
}
