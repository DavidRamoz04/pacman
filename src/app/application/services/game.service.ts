import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { GameEntity } from '../../domain/entities/game.entity';
import { PacmanEntity } from '../../domain/entities/pacman.entity';
import { GhostEntity } from '../../domain/entities/ghost.entity';
import { Position } from '../../domain/value-objects/position.vo';
import { Direction } from '../../domain/value-objects/direction.vo';
import { GhostType } from '../../domain/value-objects/ghost-type.vo';
import { GhostMode, GhostModeUtils } from '../../domain/value-objects/ghost-mode.vo';
import { MovePacmanUseCase } from '../use-cases/move-pacman.use-case';
import { MoveGhostUseCase } from '../use-cases/move-ghost.use-case';
import { HandleCollisionUseCase } from '../use-cases/handle-collision.use-case';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private gameSubject = new BehaviorSubject<GameEntity | null>(null);
  private modeTimer: any = null;

  constructor(
    private movePacmanUseCase: MovePacmanUseCase,
    private moveGhostUseCase: MoveGhostUseCase,
    private handleCollisionUseCase: HandleCollisionUseCase
  ) {}

  get game$(): Observable<GameEntity | null> {
    return this.gameSubject.asObservable();
  }

  get currentGame(): GameEntity | null {
    return this.gameSubject.value;
  }

  initializeGame(): void {
    const pacman = new PacmanEntity(
      new Position(230, 432),
      Direction.LEFT,
      Direction.LEFT,
      170,
      true
    );

    const ghosts = [
      new GhostEntity(new Position(232, 290), Direction.RIGHT, Direction.RIGHT, GhostType.BLINKY),
      new GhostEntity(new Position(232, 290), Direction.RIGHT, Direction.RIGHT, GhostType.PINKY),
      new GhostEntity(new Position(210, 290), Direction.RIGHT, Direction.RIGHT, GhostType.CLYDE),
      new GhostEntity(new Position(255, 290), Direction.RIGHT, Direction.RIGHT, GhostType.INKY)
    ];

    const game = new GameEntity(pacman, ghosts);
    this.gameSubject.next(game);
    this.initModeTimers(game);
  }

  movePacman(direction: Direction): void {
    const game = this.currentGame;
    if (!game) return;

    const result = this.movePacmanUseCase.execute(
      game.pacman,
      direction,
      game.intersections,
      game.blockSize
    );

    this.gameSubject.next(game);
  }

  updateGame(): void {
    const game = this.currentGame;
    if (!game || !game.pacman.isAlive || game.isGameOver()) return;

    // Move ghosts
    for (const ghost of game.ghosts) {
      this.moveGhostUseCase.execute(ghost, game.pacman, game.intersections, game.blockSize);
    }

    // Handle collisions
    const collisionResult = this.handleCollisionUseCase.execute(game);

    if (collisionResult.pacmanDied) {
      this.handlePacmanDeath(game);
    }

    if (collisionResult.powerPillEaten) {
      this.activateScaredMode(game);
    }

    this.gameSubject.next(game);
  }

  private handlePacmanDeath(game: GameEntity): void {
    game.pacman.die();
    game.decrementLives();

    if (!game.isGameOver()) {
      setTimeout(() => {
        this.respawnPacman(game);
      }, 2000);
    }
  }

  private respawnPacman(game: GameEntity): void {
    game.pacman.respawn(new Position(230, 432));
    this.resetGhosts(game);
    this.gameSubject.next(game);
  }

  private resetGhosts(game: GameEntity): void {
    const positions = [
      new Position(232, 290),
      new Position(232, 290),
      new Position(210, 290),
      new Position(255, 290)
    ];

    game.ghosts.forEach((ghost, index) => {
      ghost.setPosition(positions[index]);
      ghost.setDirection(Direction.RIGHT);
      ghost.setHasBeenEaten(true);
      ghost.setEnteredMaze(false);
      ghost.clearBlinkInterval();
    });

    this.startGhostEntries(game);
  }

  private startGhostEntries(game: GameEntity): void {
    const entryDelay = 7000;
    game.ghosts.forEach((ghost, index) => {
      setTimeout(() => {
        ghost.setPosition(new Position(232, 240));
        ghost.setEnteredMaze(true);
        if (game.currentMode !== GhostMode.SCARED) {
          ghost.setHasBeenEaten(true);
        }
      }, entryDelay * index);
    });
  }

  private activateScaredMode(game: GameEntity): void {
    game.setCurrentMode(GhostMode.SCARED);
    this.setModeTimer(game, GhostModeUtils.getDuration(GhostMode.SCARED));
    
    game.ghosts.forEach(ghost => {
      ghost.setMode(GhostMode.SCARED);
      ghost.setSpeed(game.pacman.speed * GhostModeUtils.getSpeedMultiplier(GhostMode.SCARED));
      ghost.setHasBeenEaten(false);
    });
  }

  private initModeTimers(game: GameEntity): void {
    this.setModeTimer(game, GhostModeUtils.getDuration(GhostMode.SCATTER));
  }

  private setModeTimer(game: GameEntity, duration: number): void {
    if (this.modeTimer) {
      clearTimeout(this.modeTimer);
    }

    this.modeTimer = setTimeout(() => {
      this.switchMode(game);
    }, duration);

    game.setModeTimer(this.modeTimer);
  }

  private switchMode(game: GameEntity): void {
    if (game.currentMode === GhostMode.SCARED) {
      game.setCurrentMode(game.previousMode || GhostMode.SCATTER);
    } else {
      const newMode = game.currentMode === GhostMode.SCATTER ? GhostMode.CHASE : GhostMode.SCATTER;
      game.setCurrentMode(newMode);
    }

    const speedMultiplier = GhostModeUtils.getSpeedMultiplier(game.currentMode);
    game.ghosts.forEach(ghost => {
      ghost.setMode(game.currentMode);
      ghost.setSpeed(game.pacman.speed * speedMultiplier);
      if (game.currentMode !== GhostMode.SCARED) {
        ghost.setHasBeenEaten(true);
        ghost.clearBlinkInterval();
      }
    });

    this.setModeTimer(game, GhostModeUtils.getDuration(game.currentMode));
    this.gameSubject.next(game);
  }

  restartGame(): void {
    this.gameSubject.next(null);
    if (this.modeTimer) {
      clearTimeout(this.modeTimer);
    }
    this.initializeGame();
  }
}
