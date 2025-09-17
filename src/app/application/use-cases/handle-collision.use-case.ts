import { Injectable } from '@angular/core';
import { PacmanEntity } from '../../domain/entities/pacman.entity';
import { GhostEntity } from '../../domain/entities/ghost.entity';
import { GameEntity } from '../../domain/entities/game.entity';
import { Position } from '../../domain/value-objects/position.vo';
import { GhostMode } from '../../domain/value-objects/ghost-mode.vo';

@Injectable({
  providedIn: 'root'
})
export class HandleCollisionUseCase {
  execute(game: GameEntity): { pacmanDied: boolean; ghostEaten: boolean; dotEaten: boolean; powerPillEaten: boolean } {
    let pacmanDied = false;
    let ghostEaten = false;
    let dotEaten = false;
    let powerPillEaten = false;

    // Check ghost collisions
    for (const ghost of game.ghosts) {
      if (this.isColliding(game.pacman.position, ghost.position)) {
        if (game.currentMode === GhostMode.SCARED && !ghost.hasBeenEaten) {
          ghost.setHasBeenEaten(true);
          ghostEaten = true;
          game.addScore(200);
        } else if (ghost.hasBeenEaten) {
          pacmanDied = true;
          break;
        }
      }
    }

    // Check dot collisions
    for (const dot of game.dots) {
      if (this.isColliding(game.pacman.position, dot)) {
        game.removeDot(dot);
        game.addScore(10);
        dotEaten = true;
        break;
      }
    }

    // Check power pill collisions
    for (const powerPill of game.powerPills) {
      if (this.isColliding(game.pacman.position, powerPill)) {
        game.removePowerPill(powerPill);
        game.addScore(50);
        powerPillEaten = true;
        break;
      }
    }

    return { pacmanDied, ghostEaten, dotEaten, powerPillEaten };
  }

  private isColliding(pos1: Position, pos2: Position): boolean {
    const threshold = 16; // Block size
    return Math.abs(pos1.x - pos2.x) < threshold && Math.abs(pos1.y - pos2.y) < threshold;
  }
}
