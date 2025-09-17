import { Position } from '../value-objects/position.vo';
import { Direction } from '../value-objects/direction.vo';
import { GhostType } from '../value-objects/ghost-type.vo';
import { GhostMode } from '../value-objects/ghost-mode.vo';

export class GhostEntity {
  private _path: Position[] = [];
  private _nextIntersection: Position | null = null;
  private _hasBeenEaten: boolean = true;
  private _enteredMaze: boolean = false;
  private _blinkInterval: any = null;
  private _stuckTimer: number = 0;

  constructor(
    private _position: Position,
    private _direction: Direction,
    private _previousDirection: Direction,
    private _type: GhostType,
    private _mode: GhostMode = GhostMode.SCATTER,
    private _speed: number = 119
  ) {}

  get position(): Position {
    return this._position;
  }

  get direction(): Direction {
    return this._direction;
  }

  get previousDirection(): Direction {
    return this._previousDirection;
  }

  get type(): GhostType {
    return this._type;
  }

  get mode(): GhostMode {
    return this._mode;
  }

  get speed(): number {
    return this._speed;
  }

  get path(): Position[] {
    return [...this._path];
  }

  get nextIntersection(): Position | null {
    return this._nextIntersection;
  }

  get hasBeenEaten(): boolean {
    return this._hasBeenEaten;
  }

  get enteredMaze(): boolean {
    return this._enteredMaze;
  }

  get stuckTimer(): number {
    return this._stuckTimer;
  }

  setPosition(position: Position): void {
    this._position = position;
  }

  setDirection(direction: Direction): void {
    this._previousDirection = this._direction;
    this._direction = direction;
  }

  setMode(mode: GhostMode): void {
    this._mode = mode;
  }

  setSpeed(speed: number): void {
    this._speed = speed;
  }

  setPath(path: Position[]): void {
    this._path = [...path];
  }

  setNextIntersection(intersection: Position | null): void {
    this._nextIntersection = intersection;
  }

  setHasBeenEaten(eaten: boolean): void {
    this._hasBeenEaten = eaten;
  }

  setEnteredMaze(entered: boolean): void {
    this._enteredMaze = entered;
  }

  incrementStuckTimer(): void {
    this._stuckTimer++;
  }

  resetStuckTimer(): void {
    this._stuckTimer = 0;
  }

  getNextPathPosition(): Position | null {
    if (this._path.length > 0) {
      return this._path.shift() || null;
    }
    return null;
  }

  setBlinkInterval(interval: any): void {
    this._blinkInterval = interval;
  }

  clearBlinkInterval(): void {
    if (this._blinkInterval) {
      clearInterval(this._blinkInterval);
      this._blinkInterval = null;
    }
  }
}
