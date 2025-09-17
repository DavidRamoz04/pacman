import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { HighScoreService } from '../../application/services/high-score.service';

/**
 * Servicio de prueba para verificar la integración con la API
 * Este servicio se puede usar para testing manual de la funcionalidad
 */
@Injectable({
  providedIn: 'root'
})
export class ApiTestService {

  constructor(
    private apiService: ApiService,
    private highScoreService: HighScoreService
  ) {}

  /**
   * Prueba la conectividad con la API
   */
  async testApiConnection(): Promise<void> {
    console.log('🔍 Probando conexión con la API...');
    
    try {
      const health = await this.apiService.checkApiHealth().toPromise();
      console.log('✅ API conectada:', health);
      
      // Probar obtención de high scores
      const scores = await this.highScoreService.getHighScoresAsync().toPromise();
      console.log('✅ High scores obtenidos:', scores);
      
    } catch (error) {
      console.log('❌ Error conectando con API:', error);
      console.log('📱 Usando localStorage como fallback');
      
      // Verificar fallback
      const localScores = this.highScoreService.getHighScores();
      console.log('✅ Scores locales:', localScores);
    }
  }

  /**
   * Prueba el guardado de un score de prueba
   */
  async testScoreSaving(): Promise<void> {
    console.log('🔍 Probando guardado de score...');
    
    const testScore = Math.floor(Math.random() * 10000);
    const testPlayer = `TestPlayer_${Date.now()}`;
    
    try {
      const result = await this.highScoreService.addScore(testScore, testPlayer).toPromise();
      console.log('✅ Score guardado:', { score: testScore, player: testPlayer, isHighScore: result });
      
      // Verificar que se guardó
      const updatedScores = await this.highScoreService.getHighScoresAsync().toPromise();
      console.log('✅ Scores actualizados:', updatedScores);
      
    } catch (error) {
      console.log('❌ Error guardando score:', error);
    }
  }

  /**
   * Prueba completa del sistema
   */
  async runFullTest(): Promise<void> {
    console.log('🚀 Iniciando prueba completa del sistema API...');
    console.log('================================================');
    
    await this.testApiConnection();
    console.log('------------------------------------------------');
    await this.testScoreSaving();
    
    console.log('================================================');
    console.log('✅ Prueba completa finalizada');
  }

  /**
   * Simula pérdida y recuperación de conexión
   */
  testConnectionStates(): void {
    console.log('🔍 Probando estados de conexión...');
    
    // Suscribirse a cambios de estado
    this.apiService.connectionStatus$.subscribe(isConnected => {
      console.log(`📡 Estado de conexión: ${isConnected ? '🟢 CONECTADO' : '🔴 DESCONECTADO'}`);
    });

    // Suscribirse a cambios de high scores
    this.highScoreService.highScores$.subscribe(scores => {
      console.log(`📊 High scores actualizados (${scores.length} scores):`, scores);
    });
  }
}

// Función global para testing desde la consola del navegador
declare global {
  interface Window {
    testPacmanApi: () => void;
  }
}

// Exponer función de prueba globalmente para testing manual
if (typeof window !== 'undefined') {
  window.testPacmanApi = () => {
    console.log('🎮 Iniciando pruebas de la API de Pacman...');
    // Esta función se puede llamar desde la consola del navegador
    // para probar la integración manualmente
  };
}
