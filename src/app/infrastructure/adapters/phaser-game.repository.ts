import { Injectable } from '@angular/core';
import { GameRepository } from '../../domain/repositories/game.repository';
import { GameEntity } from '../../domain/entities/game.entity';
import { Position } from '../../domain/value-objects/position.vo';

@Injectable({
  providedIn: 'root'
})
export class PhaserGameRepository implements GameRepository {
  private map: Phaser.Tilemaps.Tilemap | null = null;
  private board: number[][] = [];
  private blockSize = 16;

  async loadMap(): Promise<any> {
    // This will be implemented when we integrate with Phaser scene
    return null;
  }

  setMap(map: Phaser.Tilemaps.Tilemap): void {
    this.map = map;
    this.populateBoard();
  }

  getIntersections(): Position[] {
    const intersections: Position[] = [];
    const directions = [
      { x: -this.blockSize, y: 0, name: "left" },
      { x: this.blockSize, y: 0, name: "right" },
      { x: 0, y: -this.blockSize, name: "up" },
      { x: 0, y: this.blockSize, name: "down" }
    ];

    if (!this.map) return intersections;

    for (let y = 0; y < this.map.heightInPixels; y += this.blockSize) {
      for (let x = 0; x < this.map.widthInPixels; x += this.blockSize) {
        if (x % this.blockSize !== 0 || y % this.blockSize !== 0) continue;
        if (!this.isPointClear(x, y)) continue;

        let openPaths: string[] = [];
        directions.forEach((dir) => {
          if (this.isPathOpenAroundPoint(x + dir.x, y + dir.y)) {
            openPaths.push(dir.name);
          }
        });

        if (openPaths.length > 2 && y > 64 && y < 530) {
          intersections.push(new Position(x, y));
        } else if (openPaths.length === 2 && y > 64 && y < 530) {
          const [dir1, dir2] = openPaths;
          if (((dir1 === "left" || dir1 === "right") && (dir2 === "up" || dir2 === "down")) ||
              ((dir1 === "up" || dir1 === "down") && (dir2 === "left" || dir2 === "right"))) {
            intersections.push(new Position(x, y));
          }
        }
      }
    }

    return intersections;
  }

  getDots(): Position[] {
    const dots: Position[] = [];
    if (!this.map) return dots;

    const layer = this.map.getLayer("Tile Layer 1");
    if (!layer) return dots;

    layer.tilemapLayer.forEachTile((tile: Phaser.Tilemaps.Tile) => {
      if (tile.y < 4 || (tile.y > 11 && tile.y < 23 && tile.x > 6 && tile.x < 21) || 
          (tile.y === 17 && tile.x !== 6 && tile.x !== 21)) {
        return;
      }

      const rightTile = this.map!.getTileAt(tile.x + 1, tile.y, true, "Tile Layer 1");
      const bottomTile = this.map!.getTileAt(tile.x, tile.y + 1, true, "Tile Layer 1");
      const rightBottomTile = this.map!.getTileAt(tile.x + 1, tile.y + 1, true, "Tile Layer 1");

      if (tile.index === -1 && rightTile && rightTile.index === -1 && 
          bottomTile && bottomTile.index === -1 && rightBottomTile && rightBottomTile.index === -1) {
        const x = tile.x * tile.width;
        const y = tile.y * tile.height;
        dots.push(new Position(x + tile.width, y + tile.height));
      }
    });

    return dots;
  }

  getPowerPills(): Position[] {
    return [
      new Position(32, 144),
      new Position(432, 144),
      new Position(32, 480),
      new Position(432, 480)
    ];
  }

  isPointClear(x: number, y: number): boolean {
    const corners = [
      { x: x - 1, y: y - 1 },
      { x: x + 1, y: y - 1 },
      { x: x - 1, y: y + 1 },
      { x: x + 1, y: y + 1 }
    ];

    return corners.every((corner) => {
      const tileX = Math.floor(corner.x / this.blockSize);
      const tileY = Math.floor(corner.y / this.blockSize);
      return !this.board[tileY] || this.board[tileY][tileX] === -1;
    });
  }

  isPathOpenAroundPoint(pixelX: number, pixelY: number): boolean {
    const corners = [
      { x: pixelX - 1, y: pixelY - 1 },
      { x: pixelX + 1, y: pixelY - 1 },
      { x: pixelX - 1, y: pixelY + 1 },
      { x: pixelX + 1, y: pixelY + 1 }
    ];

    return corners.every((corner) => {
      const tileX = Math.floor(corner.x / this.blockSize);
      const tileY = Math.floor(corner.y / this.blockSize);
      if (!this.board[tileY] || this.board[tileY][tileX] !== -1) {
        return false;
      }
      return true;
    });
  }

  saveGameState(game: GameEntity): void {
    localStorage.setItem('pacman-game-state', JSON.stringify({
      lives: game.lives,
      score: game.score,
      pacmanPosition: { x: game.pacman.position.x, y: game.pacman.position.y },
      pacmanDirection: game.pacman.direction
    }));
  }

  loadGameState(): GameEntity | null {
    const savedState = localStorage.getItem('pacman-game-state');
    if (!savedState) return null;

    try {
      const state = JSON.parse(savedState);
      // This would need to be implemented to recreate the game entity
      return null;
    } catch {
      return null;
    }
  }

  private populateBoard(): void {
    if (!this.map) return;

    const layer = this.map.getLayer("Tile Layer 1");
    if (!layer) return;

    layer.tilemapLayer.forEachTile((tile: Phaser.Tilemaps.Tile) => {
      if (!this.board[tile.y]) {
        this.board[tile.y] = [];
      }
      this.board[tile.y][tile.x] = tile.index;
    });
  }
}
