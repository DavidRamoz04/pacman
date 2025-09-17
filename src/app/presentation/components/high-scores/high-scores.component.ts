import { Component, EventEmitter, Output, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { HighScoreService } from '../../../application/services/high-score.service';
import { HighScore } from '../../../domain/models/api.models';
import { ApiService } from '../../../infrastructure/services/api.service';

@Component({
  selector: 'app-high-scores',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './high-scores.component.html',
  styleUrls: ['./high-scores.component.scss']
})
export class HighScoresComponent implements OnInit, OnDestroy {
  @Output() backToMenu = new EventEmitter<void>();

  highScores: HighScore[] = [];
  isLoading = true;
  errorMessage = '';
  isConnectedToApi = true;
  
  private subscriptions: Subscription[] = [];

  constructor(
    private highScoreService: HighScoreService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.subscribeToHighScores();
    this.subscribeToConnectionStatus();
    this.loadHighScores();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private subscribeToHighScores(): void {
    const highScoresSub = this.highScoreService.highScores$.subscribe(scores => {
      this.highScores = scores;
      this.isLoading = false;
    });
    this.subscriptions.push(highScoresSub);
  }

  private subscribeToConnectionStatus(): void {
    const connectionSub = this.apiService.connectionStatus$.subscribe(isConnected => {
      this.isConnectedToApi = isConnected;
      if (!isConnected) {
        this.errorMessage = 'Sin conexión a la base de datos. No hay datos disponibles.';
      } else {
        this.errorMessage = '';
      }
    });
    this.subscriptions.push(connectionSub);
  }

  private loadHighScores(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    const loadSub = this.highScoreService.getHighScoresAsync().subscribe({
      next: (scores) => {
        this.highScores = scores;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ ERROR CRÍTICO: No se pudieron cargar high scores del backend:', error);
        this.errorMessage = 'Error crítico: No se pudieron cargar los puntajes del servidor.';
        this.isLoading = false;
        this.highScores = []; // No hay fallback - solo backend
      }
    });
    this.subscriptions.push(loadSub);
  }

  refreshScores(): void {
    this.loadHighScores();
  }

  isRecentScore(score: HighScore): boolean {
    const scoreDate = new Date(score.date);
    const now = new Date();
    const diffInHours = (now.getTime() - scoreDate.getTime()) / (1000 * 60 * 60);
    return diffInHours < 24; // Consider scores from last 24 hours as recent
  }

  clearScores(): void {
    if (confirm('¿Estás seguro de que quieres limpiar todos los puntajes?')) {
      this.isLoading = true;
      const clearSub = this.highScoreService.clearHighScores().subscribe({
        next: () => {
          this.loadHighScores();
        },
        error: (error) => {
          console.error('Error clearing scores:', error);
          this.errorMessage = 'Error limpiando los puntajes.';
          this.isLoading = false;
        }
      });
      this.subscriptions.push(clearSub);
    }
  }

  trackByScore(index: number, score: HighScore): number {
    return score.gameSessionId || score.rank;
  }

  goBack(): void {
    this.backToMenu.emit();
  }
}
