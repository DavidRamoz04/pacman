import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { routes } from './app.routes';
import { GAME_REPOSITORY_TOKEN, PATHFINDING_REPOSITORY_TOKEN } from './infrastructure/tokens/injection.tokens';
import { PhaserGameRepository } from './infrastructure/adapters/phaser-game.repository';
import { PhaserPathfindingRepository } from './infrastructure/adapters/phaser-pathfinding.repository';
import { HttpErrorInterceptor } from './infrastructure/interceptors/http-error.interceptor';
import { API_CONFIG_TOKEN, getApiConfig } from './infrastructure/config/api.config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    provideHttpClient(),
    { provide: GAME_REPOSITORY_TOKEN, useClass: PhaserGameRepository },
    { provide: PATHFINDING_REPOSITORY_TOKEN, useClass: PhaserPathfindingRepository },
    { provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true },
    { provide: API_CONFIG_TOKEN, useFactory: getApiConfig }
  ]
};
