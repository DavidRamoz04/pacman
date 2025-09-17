import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HighScoreService } from '../../../application/services/high-score.service';

export interface HighScore {
  score: number;
  date: string;
  rank: number;
  playerName: string;
}

@Component({
  selector: 'app-high-scores',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './high-scores.component.html',
  styleUrls: ['./high-scores.component.scss']
})
export class HighScoresComponent implements OnInit {
  @Output() backToMenu = new EventEmitter<void>();

  highScores: HighScore[] = [];

  constructor(private highScoreService: HighScoreService) {}

  ngOnInit(): void {
    this.loadHighScores();
  }

  private loadHighScores(): void {
    this.highScores = this.highScoreService.getHighScores();
  }

  isRecentScore(score: HighScore): boolean {
    const scoreDate = new Date(score.date);
    const now = new Date();
    const diffInHours = (now.getTime() - scoreDate.getTime()) / (1000 * 60 * 60);
    return diffInHours < 24; // Consider scores from last 24 hours as recent
  }

  clearScores(): void {
    this.highScoreService.clearHighScores();
    this.loadHighScores();
  }

  trackByScore(index: number, score: HighScore): number {
    return score.rank;
  }

  goBack(): void {
    this.backToMenu.emit();
  }
}
