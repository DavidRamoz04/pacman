import { Injectable, Inject } from '@angular/core';
import { PacmanEntity } from '../../domain/entities/pacman.entity';
import { GameEntity } from '../../domain/entities/game.entity';
import { Direction } from '../../domain/value-objects/direction.vo';
import { Position } from '../../domain/value-objects/position.vo';
import { GameRepository } from '../../domain/repositories/game.repository';
import { PathfindingRepository } from '../../domain/repositories/pathfinding.repository';
import { GAME_REPOSITORY_TOKEN, PATHFINDING_REPOSITORY_TOKEN } from '../../infrastructure/tokens/injection.tokens';

@Injectable({
  providedIn: 'root'
})
export class MovePacmanUseCase {
  constructor(
    @Inject(GAME_REPOSITORY_TOKEN) private gameRepository: GameRepository,
    @Inject(PATHFINDING_REPOSITORY_TOKEN) private pathfindingRepository: PathfindingRepository
  ) {}

  execute(
    pacman: PacmanEntity,
    newDirection: Direction,
    intersections: Position[],
    blockSize: number
  ): { nextIntersection: Position | null; canMove: boolean } {
    if (!pacman.isAlive) {
      return { nextIntersection: null, canMove: false };
    }

    const nextIntersection = this.getNextIntersectionInDirection(
      pacman.position.x,
      pacman.position.y,
      pacman.direction,
      newDirection,
      intersections
    );

    if (nextIntersection && this.isIntersectionInDirection(nextIntersection, newDirection)) {
      pacman.setDirection(newDirection);
      return { nextIntersection, canMove: true };
    }

    return { nextIntersection: null, canMove: false };
  }

  private getNextIntersectionInDirection(
    currentX: number,
    currentY: number,
    currentDirection: Direction,
    nextDirection: Direction,
    intersections: Position[]
  ): Position | null {
    const filteredIntersections = intersections.filter((intersection) => {
      switch (currentDirection) {
        case Direction.UP:
          return intersection.x === currentX && intersection.y <= currentY;
        case Direction.DOWN:
          return intersection.x === currentX && intersection.y >= currentY;
        case Direction.LEFT:
          return intersection.y === currentY && intersection.x <= currentX;
        case Direction.RIGHT:
          return intersection.y === currentY && intersection.x >= currentX;
        default:
          return false;
      }
    }).filter(intersection => this.isIntersectionInDirection(intersection, nextDirection))
      .sort((a, b) => {
        if (currentDirection === Direction.UP || currentDirection === Direction.DOWN) {
          return currentDirection === Direction.UP ? b.y - a.y : a.y - b.y;
        } else {
          return currentDirection === Direction.LEFT ? b.x - a.x : a.x - b.x;
        }
      });

    return filteredIntersections.length > 0 ? filteredIntersections[0] : null;
  }

  private isIntersectionInDirection(intersection: Position, direction: Direction): boolean {
    // This would need to be implemented based on intersection data structure
    // For now, return true as placeholder
    return true;
  }
}
