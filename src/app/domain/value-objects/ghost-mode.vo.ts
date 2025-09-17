export enum GhostMode {
  SCATTER = 'scatter',
  CHASE = 'chase',
  SCARED = 'scared'
}

export class GhostModeUtils {
  static getDuration(mode: GhostMode): number {
    switch (mode) {
      case GhostMode.SCATTER:
        return 7000;
      case GhostMode.CHASE:
        return 20000;
      case GhostMode.SCARED:
        return 9000;
      default:
        return 7000;
    }
  }

  static getSpeedMultiplier(mode: GhostMode): number {
    switch (mode) {
      case GhostMode.SCATTER:
      case GhostMode.CHASE:
        return 0.7;
      case GhostMode.SCARED:
        return 0.5;
      default:
        return 0.7;
    }
  }
}
