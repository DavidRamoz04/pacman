import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { HighScoreService } from '../../application/services/high-score.service';

/**
 * Servicio específico para probar el registro de usuarios
 */
@Injectable({
  providedIn: 'root'
})
export class UserRegistrationTestService {

  constructor(
    private apiService: ApiService,
    private highScoreService: HighScoreService
  ) {}

  /**
   * Prueba completa del flujo de registro de usuario
   */
  async testUserRegistrationFlow(testUsername?: string): Promise<void> {
    const username = testUsername || `TestUser_${Date.now()}`;
    const testScore = Math.floor(Math.random() * 50000) + 1000;
    const testLevel = Math.floor(Math.random() * 10) + 1;

    console.log('🧪 INICIANDO PRUEBA DE REGISTRO DE USUARIO');
    console.log('================================================');
    console.log(`👤 Usuario de prueba: ${username}`);
    console.log(`🎯 Score de prueba: ${testScore}`);
    console.log(`🎮 Nivel de prueba: ${testLevel}`);
    console.log('================================================');

    try {
      // Paso 1: Verificar conectividad
      console.log('📡 Paso 1: Verificando conectividad con API...');
      const health = await this.apiService.checkApiHealth().toPromise();
      console.log('✅ API conectada:', health);

      // Paso 2: Intentar buscar el usuario (debería fallar si es nuevo)
      console.log(`🔍 Paso 2: Buscando usuario existente: ${username}`);
      try {
        const existingUser = await this.apiService.getPlayerByUsername(username).toPromise();
        console.log('⚠️ Usuario ya existe:', existingUser);
      } catch (error) {
        console.log('✅ Usuario no existe (esperado para usuario nuevo)');
      }

      // Paso 3: Crear o encontrar usuario
      console.log(`🆕 Paso 3: Creando/encontrando usuario: ${username}`);
      const player = await this.apiService.findOrCreatePlayer(username).toPromise();
      console.log('✅ Usuario obtenido/creado:', player);

      // Paso 4: Crear sesión de juego
      console.log(`🎮 Paso 4: Creando sesión de juego...`);
      const session = await this.apiService.recordGameSession(username, testScore, testLevel).toPromise();
      console.log('✅ Sesión creada:', session);

      // Paso 5: Verificar que aparezca en high scores
      console.log(`🏆 Paso 5: Verificando high scores...`);
      const highScores = await this.highScoreService.getHighScoresAsync().toPromise();
      console.log('📊 High scores actuales:', highScores);

      const userScore = highScores.find(s => s.playerName === username);
      if (userScore) {
        console.log('✅ Score encontrado en high scores:', userScore);
      } else {
        console.log('⚠️ Score no encontrado en high scores (puede estar fuera del top 10)');
      }

      // Paso 6: Verificar estadísticas del jugador
      console.log(`📈 Paso 6: Obteniendo estadísticas del jugador...`);
      try {
        const stats = await this.apiService.getPlayerStatisticsFromSessions(player.playerId).toPromise();
        console.log('✅ Estadísticas del jugador:', stats);
      } catch (error) {
        console.log('⚠️ Error obteniendo estadísticas:', error);
      }

      console.log('================================================');
      console.log('🎉 PRUEBA COMPLETADA EXITOSAMENTE');
      console.log('================================================');

    } catch (error) {
      console.log('================================================');
      console.error('❌ ERROR EN LA PRUEBA:', error);
      console.log('================================================');
      throw error;
    }
  }

  /**
   * Prueba específica de creación de usuario
   */
  async testUserCreation(username: string): Promise<void> {
    console.log(`🧪 Probando creación de usuario: ${username}`);
    
    try {
      // Intentar crear el usuario directamente
      const newUser = await this.apiService.createPlayer({ username }).toPromise();
      console.log('✅ Usuario creado exitosamente:', newUser);
      return newUser;
    } catch (error) {
      console.error('❌ Error creando usuario:', error);
      
      // Si el error es porque ya existe, intentar obtenerlo
      if (error.status === 400 || error.message.includes('already exists')) {
        console.log('ℹ️ Usuario ya existe, obteniendo datos...');
        try {
          const existingUser = await this.apiService.getPlayerByUsername(username).toPromise();
          console.log('✅ Usuario existente obtenido:', existingUser);
          return existingUser;
        } catch (getError) {
          console.error('❌ Error obteniendo usuario existente:', getError);
          throw getError;
        }
      }
      throw error;
    }
  }

  /**
   * Prueba de búsqueda de usuario
   */
  async testUserSearch(username: string): Promise<void> {
    console.log(`🔍 Probando búsqueda de usuario: ${username}`);
    
    try {
      const user = await this.apiService.getPlayerByUsername(username).toPromise();
      console.log('✅ Usuario encontrado:', user);
      return user;
    } catch (error) {
      if (error.status === 404) {
        console.log('ℹ️ Usuario no encontrado (404) - esto es normal para usuarios nuevos');
      } else {
        console.error('❌ Error buscando usuario:', error);
      }
      throw error;
    }
  }

  /**
   * Listar todos los usuarios (para debugging)
   */
  async listAllUsers(): Promise<void> {
    console.log('📋 Obteniendo lista de todos los usuarios...');
    
    try {
      const users = await this.apiService.getAllPlayers().toPromise();
      console.log(`✅ Total de usuarios: ${users.length}`);
      users.forEach((user, index) => {
        console.log(`${index + 1}. ID: ${user.playerId}, Username: ${user.username}, Creado: ${user.createdAt}`);
      });
    } catch (error) {
      console.error('❌ Error obteniendo lista de usuarios:', error);
    }
  }
}

// Función global para testing desde la consola
declare global {
  interface Window {
    testUserRegistration: (username?: string) => Promise<void>;
    testUserCreation: (username: string) => Promise<void>;
    testUserSearch: (username: string) => Promise<void>;
    listAllUsers: () => Promise<void>;
  }
}

// Exponer funciones globalmente para testing manual
if (typeof window !== 'undefined') {
  // Estas funciones se pueden llamar desde la consola del navegador
  window.testUserRegistration = async (username?: string) => {
    const service = new UserRegistrationTestService(
      // Nota: En un entorno real, estos servicios se inyectarían
      {} as ApiService,
      {} as HighScoreService
    );
    await service.testUserRegistrationFlow(username);
  };
}
