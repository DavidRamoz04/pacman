import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ApiService } from '../../../infrastructure/services/api.service';
import { HighScoreService } from '../../../application/services/high-score.service';

@Component({
  selector: 'app-api-status',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="api-status-widget">
      <div class="status-header">
        <h3>Estado de la API</h3>
        <div class="connection-indicator">
          <span [class]="isConnected ? 'connected' : 'disconnected'">
            {{ isConnected ? '🟢 Conectado' : '🔴 Desconectado' }}
          </span>
        </div>
      </div>

      <div class="api-info" *ngIf="isConnected && healthStatus">
        <p><strong>Estado:</strong> {{ healthStatus.status }}</p>
        <p><strong>Base de Datos:</strong> {{ healthStatus.databaseStatus }}</p>
        <p><strong>Versión:</strong> {{ healthStatus.version || 'N/A' }}</p>
        <p *ngIf="healthStatus.statistics">
          <strong>Estadísticas:</strong> 
          {{ healthStatus.statistics.totalPlayers }} jugadores, 
          {{ healthStatus.statistics.totalGameSessions }} sesiones
        </p>
      </div>

      <div class="error-info" *ngIf="!isConnected && errorMessage">
        <p><strong>Error:</strong> {{ errorMessage }}</p>
      </div>

      <div class="actions">
        <button class="test-button" (click)="testConnection()" [disabled]="isLoading">
          {{ isLoading ? '⏳ Probando...' : '🔄 Probar Conexión' }}
        </button>
        
        <button class="refresh-button" (click)="refreshScores()" [disabled]="isLoading">
          📊 Actualizar Scores
        </button>
      </div>

      <div class="scores-summary" *ngIf="highScores.length > 0">
        <h4>Últimos High Scores ({{ highScores.length }})</h4>
        <div class="score-item" *ngFor="let score of highScores.slice(0, 3)">
          <span class="rank">#{{ score.rank }}</span>
          <span class="player">{{ score.playerName }}</span>
          <span class="score">{{ score.score | number }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .api-status-widget {
      background: var(--bg-secondary);
      border: 2px solid var(--pacman-yellow);
      border-radius: 8px;
      padding: 1rem;
      margin: 1rem 0;
      font-family: 'Courier New', monospace;
      color: var(--text-primary);
      max-width: 400px;
    }

    .status-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      border-bottom: 1px solid var(--pacman-yellow);
      padding-bottom: 0.5rem;
    }

    .status-header h3 {
      margin: 0;
      color: var(--pacman-yellow);
      font-size: 1.2rem;
    }

    .connection-indicator .connected {
      color: #4CAF50;
      font-weight: bold;
    }

    .connection-indicator .disconnected {
      color: #f44336;
      font-weight: bold;
    }

    .api-info, .error-info {
      background: rgba(255, 255, 255, 0.05);
      padding: 0.5rem;
      border-radius: 4px;
      margin: 0.5rem 0;
      font-size: 0.9rem;
    }

    .api-info p, .error-info p {
      margin: 0.25rem 0;
    }

    .actions {
      display: flex;
      gap: 0.5rem;
      margin: 1rem 0;
    }

    .test-button, .refresh-button {
      background: transparent;
      border: 1px solid var(--pacman-yellow);
      color: var(--pacman-yellow);
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      font-family: inherit;
      font-size: 0.8rem;
      transition: all 0.3s ease;
    }

    .test-button:hover, .refresh-button:hover {
      background: var(--pacman-yellow);
      color: var(--bg-primary);
    }

    .test-button:disabled, .refresh-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .scores-summary {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid rgba(255, 255, 0, 0.3);
    }

    .scores-summary h4 {
      margin: 0 0 0.5rem 0;
      color: var(--pacman-yellow);
      font-size: 1rem;
    }

    .score-item {
      display: flex;
      justify-content: space-between;
      padding: 0.25rem 0;
      font-size: 0.8rem;
    }

    .score-item .rank {
      color: #ffd700;
      font-weight: bold;
      min-width: 30px;
    }

    .score-item .player {
      flex: 1;
      text-align: center;
      color: var(--text-primary);
    }

    .score-item .score {
      color: #00ff00;
      font-weight: bold;
      min-width: 60px;
      text-align: right;
    }
  `]
})
export class ApiStatusComponent implements OnInit, OnDestroy {
  isConnected = false;
  isLoading = false;
  errorMessage = '';
  healthStatus: any = null;
  highScores: any[] = [];
  
  private subscriptions: Subscription[] = [];

  constructor(
    private apiService: ApiService,
    private highScoreService: HighScoreService
  ) {}

  ngOnInit(): void {
    this.subscribeToConnectionStatus();
    this.subscribeToHighScores();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private subscribeToConnectionStatus(): void {
    const connectionSub = this.apiService.connectionStatus$.subscribe(isConnected => {
      this.isConnected = isConnected;
      if (!isConnected) {
        this.healthStatus = null;
      }
    });
    this.subscriptions.push(connectionSub);
  }

  private subscribeToHighScores(): void {
    const scoresSub = this.highScoreService.highScores$.subscribe(scores => {
      this.highScores = scores;
    });
    this.subscriptions.push(scoresSub);
  }

  testConnection(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    const testSub = this.apiService.checkApiHealth().subscribe({
      next: (health) => {
        this.healthStatus = health;
        this.isLoading = false;
        console.log('✅ API Health Check exitoso:', health);
      },
      error: (error) => {
        this.errorMessage = error.message;
        this.isLoading = false;
        console.log('❌ API Health Check falló:', error);
      }
    });
    
    this.subscriptions.push(testSub);
  }

  refreshScores(): void {
    this.isLoading = true;
    
    const refreshSub = this.highScoreService.getHighScoresAsync().subscribe({
      next: (scores) => {
        this.highScores = scores;
        this.isLoading = false;
        console.log('✅ High scores actualizados:', scores);
      },
      error: (error) => {
        this.errorMessage = error.message;
        this.isLoading = false;
        console.log('❌ Error actualizando scores:', error);
      }
    });
    
    this.subscriptions.push(refreshSub);
  }
}
