import { PacmanEntity } from './pacman.entity';
import { GhostEntity } from './ghost.entity';
import { Position } from '../value-objects/position.vo';
import { GhostMode } from '../value-objects/ghost-mode.vo';

export class GameEntity {
  private _pacman: PacmanEntity;
  private _ghosts: GhostEntity[] = [];
  private _lives: number = 3;
  private _score: number = 0;
  private _currentMode: GhostMode = GhostMode.SCATTER;
  private _previousMode: GhostMode = GhostMode.SCATTER;
  private _intersections: Position[] = [];
  private _dots: Position[] = [];
  private _powerPills: Position[] = [];
  private _blockSize: number = 16;
  private _modeTimer: any = null;

  constructor(pacman: PacmanEntity, ghosts: GhostEntity[]) {
    this._pacman = pacman;
    this._ghosts = ghosts;
  }

  get pacman(): PacmanEntity {
    return this._pacman;
  }

  get ghosts(): GhostEntity[] {
    return [...this._ghosts];
  }

  get lives(): number {
    return this._lives;
  }

  get score(): number {
    return this._score;
  }

  get currentMode(): GhostMode {
    return this._currentMode;
  }

  get previousMode(): GhostMode {
    return this._previousMode;
  }

  get intersections(): Position[] {
    return [...this._intersections];
  }

  get dots(): Position[] {
    return [...this._dots];
  }

  get powerPills(): Position[] {
    return [...this._powerPills];
  }

  get blockSize(): number {
    return this._blockSize;
  }

  setLives(lives: number): void {
    this._lives = lives;
  }

  decrementLives(): void {
    this._lives = Math.max(0, this._lives - 1);
  }

  addScore(points: number): void {
    this._score += points;
  }

  setCurrentMode(mode: GhostMode): void {
    this._previousMode = this._currentMode;
    this._currentMode = mode;
  }

  setIntersections(intersections: Position[]): void {
    this._intersections = [...intersections];
  }

  setDots(dots: Position[]): void {
    this._dots = [...dots];
  }

  setPowerPills(powerPills: Position[]): void {
    this._powerPills = [...powerPills];
  }

  removeDot(position: Position): void {
    this._dots = this._dots.filter(dot => !dot.equals(position));
  }

  removePowerPill(position: Position): void {
    this._powerPills = this._powerPills.filter(pill => !pill.equals(position));
  }

  isGameOver(): boolean {
    return this._lives <= 0;
  }

  isLevelComplete(): boolean {
    return this._dots.length === 0 && this._powerPills.length === 0;
  }

  setModeTimer(timer: any): void {
    if (this._modeTimer) {
      clearTimeout(this._modeTimer);
    }
    this._modeTimer = timer;
  }

  clearModeTimer(): void {
    if (this._modeTimer) {
      clearTimeout(this._modeTimer);
      this._modeTimer = null;
    }
  }
}
