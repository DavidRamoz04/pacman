export class Position {
  constructor(
    private readonly _x: number,
    private readonly _y: number
  ) {}

  get x(): number {
    return this._x;
  }

  get y(): number {
    return this._y;
  }

  equals(other: Position): boolean {
    return this._x === other._x && this._y === other._y;
  }

  distanceTo(other: Position): number {
    return Math.hypot(this._x - other._x, this._y - other._y);
  }

  manhattanDistanceTo(other: Position): number {
    return Math.abs(this._x - other._x) + Math.abs(this._y - other._y);
  }

  add(x: number, y: number): Position {
    return new Position(this._x + x, this._y + y);
  }

  toString(): string {
    return `Position(${this._x}, ${this._y})`;
  }
}
