import { Position } from '../value-objects/position.vo';
import { Direction } from '../value-objects/direction.vo';

export class PacmanEntity {
  constructor(
    private _position: Position,
    private _direction: Direction,
    private _previousDirection: Direction,
    private _speed: number = 170,
    private _isAlive: boolean = true
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

  get speed(): number {
    return this._speed;
  }

  get isAlive(): boolean {
    return this._isAlive;
  }

  setPosition(position: Position): void {
    this._position = position;
  }

  setDirection(direction: Direction): void {
    this._previousDirection = this._direction;
    this._direction = direction;
  }

  die(): void {
    this._isAlive = false;
  }

  respawn(position: Position): void {
    this._position = position;
    this._isAlive = true;
    this._direction = Direction.LEFT;
  }
}
