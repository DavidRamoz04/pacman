import { Position } from '../value-objects/position.vo';
import { Direction } from '../value-objects/direction.vo';

export interface PathfindingRepository {
  findPath(start: Position, target: Position): Position[];
  getNextIntersection(currentX: number, currentY: number, direction: Direction): Position | null;
  isInGhostHouse(x: number, y: number): boolean;
}
