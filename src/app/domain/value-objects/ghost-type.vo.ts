export enum GhostType {
  BLINKY = 'blinky',
  PINKY = 'pinky',
  INKY = 'inky',
  CLYDE = 'clyde'
}

export class GhostTypeUtils {
  static getColor(type: GhostType): string {
    switch (type) {
      case GhostType.BLINKY:
        return 'red';
      case GhostType.PINKY:
        return 'pink';
      case GhostType.INKY:
        return 'blue';
      case GhostType.CLYDE:
        return 'orange';
      default:
        return 'white';
    }
  }

  static getSpriteKey(type: GhostType): string {
    switch (type) {
      case GhostType.BLINKY:
        return 'redGhost';
      case GhostType.PINKY:
        return 'pinkGhost';
      case GhostType.INKY:
        return 'blueGhost';
      case GhostType.CLYDE:
        return 'orangeGhost';
      default:
        return 'ghost';
    }
  }
}
