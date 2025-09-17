import { GameEntity } from '../entities/game.entity';
import { Position } from '../value-objects/position.vo';

export interface GameRepository {
  loadMap(): Promise<any>;
  getIntersections(): Position[];
  getDots(): Position[];
  getPowerPills(): Position[];
  isPointClear(x: number, y: number): boolean;
  isPathOpenAroundPoint(x: number, y: number): boolean;
  saveGameState(game: GameEntity): void;
  loadGameState(): GameEntity | null;
}
