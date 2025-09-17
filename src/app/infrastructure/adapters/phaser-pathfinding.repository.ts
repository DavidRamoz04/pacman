import { Injectable } from '@angular/core';
import { PathfindingRepository } from '../../domain/repositories/pathfinding.repository';
import { Position } from '../../domain/value-objects/position.vo';
import { Direction } from '../../domain/value-objects/direction.vo';

@Injectable({
  providedIn: 'root'
})
export class PhaserPathfindingRepository implements PathfindingRepository {
  private intersections: Position[] = [];

  setIntersections(intersections: Position[]): void {
    this.intersections = intersections;
  }

  findPath(start: Position, target: Position): Position[] {
    const startIntersection = this.findNearestIntersection(start);
    const targetIntersection = this.findNearestIntersection(target);

    if (!startIntersection || !targetIntersection) {
      return [];
    }

    return this.aStarAlgorithm(startIntersection, targetIntersection);
  }

  getNextIntersection(currentX: number, currentY: number, direction: Direction): Position | null {
    let filteredIntersections: Position[];

    switch (direction) {
      case Direction.UP:
        filteredIntersections = this.intersections.filter(i => 
          i.x === currentX && i.y < currentY
        );
        break;
      case Direction.DOWN:
        filteredIntersections = this.intersections.filter(i => 
          i.x === currentX && i.y > currentY
        );
        break;
      case Direction.LEFT:
        filteredIntersections = this.intersections.filter(i => 
          i.y === currentY && i.x < currentX
        );
        break;
      case Direction.RIGHT:
        filteredIntersections = this.intersections.filter(i => 
          i.y === currentY && i.x > currentX
        );
        break;
      default:
        return null;
    }

    filteredIntersections.sort((a, b) => {
      if (direction === Direction.UP || direction === Direction.DOWN) {
        return direction === Direction.UP ? b.y - a.y : a.y - b.y;
      } else {
        return direction === Direction.LEFT ? b.x - a.x : a.x - b.x;
      }
    });

    return filteredIntersections.length > 0 ? filteredIntersections[0] : null;
  }

  isInGhostHouse(x: number, y: number): boolean {
    return (x <= 262 && x >= 208) && (y <= 290 && y > 240);
  }

  private findNearestIntersection(point: Position): Position | null {
    let nearest: Position | null = null;
    let minDist = Infinity;

    for (const intersection of this.intersections) {
      if (this.isInGhostHouse(intersection.x, intersection.y)) {
        continue;
      }

      const dist = point.manhattanDistanceTo(intersection);
      if (dist < minDist) {
        minDist = dist;
        nearest = intersection;
      }
    }

    return nearest;
  }

  private aStarAlgorithm(start: Position, target: Position): Position[] {
    const openList: Array<{ node: Position; g: number; f: number }> = [];
    const closedList = new Set<string>();
    const cameFrom = new Map<string, Position>();
    const gScore = new Map<string, number>();

    openList.push({ node: start, g: 0, f: this.heuristic(start, target) });
    gScore.set(this.positionToString(start), 0);

    while (openList.length > 0) {
      openList.sort((a, b) => a.f - b.f);
      const current = openList.shift()!.node;

      if (current.equals(target)) {
        return this.reconstructPath(cameFrom, current, start);
      }

      closedList.add(this.positionToString(current));

      for (const neighbor of this.getNeighbors(current)) {
        const neighborStr = this.positionToString(neighbor);
        
        if (this.isInGhostHouse(neighbor.x, neighbor.y) || closedList.has(neighborStr)) {
          continue;
        }

        const tentativeGScore = gScore.get(this.positionToString(current))! + 1;

        if (!gScore.has(neighborStr) || tentativeGScore < gScore.get(neighborStr)!) {
          gScore.set(neighborStr, tentativeGScore);
          const fScore = tentativeGScore + this.heuristic(neighbor, target);
          openList.push({ node: neighbor, g: tentativeGScore, f: fScore });
          cameFrom.set(neighborStr, current);
        }
      }
    }

    return [];
  }

  private getNeighbors(position: Position): Position[] {
    const neighbors: Position[] = [];
    const directions = [Direction.UP, Direction.DOWN, Direction.LEFT, Direction.RIGHT];

    for (const direction of directions) {
      const neighbor = this.getNextIntersection(position.x, position.y, direction);
      if (neighbor) {
        neighbors.push(neighbor);
      }
    }

    return neighbors;
  }

  private heuristic(node: Position, target: Position): number {
    return node.manhattanDistanceTo(target);
  }

  private reconstructPath(cameFrom: Map<string, Position>, current: Position, start: Position): Position[] {
    const path: Position[] = [];
    let currentNode = current;

    while (cameFrom.has(this.positionToString(currentNode))) {
      path.push(currentNode);
      currentNode = cameFrom.get(this.positionToString(currentNode))!;
    }

    path.push(start);
    return path.reverse();
  }

  private positionToString(position: Position): string {
    return `${position.x},${position.y}`;
  }
}
