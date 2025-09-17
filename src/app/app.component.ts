import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameComponent } from './presentation/components/game/game.component';
import { MenuComponent } from './presentation/components/menu/menu.component';
import { HighScoresComponent } from './presentation/components/high-scores/high-scores.component';
import { InstructionsComponent } from './presentation/components/instructions/instructions.component';
import { PlayerNameComponent } from './presentation/components/player-name/player-name.component';

export type AppState = 'menu' | 'player-name' | 'game' | 'high-scores' | 'instructions';

@Component({
  selector: 'app-root',
  imports: [CommonModule, GameComponent, MenuComponent, HighScoresComponent, InstructionsComponent, PlayerNameComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Pacman Angular';
  currentState: AppState = 'menu';
  playerName = 'Player 1';

  onNewGame(): void {
    this.currentState = 'player-name';
  }

  onPlayerNameSet(name: string): void {
    this.playerName = name;
    this.currentState = 'game';
  }

  onShowHighScores(): void {
    this.currentState = 'high-scores';
  }

  onShowInstructions(): void {
    this.currentState = 'instructions';
  }

  onBackToMenu(): void {
    this.currentState = 'menu';
  }

  onGameOver(): void {
    // Return to menu after game over
    setTimeout(() => {
      this.currentState = 'menu';
    }, 3000); // Give time to see game over screen
  }
}
