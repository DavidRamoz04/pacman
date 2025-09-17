import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { GAME_REPOSITORY_TOKEN, PATHFINDING_REPOSITORY_TOKEN } from './infrastructure/tokens/injection.tokens';
import { PhaserGameRepository } from './infrastructure/adapters/phaser-game.repository';
import { PhaserPathfindingRepository } from './infrastructure/adapters/phaser-pathfinding.repository';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    { provide: GAME_REPOSITORY_TOKEN, useClass: PhaserGameRepository },
    { provide: PATHFINDING_REPOSITORY_TOKEN, useClass: PhaserPathfindingRepository }
  ]
};
