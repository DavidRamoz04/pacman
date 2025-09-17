import { Injectable, Inject } from '@angular/core';
import { GhostEntity } from '../../domain/entities/ghost.entity';
import { PacmanEntity } from '../../domain/entities/pacman.entity';
import { GameEntity } from '../../domain/entities/game.entity';
import { Direction, DirectionUtils } from '../../domain/value-objects/direction.vo';
import { Position } from '../../domain/value-objects/position.vo';
import { GhostMode, GhostModeUtils } from '../../domain/value-objects/ghost-mode.vo';
import { GhostType } from '../../domain/value-objects/ghost-type.vo';
import { PathfindingRepository } from '../../domain/repositories/pathfinding.repository';
import { PATHFINDING_REPOSITORY_TOKEN } from '../../infrastructure/tokens/injection.tokens';

@Injectable({
  providedIn: 'root'
})
export class MoveGhostUseCase {
  private readonly SCATTER_TARGETS = {
    [GhostType.BLINKY]: new Position(432, 80),
    [GhostType.PINKY]: new Position(432, 80),
    [GhostType.INKY]: new Position(432, 528),
    [GhostType.CLYDE]: new Position(32, 528)
  };

  constructor(
    @Inject(PATHFINDING_REPOSITORY_TOKEN) private pathfindingRepository: PathfindingRepository
  ) {}

  execute(ghost: GhostEntity, pacman: PacmanEntity, intersections: Position[], blockSize: number): void {
    if (!ghost.enteredMaze) {
      return;
    }

    if (this.pathfindingRepository.isInGhostHouse(ghost.position.x, ghost.position.y)) {
      ghost.setDirection(Direction.UP);
      return;
    }

    if (this.isAtIntersection(ghost, ghost.nextIntersection)) {
      this.updateGhostTarget(ghost, pacman, intersections, blockSize);
    }
  }

  private updateGhostTarget(ghost: GhostEntity, pacman: PacmanEntity, intersections: Position[], blockSize: number): void {
    let target: Position;

    switch (ghost.mode) {
      case GhostMode.CHASE:
        target = this.getChaseTarget(ghost, pacman, blockSize);
        break;
      case GhostMode.SCARED:
        target = this.getScaredTarget(intersections);
        break;
      default:
        target = this.getScatterTarget(ghost);
    }

    const path = this.pathfindingRepository.findPath(ghost.position, target);
    ghost.setPath(path);
    
    if (path.length > 0) {
      ghost.setNextIntersection(ghost.getNextPathPosition());
    }
  }

  private getChaseTarget(ghost: GhostEntity, pacman: PacmanEntity, blockSize: number): Position {
    switch (ghost.type) {
      case GhostType.BLINKY:
        return pacman.position;
      
      case GhostType.PINKY:
        const offset = blockSize * 4;
        switch (pacman.direction) {
          case Direction.RIGHT:
            return pacman.position.add(offset, 0);
          case Direction.LEFT:
            return pacman.position.add(-offset, 0);
          case Direction.UP:
            return pacman.position.add(0, -offset);
          case Direction.DOWN:
            return pacman.position.add(0, offset);
          default:
            return pacman.position;
        }
      
      case GhostType.CLYDE:
        const distance = ghost.position.distanceTo(pacman.position);
        return distance > blockSize * 8 ? pacman.position : this.getScatterTarget(ghost);
      
      case GhostType.INKY:
        // Complex Inky logic - simplified for now
        const aheadOffset = blockSize * 2;
        let pacmanAhead = pacman.position;
        switch (pacman.direction) {
          case Direction.RIGHT:
            pacmanAhead = pacman.position.add(aheadOffset, 0);
            break;
          case Direction.LEFT:
            pacmanAhead = pacman.position.add(-aheadOffset, 0);
            break;
          case Direction.UP:
            pacmanAhead = pacman.position.add(0, -aheadOffset);
            break;
          case Direction.DOWN:
            pacmanAhead = pacman.position.add(0, aheadOffset);
            break;
        }
        return pacmanAhead;
      
      default:
        return pacman.position;
    }
  }

  private getScaredTarget(intersections: Position[]): Position {
    const randomIndex = Math.floor(Math.random() * intersections.length);
    return intersections[randomIndex];
  }

  private getScatterTarget(ghost: GhostEntity): Position {
    return this.SCATTER_TARGETS[ghost.type];
  }

  private isAtIntersection(ghost: GhostEntity, intersection: Position | null): boolean {
    if (!intersection) return false;
    
    const threshold = 8; // pixels
    return Math.abs(ghost.position.x - intersection.x) < threshold &&
           Math.abs(ghost.position.y - intersection.y) < threshold;
  }
}
