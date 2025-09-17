import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';
import { ApiService } from '../../infrastructure/services/api.service';
import { HighScore, GameSession, Player } from '../../domain/models/api.models';

@Injectable({
  providedIn: 'root'
})
export class HighScoreService {
  private readonly STORAGE_KEY = 'pacman-high-scores';
  private readonly MAX_SCORES = 10;
  
  // Subject para manejar el estado de los high scores
  private highScoresSubject = new BehaviorSubject<HighScore[]>([]);
  public highScores$ = this.highScoresSubject.asObservable();
  
  // Flag para determinar si usar API o localStorage
  private useApi = true;

  constructor(private apiService: ApiService) {
    // Suscribirse al estado de conexión de la API
    this.apiService.connectionStatus$.subscribe(isConnected => {
      this.useApi = isConnected;
      if (isConnected) {
        this.loadHighScoresFromApi();
      } else {
        this.loadHighScoresFromLocalStorage();
      }
    });
  }

  // ==================== MÉTODOS PÚBLICOS ====================

  /**
   * Obtiene los high scores (síncrono para compatibilidad)
   */
  getHighScores(): HighScore[] {
    return this.highScoresSubject.value;
  }

  /**
   * Obtiene high scores SOLO del backend (sin localStorage)
   */
  getHighScoresAsync(): Observable<HighScore[]> {
    console.log(`📊 Obteniendo high scores SOLO del backend`);
    console.log(`🚫 localStorage deshabilitado - solo se usa la base de datos`);
    
    return this.getHighScoresFromApi();
  }

  /**
   * Añade un nuevo score - SOLO BACKEND (sin localStorage)
   */
  addScore(score: number, playerName: string = 'Player 1', maxLevel: number = 1): Observable<boolean> {
    console.log(`🎯 Añadiendo score SOLO al backend:`, { score, playerName, maxLevel });
    console.log(`🚫 localStorage deshabilitado - solo se usa la base de datos`);
    
    return this.addScoreToApi(score, playerName, maxLevel);
  }

  /**
   * Verifica si un score es high score
   */
  isHighScore(score: number): boolean {
    const currentScores = this.getHighScores();
    if (currentScores.length < this.MAX_SCORES) return true;
    
    const lowestScore = currentScores[currentScores.length - 1];
    return score > lowestScore.score;
  }

  /**
   * Limpia todos los high scores
   */
  clearHighScores(): Observable<void> {
    if (this.useApi) {
      return this.clearHighScoresFromApi();
    } else {
      this.clearHighScoresFromLocalStorage();
      return of(void 0);
    }
  }

  /**
   * Obtiene el mejor score personal
   */
  getPersonalBest(playerName?: string): number {
    const scores = this.getHighScores();
    if (playerName) {
      const playerScores = scores.filter(s => s.playerName === playerName);
      return playerScores.length > 0 ? playerScores[0].score : 0;
    }
    return scores.length > 0 ? scores[0].score : 0;
  }

  /**
   * Obtiene el ranking de un score
   */
  getRank(score: number): number {
    const scores = this.getHighScores();
    const betterScores = scores.filter(s => s.score > score);
    return betterScores.length + 1;
  }

  // ==================== MÉTODOS DE API ====================

  private getHighScoresFromApi(): Observable<HighScore[]> {
    console.log(`📡 Obteniendo top ${this.MAX_SCORES} scores del backend...`);
    
    return this.apiService.getTopScores(this.MAX_SCORES).pipe(
      map(sessions => this.convertGameSessionsToHighScores(sessions)),
      tap(scores => {
        console.log(`✅ High scores obtenidos del backend (${scores.length} scores):`, scores);
        this.highScoresSubject.next(scores);
      }),
      catchError(error => {
        console.error('❌ ERROR CRÍTICO: No se pudieron obtener high scores del backend:', error);
        console.error('🚫 localStorage deshabilitado - no hay datos disponibles');
        
        // No usar localStorage - solo fallar
        this.highScoresSubject.next([]);
        return throwError(() => new Error(`No se pudieron obtener los high scores del backend: ${error.message}`));
      })
    );
  }

  private addScoreToApi(score: number, playerName: string, maxLevel: number = 1): Observable<boolean> {
    console.log(`💾 INICIANDO guardado de score SOLO en backend:`, { playerName, score, maxLevel });
    console.log(`📋 Flujo: 1. Crear/Obtener Usuario → 2. Crear Sesión → 3. Actualizar High Scores`);
    
    return this.apiService.recordGameSession(playerName, score, maxLevel).pipe(
      tap((session: any) => {
        console.log(`✅ FLUJO COMPLETADO: Sesión guardada en backend:`, session);
        console.log(`🎯 GameSessionId: ${session.gameSessionId}, PlayerId: ${session.playerId}`);
      }),
      switchMap(() => {
        console.log(`📊 Actualizando lista de high scores desde backend...`);
        return this.getHighScoresFromApi();
      }),
      map(scores => {
        console.log(`📈 High scores actualizados desde backend (${scores.length} scores):`, scores);
        const userScore = scores.find(s => s.playerName === playerName && s.score === score);
        const isNewHighScore = !!userScore;
        
        if (isNewHighScore) {
          console.log(`🏆 ¡NUEVO HIGH SCORE! Posición #${userScore.rank} para ${playerName}`);
        } else {
          console.log(`📊 Score registrado en backend pero no está en el top ${scores.length}`);
        }
        
        return isNewHighScore;
      }),
      catchError(error => {
        console.error('❌ ERROR CRÍTICO: No se pudo guardar en backend:', error);
        console.error('🚫 localStorage deshabilitado - el score se perdió');
        
        // No usar localStorage - solo fallar
        return throwError(() => new Error(`No se pudo guardar el score en el backend: ${error.message}`));
      })
    );
  }

  private clearHighScoresFromApi(): Observable<void> {
    // Nota: La API no tiene endpoint para limpiar todos los scores
    // Se podría implementar obteniendo todos los scores y eliminándolos uno por uno
    // Por ahora, solo limpiamos el cache local
    this.highScoresSubject.next([]);
    return of(void 0);
  }

  private loadHighScoresFromApi(): void {
    this.getHighScoresFromApi().subscribe();
  }

  // ==================== MÉTODOS DE LOCALSTORAGE ====================

  private getHighScoresFromLocalStorage(): HighScore[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const scores = JSON.parse(stored) as HighScore[];
      const sortedScores = scores.sort((a, b) => b.score - a.score).slice(0, this.MAX_SCORES);
      this.highScoresSubject.next(sortedScores);
      return sortedScores;
    } catch (error) {
      console.error('Error loading high scores from localStorage:', error);
      return [];
    }
  }

  private addScoreToLocalStorage(score: number, playerName: string): boolean {
    try {
      const currentScores = this.getHighScoresFromLocalStorage();
      const newScore: HighScore = {
        score,
        playerName,
        date: new Date().toLocaleDateString('es-ES', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }),
        rank: 0 // Will be calculated after sorting
      };

      currentScores.push(newScore);
      const sortedScores = currentScores
        .sort((a, b) => b.score - a.score)
        .slice(0, this.MAX_SCORES)
        .map((score, index) => ({ ...score, rank: index + 1 }));

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sortedScores));
      this.highScoresSubject.next(sortedScores);
      
      // Return true if the new score made it to the top 10
      return sortedScores.some(s => s.score === score && s.date === newScore.date);
    } catch (error) {
      console.error('Error saving high score to localStorage:', error);
      return false;
    }
  }

  private clearHighScoresFromLocalStorage(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      this.highScoresSubject.next([]);
    } catch (error) {
      console.error('Error clearing high scores from localStorage:', error);
    }
  }

  private loadHighScoresFromLocalStorage(): void {
    this.getHighScoresFromLocalStorage();
  }

  // ==================== MÉTODOS UTILITARIOS ====================

  private convertGameSessionsToHighScores(sessions: GameSession[]): HighScore[] {
    return sessions.map((session, index) => ({
      score: session.score,
      playerName: session.player?.username || `Player ${session.playerId}`,
      date: new Date(session.playedAt).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
      rank: index + 1,
      playerId: session.playerId,
      gameSessionId: session.gameSessionId
    }));
  }
}
