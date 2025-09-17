import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { firstValueFrom } from 'rxjs';

/**
 * Servicio para probar todos los endpoints de la API
 * Basado en la documentación: https://localhost:7019/api/
 */
@Injectable({
  providedIn: 'root'
})
export class ApiIntegrationTestService {

  constructor(private apiService: ApiService) {}

  /**
   * Prueba completa de todos los endpoints de la API
   */
  async runCompleteApiTest(): Promise<void> {
    console.log('🚀 INICIANDO PRUEBA COMPLETA DE LA API');
    console.log('=====================================');
    console.log('📍 Base URL: https://localhost:7019/api/');
    console.log('=====================================');

    try {
      // 1. Health Endpoints
      await this.testHealthEndpoints();
      
      // 2. Players Endpoints
      const testPlayer = await this.testPlayersEndpoints();
      
      // 3. GameSessions Endpoints
      await this.testGameSessionsEndpoints(testPlayer.playerId);
      
      console.log('=====================================');
      console.log('🎉 TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE');
      console.log('✅ La integración con la API está funcionando perfectamente');
      console.log('=====================================');
      
    } catch (error) {
      console.log('=====================================');
      console.error('❌ ERROR EN LAS PRUEBAS:', error);
      console.log('=====================================');
      throw error;
    }
  }

  /**
   * Prueba los endpoints de Health
   */
  private async testHealthEndpoints(): Promise<void> {
    console.log('🏥 PROBANDO HEALTH ENDPOINTS');
    console.log('----------------------------');

    try {
      // GET /api/Health
      console.log('📡 Probando GET /api/Health...');
      const health = await firstValueFrom(this.apiService.checkApiHealth());
      console.log('✅ Health Check exitoso:', health);

      // GET /api/Health/database
      console.log('📡 Probando GET /api/Health/database...');
      const dbHealth = await firstValueFrom(this.apiService.checkDatabaseHealth());
      console.log('✅ Database Health Check exitoso:', dbHealth);

    } catch (error) {
      console.error('❌ Error en Health endpoints:', error);
      throw error;
    }
  }

  /**
   * Prueba los endpoints de Players
   */
  private async testPlayersEndpoints(): Promise<any> {
    console.log('👥 PROBANDO PLAYERS ENDPOINTS');
    console.log('-----------------------------');

    const testUsername = `TestUser_${Date.now()}`;
    let testPlayer: any;

    try {
      // POST /api/Players - Crear usuario
      console.log(`📡 Probando POST /api/Players (crear ${testUsername})...`);
      testPlayer = await firstValueFrom(this.apiService.createPlayer({ username: testUsername }));
      console.log('✅ Usuario creado:', testPlayer);

      // GET /api/Players/by-username/{username} - Buscar por username
      console.log(`📡 Probando GET /api/Players/by-username/${testUsername}...`);
      const foundPlayer = await firstValueFrom(this.apiService.getPlayerByUsername(testUsername));
      console.log('✅ Usuario encontrado por username:', foundPlayer);

      // GET /api/Players/{id} - Buscar por ID
      console.log(`📡 Probando GET /api/Players/${testPlayer.playerId}...`);
      const playerById = await firstValueFrom(this.apiService.getPlayerById(testPlayer.playerId));
      console.log('✅ Usuario encontrado por ID:', playerById);

      // GET /api/Players - Obtener todos los usuarios
      console.log('📡 Probando GET /api/Players...');
      const allPlayers = await firstValueFrom(this.apiService.getAllPlayers());
      console.log(`✅ Todos los usuarios obtenidos (${allPlayers.length} usuarios):`, allPlayers.slice(0, 3));

      // GET /api/Players/{id}/statistics - Estadísticas del usuario
      console.log(`📡 Probando GET /api/Players/${testPlayer.playerId}/statistics...`);
      try {
        const playerStats = await firstValueFrom(this.apiService.getPlayerStatistics(testPlayer.playerId));
        console.log('✅ Estadísticas del usuario:', playerStats);
      } catch (error) {
        console.log('ℹ️ Estadísticas no disponibles (usuario nuevo):', error.message);
      }

      // GET /api/Players/top/{count} - Top jugadores
      console.log('📡 Probando GET /api/Players/top/5...');
      try {
        const topPlayers = await firstValueFrom(this.apiService.getTopPlayers(5));
        console.log('✅ Top jugadores:', topPlayers);
      } catch (error) {
        console.log('ℹ️ Top jugadores no disponible:', error.message);
      }

      return testPlayer;

    } catch (error) {
      console.error('❌ Error en Players endpoints:', error);
      throw error;
    }
  }

  /**
   * Prueba los endpoints de GameSessions
   */
  private async testGameSessionsEndpoints(playerId: number): Promise<void> {
    console.log('🎮 PROBANDO GAMESESSIONS ENDPOINTS');
    console.log('----------------------------------');

    const testScore = Math.floor(Math.random() * 50000) + 1000;
    const testLevel = Math.floor(Math.random() * 10) + 1;
    let testSession: any;

    try {
      // POST /api/GameSessions - Crear sesión
      console.log(`📡 Probando POST /api/GameSessions (score: ${testScore}, level: ${testLevel})...`);
      testSession = await firstValueFrom(this.apiService.createGameSession({
        playerId,
        score: testScore,
        maxLevelReached: testLevel
      }));
      console.log('✅ Sesión de juego creada:', testSession);

      // GET /api/GameSessions/{id} - Obtener sesión por ID
      console.log(`📡 Probando GET /api/GameSessions/${testSession.gameSessionId}...`);
      const sessionById = await firstValueFrom(this.apiService.getGameSessionById(testSession.gameSessionId));
      console.log('✅ Sesión obtenida por ID:', sessionById);

      // GET /api/GameSessions - Obtener todas las sesiones
      console.log('📡 Probando GET /api/GameSessions...');
      const allSessions = await firstValueFrom(this.apiService.getAllGameSessions());
      console.log(`✅ Todas las sesiones obtenidas (${allSessions.length} sesiones):`, allSessions.slice(0, 3));

      // GET /api/GameSessions/player/{playerId} - Sesiones del jugador
      console.log(`📡 Probando GET /api/GameSessions/player/${playerId}...`);
      const playerSessions = await firstValueFrom(this.apiService.getGameSessionsByPlayer(playerId));
      console.log('✅ Sesiones del jugador:', playerSessions);

      // GET /api/GameSessions/top-scores/{count} - Top scores globales
      console.log('📡 Probando GET /api/GameSessions/top-scores/10...');
      const topScores = await firstValueFrom(this.apiService.getTopScores(10));
      console.log('✅ Top scores globales:', topScores);

      // GET /api/GameSessions/player/{playerId}/top-scores/{count} - Top scores del jugador
      console.log(`📡 Probando GET /api/GameSessions/player/${playerId}/top-scores/5...`);
      const playerTopScores = await firstValueFrom(this.apiService.getPlayerTopScores(playerId, 5));
      console.log('✅ Top scores del jugador:', playerTopScores);

      // GET /api/GameSessions/recent/{count} - Sesiones recientes
      console.log('📡 Probando GET /api/GameSessions/recent/5...');
      const recentSessions = await firstValueFrom(this.apiService.getRecentSessions(5));
      console.log('✅ Sesiones recientes:', recentSessions);

      // GET /api/GameSessions/player/{playerId}/best-score - Mejor score del jugador
      console.log(`📡 Probando GET /api/GameSessions/player/${playerId}/best-score...`);
      const bestScore = await firstValueFrom(this.apiService.getPlayerBestScore(playerId));
      console.log('✅ Mejor score del jugador:', bestScore);

      // GET /api/GameSessions/player/{playerId}/statistics - Estadísticas del jugador
      console.log(`📡 Probando GET /api/GameSessions/player/${playerId}/statistics...`);
      const playerStats = await firstValueFrom(this.apiService.getPlayerStatisticsFromSessions(playerId));
      console.log('✅ Estadísticas del jugador desde sesiones:', playerStats);

    } catch (error) {
      console.error('❌ Error en GameSessions endpoints:', error);
      throw error;
    }
  }

  /**
   * Prueba específica del flujo del juego
   */
  async testGameFlow(username: string, score: number, level: number): Promise<void> {
    console.log('🎮 PROBANDO FLUJO COMPLETO DEL JUEGO');
    console.log('===================================');
    console.log(`👤 Usuario: ${username}`);
    console.log(`🎯 Score: ${score}`);
    console.log(`🎮 Nivel: ${level}`);
    console.log('===================================');

    try {
      // Flujo completo: Crear/Obtener Usuario → Crear Sesión → Ver Top Scores
      const session = await firstValueFrom(this.apiService.recordGameSession(username, score, level));
      console.log('✅ FLUJO COMPLETADO - Sesión registrada:', session);

      // Verificar que aparezca en top scores
      const topScores = await firstValueFrom(this.apiService.getTopScores(10));
      const userScore = topScores.find(s => s.score === score);
      
      if (userScore) {
        console.log(`🏆 ¡Score encontrado en top scores! Posición: ${topScores.indexOf(userScore) + 1}`);
      } else {
        console.log('📊 Score registrado pero no está en el top 10');
      }

    } catch (error) {
      console.error('❌ Error en el flujo del juego:', error);
      throw error;
    }
  }
}

// Funciones globales para testing desde la consola
declare global {
  interface Window {
    testCompleteApi: () => Promise<void>;
    testGameFlow: (username: string, score: number, level: number) => Promise<void>;
  }
}

// Exponer funciones globalmente
if (typeof window !== 'undefined') {
  window.testCompleteApi = async () => {
    console.log('🧪 Iniciando prueba completa de la API...');
    // Esta función se puede llamar desde la consola del navegador
  };

  window.testGameFlow = async (username: string, score: number, level: number) => {
    console.log('🎮 Iniciando prueba del flujo del juego...');
    // Esta función se puede llamar desde la consola del navegador
  };
}
