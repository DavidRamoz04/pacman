export enum Direction {
  UP = 'up',
  DOWN = 'down',
  LEFT = 'left',
  RIGHT = 'right',
  NULL = 'null'
}

export class DirectionUtils {
  static getOpposite(direction: Direction): Direction {
    switch (direction) {
      case Direction.UP:
        return Direction.DOWN;
      case Direction.DOWN:
        return Direction.UP;
      case Direction.LEFT:
        return Direction.RIGHT;
      case Direction.RIGHT:
        return Direction.LEFT;
      default:
        return Direction.NULL;
    }
  }

  static getOffset(direction: Direction, blockSize: number): { x: number; y: number } {
    switch (direction) {
      case Direction.UP:
        return { x: 0, y: -blockSize };
      case Direction.DOWN:
        return { x: 0, y: blockSize };
      case Direction.LEFT:
        return { x: -blockSize, y: 0 };
      case Direction.RIGHT:
        return { x: blockSize, y: 0 };
      default:
        return { x: 0, y: 0 };
    }
  }

  static isPerpendicular(dir1: Direction, dir2: Direction): boolean {
    const horizontal = [Direction.LEFT, Direction.RIGHT];
    const vertical = [Direction.UP, Direction.DOWN];
    
    return (horizontal.includes(dir1) && vertical.includes(dir2)) ||
           (vertical.includes(dir1) && horizontal.includes(dir2));
  }
}
