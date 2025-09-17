import { Component, OnInit, OnDestroy, ElementRef, ViewChild, EventEmitter, Output, Input, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as Phaser from 'phaser';
import { gameConfig } from '../../../infrastructure/phaser/game.config';
import { GameService } from '../../../application/services/game.service';
import { HighScoreService } from '../../../application/services/high-score.service';
import { PhaserGameRepository } from '../../../infrastructure/adapters/phaser-game.repository';
import { PhaserPathfindingRepository } from '../../../infrastructure/adapters/phaser-pathfinding.repository';
import { PacmanScene } from '../../../infrastructure/phaser/pacman.scene';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit, OnDestroy {
  @ViewChild('gameContainer', { static: true }) gameContainer!: ElementRef;
  @Input() playerName = 'Player 1';
  @Output() gameOver = new EventEmitter<void>();
  @Output() backToMenu = new EventEmitter<void>();

  private game!: Phaser.Game;
  score = 0;
  lives = 0;
  level = 0;
  isGameOver = false;

  // Method to update UI from Phaser scene
  updateGameStats(score: number, lives: number, level: number): void {
    this.score = score;
    this.lives = lives;
    this.level = level;
  }
  showNewHighScore = false;
  private gameWidth = 0;
  private gameHeight = 0;
  public isMobile = false;
  private currentDirection: string | null = null;

  constructor(
    private gameService: GameService,
    private highScoreService: HighScoreService,
    private gameRepository: PhaserGameRepository,
    private pathfindingRepository: PhaserPathfindingRepository
  ) {}

  ngOnInit(): void {
    this.detectMobile();
    this.calculateGameDimensions();
    this.initializeGame();
    this.subscribeToGameUpdates();
  }

  ngOnDestroy(): void {
    if (this.game) {
      this.game.destroy(true);
    }
  }

  private calculateGameDimensions(): void {
    // Calculate available space (subtract header height)
    const headerHeight = 60; // Approximate header height
    this.gameWidth = window.innerWidth;
    this.gameHeight = window.innerHeight - headerHeight;
  }

  private initializeGame(): void {
    const config = {
      ...gameConfig,
      width: this.gameWidth,
      height: this.gameHeight,
      parent: this.gameContainer.nativeElement,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: this.gameWidth,
        height: this.gameHeight
      }
    };

    this.game = new Phaser.Game(config);
    
    // Pass dependencies to the scene including reference to this component
    this.game.scene.start('PacmanScene', {
      gameService: this.gameService,
      gameRepository: this.gameRepository,
      pathfindingRepository: this.pathfindingRepository,
      gameComponent: this
    });
  }

  private subscribeToGameUpdates(): void {
    this.gameService.game$.subscribe(game => {
      if (game) {
        // Get values from Phaser scene
        const scene = this.game?.scene?.getScene('PacmanScene') as any;
        if (scene) {
          this.score = scene.score || 0;
          this.lives = scene.lives || 3;
          this.level = scene.level || 1;
        }
        
        const wasGameOver = this.isGameOver;
        this.isGameOver = game.isGameOver();
        
        // Check for new high score when game ends
        if (this.isGameOver && !wasGameOver) {
          this.checkForHighScore(this.score);
          this.gameOver.emit();
        }
      }
    });
  }

  // Public method that can be called from Phaser scene or internally
  checkForHighScore(finalScore: number): void {
    this.score = finalScore; // Update the score from Phaser
    if (this.highScoreService.isHighScore(this.score)) {
      this.showNewHighScore = true;
      this.highScoreService.addScore(this.score, this.playerName);
    }
  }

  restartGame(): void {
    this.isGameOver = false;
    this.showNewHighScore = false;
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    
    // Get the Pacman scene and restart it
    const scene = this.game.scene.getScene('PacmanScene') as any;
    if (scene && scene.restartGame) {
      scene.restartGame();
    }
    
    this.gameService.restartGame();
  }

  goBackToMenu(): void {
    this.backToMenu.emit();
  }

  private detectMobile(): void {
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                   window.innerWidth <= 768;
  }

  onTouchStart(direction: string): void {
    this.currentDirection = direction;
    this.simulateKeyPress(direction);
  }

  onTouchEnd(): void {
    this.currentDirection = null;
  }

  private simulateKeyPress(direction: string): void {
    if (!this.game) return;

    const keyMap: { [key: string]: string } = {
      'up': 'ArrowUp',
      'down': 'ArrowDown',
      'left': 'ArrowLeft',
      'right': 'ArrowRight'
    };

    const keyCode = keyMap[direction];
    if (keyCode) {
      // Create and dispatch a keyboard event to the game
      const event = new KeyboardEvent('keydown', {
        key: keyCode,
        code: keyCode,
        bubbles: true
      });
      document.dispatchEvent(event);
    }
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(): void {
    if (this.game) {
      this.calculateGameDimensions();
      this.game.scale.resize(this.gameWidth, this.gameHeight);
    }
  }
}
