import { InjectionToken } from '@angular/core';
import { GameRepository } from '../../domain/repositories/game.repository';
import { PathfindingRepository } from '../../domain/repositories/pathfinding.repository';

export const GAME_REPOSITORY_TOKEN = new InjectionToken<GameRepository>('GameRepository');
export const PATHFINDING_REPOSITORY_TOKEN = new InjectionToken<PathfindingRepository>('PathfindingRepository');
