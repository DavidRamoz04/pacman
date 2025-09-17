import { Injectable, Inject, Optional } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, retry, map, switchMap, tap } from 'rxjs/operators';
import { 
  Player, 
  GameSession, 
  PlayerStatistics, 
  CreatePlayerRequest, 
  CreateGameSessionRequest,
  HealthStatus,
  DatabaseHealth,
  ProblemDetails,
  ApiConfig 
} from '../../domain/models/api.models';
import { API_CONFIG_TOKEN, DEFAULT_API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl: string;
  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  // Subject para manejar el estado de conexión
  private connectionStatus = new BehaviorSubject<boolean>(true);
  public connectionStatus$ = this.connectionStatus.asObservable();

  constructor(
    private http: HttpClient,
    @Optional() @Inject(API_CONFIG_TOKEN) private apiConfig: ApiConfig
  ) {
    this.baseUrl = (this.apiConfig || DEFAULT_API_CONFIG).baseUrl;
    this.checkApiHealth();
  }

  // ==================== HEALTH ENDPOINTS ====================
  
  checkApiHealth(): Observable<HealthStatus> {
    return this.http.get<HealthStatus>(`${this.baseUrl}/Health`)
      .pipe(
        catchError(error => {
          this.connectionStatus.next(false);
          return this.handleError(error);
        }),
        map(response => {
          this.connectionStatus.next(true);
          return response;
        })
      );
  }

  checkDatabaseHealth(): Observable<DatabaseHealth> {
    return this.http.get<DatabaseHealth>(`${this.baseUrl}/Health/database`)
      .pipe(catchError(this.handleError));
  }

  // ==================== PLAYERS ENDPOINTS ====================
  
  getAllPlayers(): Observable<Player[]> {
    return this.http.get<Player[]>(`${this.baseUrl}/Players`)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  getPlayerById(id: number): Observable<Player> {
    return this.http.get<Player>(`${this.baseUrl}/Players/${id}`)
      .pipe(catchError(this.handleError));
  }

  getPlayerByUsername(username: string): Observable<Player> {
    return this.http.get<Player>(`${this.baseUrl}/Players/by-username/${encodeURIComponent(username)}`)
      .pipe(catchError(this.handleError));
  }

  createPlayer(request: CreatePlayerRequest): Observable<Player> {
    return this.http.post<Player>(`${this.baseUrl}/Players`, request, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  updatePlayer(id: number, player: Player): Observable<Player> {
    return this.http.put<Player>(`${this.baseUrl}/Players/${id}`, player, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  deletePlayer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/Players/${id}`)
      .pipe(catchError(this.handleError));
  }

  getPlayerStatistics(id: number): Observable<PlayerStatistics> {
    return this.http.get<PlayerStatistics>(`${this.baseUrl}/Players/${id}/statistics`)
      .pipe(catchError(this.handleError));
  }

  getTopPlayers(count: number = 10): Observable<Player[]> {
    return this.http.get<Player[]>(`${this.baseUrl}/Players/top/${count}`)
      .pipe(catchError(this.handleError));
  }

  // ==================== GAME SESSIONS ENDPOINTS ====================
  
  getAllGameSessions(): Observable<GameSession[]> {
    return this.http.get<GameSession[]>(`${this.baseUrl}/GameSessions`)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  getGameSessionById(id: number): Observable<GameSession> {
    return this.http.get<GameSession>(`${this.baseUrl}/GameSessions/${id}`)
      .pipe(catchError(this.handleError));
  }

  createGameSession(request: CreateGameSessionRequest): Observable<GameSession> {
    return this.http.post<GameSession>(`${this.baseUrl}/GameSessions`, request, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  updateGameSession(id: number, session: GameSession): Observable<GameSession> {
    return this.http.put<GameSession>(`${this.baseUrl}/GameSessions/${id}`, session, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  deleteGameSession(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/GameSessions/${id}`)
      .pipe(catchError(this.handleError));
  }

  getGameSessionsByPlayer(playerId: number): Observable<GameSession[]> {
    return this.http.get<GameSession[]>(`${this.baseUrl}/GameSessions/player/${playerId}`)
      .pipe(catchError(this.handleError));
  }

  getTopScores(count: number = 10): Observable<GameSession[]> {
    return this.http.get<GameSession[]>(`${this.baseUrl}/GameSessions/top-scores/${count}`)
      .pipe(catchError(this.handleError));
  }

  getPlayerTopScores(playerId: number, count: number = 10): Observable<GameSession[]> {
    return this.http.get<GameSession[]>(`${this.baseUrl}/GameSessions/player/${playerId}/top-scores/${count}`)
      .pipe(catchError(this.handleError));
  }

  getRecentSessions(count: number = 20): Observable<GameSession[]> {
    return this.http.get<GameSession[]>(`${this.baseUrl}/GameSessions/recent/${count}`)
      .pipe(catchError(this.handleError));
  }

  getPlayerBestScore(playerId: number): Observable<GameSession> {
    return this.http.get<GameSession>(`${this.baseUrl}/GameSessions/player/${playerId}/best-score`)
      .pipe(catchError(this.handleError));
  }

  getPlayerStatisticsFromSessions(playerId: number): Observable<PlayerStatistics> {
    return this.http.get<PlayerStatistics>(`${this.baseUrl}/GameSessions/player/${playerId}/statistics`)
      .pipe(catchError(this.handleError));
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Busca o crea un jugador por nombre de usuario
   * Flujo: 1. Buscar por username → 2. Si no existe (404), crear nuevo → 3. Retornar player
   */
  findOrCreatePlayer(username: string): Observable<Player> {
    console.log(`🔍 PASO 1: Buscando jugador existente: ${username}`);
    
    return this.getPlayerByUsername(username).pipe(
      tap((player: Player) => {
        console.log(`✅ PASO 1 COMPLETADO: Jugador encontrado:`, player);
        console.log(`👤 ID: ${player.playerId}, Username: ${player.username}`);
      }),
      catchError((searchError: any) => {
        console.log(`ℹ️ PASO 1: Jugador no encontrado (${searchError.status})`);
        
        if (searchError.status === 404 || searchError.message.includes('404') || searchError.message.includes('Not Found')) {
          console.log(`🆕 PASO 2: Creando nuevo jugador: ${username}`);
          
          const createRequest: CreatePlayerRequest = { username };
          console.log(`📝 Request para crear jugador:`, createRequest);
          
          return this.createPlayer(createRequest).pipe(
            tap((newPlayer: Player) => {
              console.log(`✅ PASO 2 COMPLETADO: Jugador creado exitosamente:`, newPlayer);
              console.log(`👤 Nuevo ID: ${newPlayer.playerId}, Username: ${newPlayer.username}`);
            }),
            catchError((createError: any) => {
              console.error(`❌ PASO 2 FALLÓ: Error creando jugador:`, createError);
              
              // Si el error es porque ya existe, intentar buscarlo de nuevo
              if (createError.status === 400 && createError.error?.title?.includes('already exists')) {
                console.log(`🔄 Usuario ya existe, reintentando búsqueda...`);
                return this.getPlayerByUsername(username);
              }
              
              return throwError(() => createError);
            })
          );
        }
        
        console.error(`❌ PASO 1 FALLÓ: Error inesperado buscando jugador:`, searchError);
        return throwError(() => searchError);
      })
    );
  }

  /**
   * Registra una nueva sesión de juego completa
   * Flujo: 1. Crear/Obtener Usuario → 2. Crear Sesión de Juego → 3. Guardar Score
   */
  recordGameSession(username: string, score: number, maxLevel: number = 1): Observable<GameSession> {
    console.log(`🎮 INICIANDO registro completo de sesión:`, { username, score, maxLevel });
    
    return this.findOrCreatePlayer(username).pipe(
      tap((player: Player) => console.log(`👤 Usuario obtenido/creado:`, player)),
      switchMap((player: Player) => {
        // Crear la sesión de juego
        const sessionRequest: CreateGameSessionRequest = {
          playerId: player.playerId,
          score,
          maxLevelReached: maxLevel
        };
        console.log(`📝 Creando sesión de juego:`, sessionRequest);
        
        return this.createGameSession(sessionRequest).pipe(
          tap((session: GameSession) => {
            console.log(`✅ Sesión de juego creada exitosamente:`, session);
            console.log(`🏆 Score ${score} registrado para ${username} (Nivel ${maxLevel})`);
          }),
          catchError((sessionError: any) => {
            console.error(`❌ Error creando sesión de juego:`, sessionError);
            console.error(`📋 Request que falló:`, sessionRequest);
            return throwError(() => sessionError);
          })
        );
      }),
      catchError((error: any) => {
        console.error(`❌ Error en el flujo completo de registro:`, error);
        return throwError(() => error);
      })
    );
  }

  // ==================== ERROR HANDLING ====================
  
  private handleError = (error: HttpErrorResponse) => {
    let errorMessage = 'Ha ocurrido un error desconocido';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      if (error.status === 0) {
        errorMessage = 'No se puede conectar con el servidor. Verifique su conexión.';
        this.connectionStatus.next(false);
      } else if (error.error && error.error.title) {
        errorMessage = error.error.title;
      } else {
        errorMessage = `Error ${error.status}: ${error.message}`;
      }
    }
    
    console.error('API Error:', error);
    return throwError(() => new Error(errorMessage));
  };
}
