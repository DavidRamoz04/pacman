import { Injectable } from '@angular/core';

export interface HighScore {
  score: number;
  date: string;
  rank: number;
  playerName: string;
}

@Injectable({
  providedIn: 'root'
})
export class HighScoreService {
  private readonly STORAGE_KEY = 'pacman-high-scores';
  private readonly MAX_SCORES = 10;

  constructor() {}

  getHighScores(): HighScore[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const scores = JSON.parse(stored) as HighScore[];
      return scores.sort((a, b) => b.score - a.score).slice(0, this.MAX_SCORES);
    } catch (error) {
      console.error('Error loading high scores:', error);
      return [];
    }
  }

  addScore(score: number, playerName: string = 'Player 1'): boolean {
    try {
      const currentScores = this.getHighScores();
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
      
      // Return true if the new score made it to the top 10
      return sortedScores.some(s => s.score === score && s.date === newScore.date);
    } catch (error) {
      console.error('Error saving high score:', error);
      return false;
    }
  }

  isHighScore(score: number): boolean {
    const currentScores = this.getHighScores();
    if (currentScores.length < this.MAX_SCORES) return true;
    
    const lowestScore = currentScores[currentScores.length - 1];
    return score > lowestScore.score;
  }

  clearHighScores(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing high scores:', error);
    }
  }

  getPersonalBest(): number {
    const scores = this.getHighScores();
    return scores.length > 0 ? scores[0].score : 0;
  }

  getRank(score: number): number {
    const scores = this.getHighScores();
    const betterScores = scores.filter(s => s.score > score);
    return betterScores.length + 1;
  }
}
