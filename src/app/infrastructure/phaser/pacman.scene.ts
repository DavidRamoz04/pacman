import * as Phaser from 'phaser';
import { GameService } from '../../application/services/game.service';
import { PhaserGameRepository } from '../adapters/phaser-game.repository';
import { PhaserPathfindingRepository } from '../adapters/phaser-pathfinding.repository';

export class PacmanScene extends Phaser.Scene {
  private gameService!: any;
  private gameRepository!: any;
  private pathfindingRepository!: any;
  private gameComponent!: any;
  
  // Game objects
  private pacman!: { x: number, y: number, direction: string };
  private ghosts: { x: number, y: number, direction: string, color: string }[] = [];
  private dotsGroup!: Phaser.Physics.Arcade.Group;
  private powerPillsGroup!: Phaser.Physics.Arcade.Group;
  private wallsGroup!: Phaser.Physics.Arcade.StaticGroup;
  
  // Visual objects
  private pacmanSprite!: Phaser.Physics.Arcade.Sprite;
  private ghostSprites: Phaser.Physics.Arcade.Sprite[] = [];
  
  // Input
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
  };
  
  // UI elements
  private scoreText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  
  // Game state
  private score = 0;
  private lives = 3;
  private gameOver = false;
  private isGameWon = false;
  private powerMode = false;
  private powerModeTimer = 0;
  private totalDots = 0;
  private dotsEaten = 0;
  private level = 1;
  private maxLevel = 5;
  
  // Multiple maze layouts for different levels
  private mazes: number[][][] = [
    // Level 1 - Original maze
    [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
      [1,3,1,1,1,2,1,1,1,1,1,1,1,2,1,1,1,3,1],
      [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
      [1,2,1,1,1,2,1,2,1,1,1,2,1,2,1,1,1,2,1],
      [1,2,2,2,2,2,1,2,2,1,2,2,1,2,2,2,2,2,1],
      [1,1,1,1,1,2,1,1,4,1,4,1,1,2,1,1,1,1,1],
      [4,4,4,4,1,2,1,4,4,4,4,4,1,2,1,4,4,4,4],
      [1,1,1,1,1,2,1,4,1,0,1,4,1,2,1,1,1,1,1],
      [2,2,2,2,2,2,4,4,1,4,1,4,4,2,2,2,2,2,2],
      [1,1,1,1,1,2,1,4,1,1,1,4,1,2,1,1,1,1,1],
      [4,4,4,4,1,2,1,4,4,4,4,4,1,2,1,4,4,4,4],
      [1,1,1,1,1,2,1,1,4,1,4,1,1,2,1,1,1,1,1],
      [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
      [1,2,1,1,1,2,1,1,1,1,1,1,1,2,1,1,1,2,1],
      [1,3,2,2,1,2,2,2,2,2,2,2,2,2,1,2,2,3,1],
      [1,1,1,2,1,2,1,2,1,1,1,2,1,2,1,2,1,1,1],
      [1,2,2,2,2,2,1,2,2,1,2,2,1,2,2,2,2,2,1],
      [1,2,1,1,1,1,1,1,2,1,2,1,1,1,1,1,1,2,1],
      [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ],
    // Level 2 - Modified maze
    [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
      [1,2,1,1,2,1,1,2,1,1,1,2,1,1,2,1,1,2,1],
      [1,3,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,3,1],
      [1,2,2,1,1,1,2,1,2,1,2,1,2,1,1,1,2,2,1],
      [1,2,2,2,2,2,2,1,2,1,2,1,2,2,2,2,2,2,1],
      [1,1,1,2,1,2,2,1,4,1,4,1,2,2,1,2,1,1,1],
      [4,4,4,2,1,2,1,4,4,4,4,4,1,2,1,2,4,4,4],
      [1,1,1,2,1,2,1,4,1,0,1,4,1,2,1,2,1,1,1],
      [2,2,2,2,2,2,4,4,1,4,1,4,4,2,2,2,2,2,2],
      [1,1,1,2,1,2,1,4,1,1,1,4,1,2,1,2,1,1,1],
      [4,4,4,2,1,2,1,4,4,4,4,4,1,2,1,2,4,4,4],
      [1,1,1,2,1,2,2,1,4,1,4,1,2,2,1,2,1,1,1],
      [1,2,2,2,2,2,2,1,2,1,2,1,2,2,2,2,2,2,1],
      [1,2,2,1,1,1,2,1,2,1,2,1,2,1,1,1,2,2,1],
      [1,3,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,3,1],
      [1,2,1,1,2,1,1,2,1,1,1,2,1,1,2,1,1,2,1],
      [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
      [1,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,1],
      [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ],
    // Level 3 - Another variation
    [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
      [1,2,1,2,1,2,1,1,1,1,1,1,1,2,1,2,1,2,1],
      [1,3,1,2,1,2,2,2,2,2,2,2,2,2,1,2,1,3,1],
      [1,2,1,2,1,1,1,2,1,1,1,2,1,1,1,2,1,2,1],
      [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
      [1,2,1,1,1,2,1,1,4,1,4,1,1,2,1,1,1,2,1],
      [1,2,2,2,2,2,1,4,4,4,4,4,1,2,2,2,2,2,1],
      [1,1,1,1,1,2,1,4,1,0,1,4,1,2,1,1,1,1,1],
      [2,2,2,2,2,2,4,4,1,4,1,4,4,2,2,2,2,2,2],
      [1,1,1,1,1,2,1,4,1,1,1,4,1,2,1,1,1,1,1],
      [1,2,2,2,2,2,1,4,4,4,4,4,1,2,2,2,2,2,1],
      [1,2,1,1,1,2,1,1,4,1,4,1,1,2,1,1,1,2,1],
      [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
      [1,2,1,2,1,1,1,2,1,1,1,2,1,1,1,2,1,2,1],
      [1,3,1,2,1,2,2,2,2,2,2,2,2,2,1,2,1,3,1],
      [1,2,1,2,1,2,1,1,1,1,1,1,1,2,1,2,1,2,1],
      [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
      [1,2,1,1,1,1,1,1,2,1,2,1,1,1,1,1,1,2,1],
      [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ]
  ];
  
  private maze: number[][] = [];
  
  // Constants
  private readonly CELL_SIZE = 24;
  private readonly PACMAN_SPEED = 100;
  private readonly GHOST_SPEED = 80;
  private readonly POWER_MODE_DURATION = 10000;
  private readonly DOT_POINTS = 10;
  private readonly POWER_PILL_POINTS = 50;
  private readonly GHOST_POINTS = 200;
  
  // Power Pills Configuration
  private readonly POWER_PILL_PERCENTAGE = 0.02; // 2% of dots become power pills (adjust this value to change distribution)
  private readonly MIN_POWER_PILLS = 4; // Minimum number of power pills per level

  constructor() {
    super({ key: 'PacmanScene' });
  }

  init(data: any): void {
    this.gameService = data.gameService;
    this.gameRepository = data.gameRepository;
    this.pathfindingRepository = data.pathfindingRepository;
    this.gameComponent = data.gameComponent;
  }

  preload(): void {
    // Create simple geometric textures for game objects
    this.createTextures();
  }

  private createTextures(): void {
    // Create Pacman texture (yellow circle)
    const pacmanGraphics = this.add.graphics();
    pacmanGraphics.fillStyle(0xffff00);
    pacmanGraphics.fillCircle(12, 12, 12);
    pacmanGraphics.generateTexture('pacman', 24, 24);
    pacmanGraphics.destroy();

    // Create ghost textures
    const ghostColors = [
      { key: 'ghost-red-0', color: 0xff0000 },
      { key: 'ghost-pink-0', color: 0xffb8ff },
      { key: 'ghost-blue-0', color: 0x00ffff },
      { key: 'ghost-orange-0', color: 0xffb852 }
    ];

    ghostColors.forEach(ghost => {
      const ghostGraphics = this.add.graphics();
      ghostGraphics.fillStyle(ghost.color);
      // Create a simple rounded rectangle for ghost body
      ghostGraphics.fillRoundedRect(2, 2, 20, 20, 10);
      ghostGraphics.generateTexture(ghost.key, 24, 24);
      ghostGraphics.destroy();
    });

    // Create dot texture (small white circle)
    const dotGraphics = this.add.graphics();
    dotGraphics.fillStyle(0xffffff);
    dotGraphics.fillCircle(3, 3, 3);
    dotGraphics.generateTexture('dot', 6, 6);
    dotGraphics.destroy();

    // Create power pill texture (larger yellow circle)
    const powerPillGraphics = this.add.graphics();
    powerPillGraphics.fillStyle(0xffff00); // Yellow color like Pacman
    powerPillGraphics.fillCircle(6, 6, 6);
    powerPillGraphics.generateTexture('power-pill', 12, 12);
    powerPillGraphics.destroy();
  }

  create(): void {
    this.initializeMaze();
    this.createMap();
    this.createPacman();
    this.createGhosts();
    this.createCollectibles();
    this.createControls();
    this.createUI();
    
    // Set up collisions
    this.physics.add.collider(this.pacmanSprite, this.wallsGroup);
    this.physics.add.collider(this.ghostSprites, this.wallsGroup);
    this.physics.add.overlap(this.pacmanSprite, this.dotsGroup, this.eatDot, undefined, this);
    this.physics.add.overlap(this.pacmanSprite, this.powerPillsGroup, this.eatPowerPill, undefined, this);
    this.physics.add.overlap(this.pacmanSprite, this.ghostSprites, this.hitGhost, undefined, this);
  }

  private initializeMaze(): void {
    // Select maze based on current level (cycle through available mazes)
    const mazeIndex = Math.min(this.level - 1, this.mazes.length - 1);
    this.maze = this.mazes[mazeIndex].map(row => [...row]); // Deep copy
  }

  private createMap(): void {
    this.wallsGroup = this.physics.add.staticGroup();
    
    // Create maze based on the maze array
    for (let row = 0; row < this.maze.length; row++) {
      for (let col = 0; col < this.maze[row].length; col++) {
        const x = col * this.CELL_SIZE + this.CELL_SIZE / 2;
        const y = row * this.CELL_SIZE + this.CELL_SIZE / 2;
        
        if (this.maze[row][col] === 1) {
          // Create blue wall with smaller collision box for better movement
          const wall = this.add.rectangle(x, y, this.CELL_SIZE, this.CELL_SIZE, 0x0000ff);
          wall.setStrokeStyle(2, 0x4444ff);
          this.physics.add.existing(wall, true);
          
          // Make collision box slightly smaller than visual for smoother movement
          const wallBody = wall.body as Phaser.Physics.Arcade.StaticBody;
          wallBody.setSize(this.CELL_SIZE - 4, this.CELL_SIZE - 4);
          
          this.wallsGroup.add(wall);
        }
      }
    }
  }

  private createPacman(): void {
    // Start Pac-Man in the bottom center position
    this.pacmanSprite = this.physics.add.sprite(9 * this.CELL_SIZE + this.CELL_SIZE/2, 15 * this.CELL_SIZE + this.CELL_SIZE/2, "pacman");
    this.pacmanSprite.setDisplaySize(this.CELL_SIZE, this.CELL_SIZE);
    this.pacmanSprite.body!.setSize(this.CELL_SIZE - 2, this.CELL_SIZE - 2);
    this.pacmanSprite.body!.setOffset(1, 1);
  }

  private createGhosts(): void {
    const ghostConfigs = [
      { x: 9 * this.CELL_SIZE + this.CELL_SIZE/2, y: 9 * this.CELL_SIZE + this.CELL_SIZE/2, texture: "ghost-red-0", color: 0xff0000, name: 'blinky' },
      { x: 8 * this.CELL_SIZE + this.CELL_SIZE/2, y: 9 * this.CELL_SIZE + this.CELL_SIZE/2, texture: "ghost-pink-0", color: 0xffb8ff, name: 'pinky' },
      { x: 10 * this.CELL_SIZE + this.CELL_SIZE/2, y: 9 * this.CELL_SIZE + this.CELL_SIZE/2, texture: "ghost-blue-0", color: 0x00ffff, name: 'inky' },
      { x: 9 * this.CELL_SIZE + this.CELL_SIZE/2, y: 8 * this.CELL_SIZE + this.CELL_SIZE/2, texture: "ghost-orange-0", color: 0xffb852, name: 'clyde' }
    ];

    ghostConfigs.forEach((config, index) => {
      const ghost = this.physics.add.sprite(config.x, config.y, config.texture);
      ghost.setDisplaySize(this.CELL_SIZE, this.CELL_SIZE);
      ghost.body!.setSize(this.CELL_SIZE - 2, this.CELL_SIZE - 2);
      ghost.body!.setOffset(1, 1);
      ghost.setTint(config.color);
      
      // Enhanced ghost AI data
      ghost.setData('direction', 0); // Start moving up
      ghost.setData('moveTimer', 0);
      ghost.setData('speed', this.GHOST_SPEED);
      ghost.setData('mode', 'scatter'); // scatter, chase, frightened
      ghost.setData('name', config.name);
      ghost.setData('homeCorner', this.getGhostHomeCorner(config.name));
      
      this.ghostSprites.push(ghost);
    });
  }

  private createCollectibles(): void {
    this.dotsGroup = this.physics.add.group();
    this.powerPillsGroup = this.physics.add.group();
    
    // Collect all dot positions first
    const dotPositions: {x: number, y: number, row: number, col: number}[] = [];
    
    for (let row = 0; row < this.maze.length; row++) {
      for (let col = 0; col < this.maze[row].length; col++) {
        if (this.maze[row][col] === 2) {
          dotPositions.push({
            x: col * this.CELL_SIZE,
            y: row * this.CELL_SIZE,
            row: row,
            col: col
          });
        }
      }
    }
    
    // Determine which dots should be power pills
    const powerPillPositions = this.getPowerPillPositions(dotPositions);
    
    // Create dots and power pills based on maze layout
    for (let row = 0; row < this.maze.length; row++) {
      for (let col = 0; col < this.maze[row].length; col++) {
        const x = col * this.CELL_SIZE;
        const y = row * this.CELL_SIZE;
        
        if (this.maze[row][col] === 2) {
          // Check if this position should be a power pill
          const isPowerPill = powerPillPositions.some(pos => pos.row === row && pos.col === col);
          
          if (isPowerPill) {
            // Create large power pill using texture
            const powerPill = this.physics.add.sprite(x + this.CELL_SIZE/2, y + this.CELL_SIZE/2, 'power-pill');
            powerPill.body!.setSize(8, 8);
            
            // Add blinking animation
            this.tweens.add({
              targets: powerPill,
              alpha: 0.3,
              duration: 500,
              yoyo: true,
              repeat: -1
            });
            
            this.powerPillsGroup.add(powerPill);
          } else {
            // Create small dot using texture
            const dot = this.physics.add.sprite(x + this.CELL_SIZE/2, y + this.CELL_SIZE/2, 'dot');
            dot.body!.setSize(4, 4);
            this.dotsGroup.add(dot);
            this.totalDots++;
          }
        } else if (this.maze[row][col] === 3) {
          // Keep existing power pills from maze design
          const powerPill = this.physics.add.sprite(x + this.CELL_SIZE/2, y + this.CELL_SIZE/2, 'power-pill');
          powerPill.body!.setSize(8, 8);
          
          // Add blinking animation
          this.tweens.add({
            targets: powerPill,
            alpha: 0.3,
            duration: 500,
            yoyo: true,
            repeat: -1
          });
          
          this.powerPillsGroup.add(powerPill);
        }
      }
    }
  }

  private createControls(): void {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      up: this.input.keyboard!.addKey('W'),
      down: this.input.keyboard!.addKey('S'),
      left: this.input.keyboard!.addKey('A'),
      right: this.input.keyboard!.addKey('D')
    };
  }


  private createUI(): void {
    // Create hidden text elements (not visible but needed for game logic)
    this.scoreText = this.add.text(16, 16, 'SCORE: 0', {
      fontSize: '16px',
      color: '#ffff00',
      fontFamily: 'monospace'
    });
    this.scoreText.setVisible(false);
    
    this.livesText = this.add.text(16, 40, 'LIVES: 3', {
      fontSize: '16px',
      color: '#ffff00',
      fontFamily: 'monospace'
    });
    this.livesText.setVisible(false);
    
    this.levelText = this.add.text(16, 64, 'LEVEL: 1', {
      fontSize: '16px',
      color: '#ffff00',
      fontFamily: 'monospace'
    });
    this.levelText.setVisible(false);
    
    // Add "READY!" text at start
    const readyText = this.add.text(14 * this.CELL_SIZE - 30, 12 * this.CELL_SIZE, 'READY!', {
      fontSize: '16px',
      color: '#ffff00',
      fontFamily: 'monospace'
    });
    
    // Remove ready text after 2 seconds
    this.time.delayedCall(2000, () => {
      readyText.destroy();
    });
  }

  override update(): void {
    if (this.gameOver) return;
    
    this.handleInput();
    this.updateGhosts();
    this.updatePowerMode();
    this.handleTunnels();
    this.checkWinCondition();
  }

  private updatePowerMode(): void {
    if (this.powerMode) {
      this.powerModeTimer -= this.game.loop.delta;
      if (this.powerModeTimer <= 0) {
        this.powerMode = false;
        // Restore original ghost colors
        this.ghostSprites.forEach((ghost, index) => {
          const originalColors = [0xff0000, 0xffb8ff, 0x00ffff, 0xffb852]; // red, pink, cyan, orange
          ghost.setTint(originalColors[index]);
          ghost.setData('mode', 'scatter');
        });
      }
    }
  }

  private handleTunnels(): void {
    // Handle side tunnels for teleportation
    const pacmanX = this.pacmanSprite.x;
    const pacmanY = this.pacmanSprite.y;
    
    // Left tunnel exit to right side
    if (pacmanX < 0) {
      this.pacmanSprite.setX(18 * this.CELL_SIZE);
    }
    // Right tunnel exit to left side
    else if (pacmanX > 19 * this.CELL_SIZE) {
      this.pacmanSprite.setX(this.CELL_SIZE);
    }
    
    // Apply same logic to ghosts
    this.ghostSprites.forEach(ghost => {
      if (ghost.x < 0) {
        ghost.setX(18 * this.CELL_SIZE);
      } else if (ghost.x > 19 * this.CELL_SIZE) {
        ghost.setX(this.CELL_SIZE);
      }
    });
  }

  private checkWinCondition(): void {
    // Check if all dots have been eaten
    if (this.dotsEaten >= this.totalDots) {
      if (this.level < this.maxLevel) {
        // Advance to next level
        this.nextLevel();
      } else {
        // Game completed
        this.gameOver = true;
        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'GAME COMPLETED!', {
          fontSize: '32px',
          color: '#ffff00',
          fontFamily: 'monospace'
        }).setOrigin(0.5);
        
        // Add celebration effect
        this.tweens.add({
          targets: this.pacmanSprite,
          scaleX: 1.5,
          scaleY: 1.5,
          duration: 500,
          yoyo: true,
          repeat: 3
        });
        
        // Notify Angular component to save high score
        this.notifyGameOver();
      }
    }
  }

  private nextLevel(): void {
    this.level++;
    this.levelText.setText(`LEVEL: ${this.level}`);
    
    // Update Angular component UI
    if (this.gameComponent && this.gameComponent.updateGameStats) {
      this.gameComponent.updateGameStats(this.score, this.lives, this.level);
    }
    
    // Show level transition
    const levelUpText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, `LEVEL ${this.level}!`, {
      fontSize: '32px',
      color: '#ffff00',
      fontFamily: 'monospace'
    }).setOrigin(0.5);
    
    // Increase difficulty
    this.increaseDifficulty();
    
    // Reset level
    this.resetLevel();
    
    // Remove level up text after 2 seconds
    this.time.delayedCall(2000, () => {
      levelUpText.destroy();
    });
  }

  private increaseDifficulty(): void {
    // Increase ghost speed with each level
    const speedMultiplier = 1 + (this.level - 1) * 0.2;
    this.ghostSprites.forEach(ghost => {
      ghost.setData('speed', this.GHOST_SPEED * speedMultiplier);
    });
    
    // Decrease power mode duration
    const powerDuration = Math.max(5000, this.POWER_MODE_DURATION - (this.level - 1) * 1000);
    // Update power mode duration for this level
  }

  private resetLevel(): void {
    // Reset dots eaten counter
    this.dotsEaten = 0;
    this.totalDots = 0;
    
    // Clear existing collectibles
    this.dotsGroup.clear(true, true);
    this.powerPillsGroup.clear(true, true);
    
    // Recreate collectibles
    this.createCollectibles();
    
    // Re-setup collisions for new collectibles
    this.physics.add.overlap(this.pacmanSprite, this.dotsGroup, this.eatDot, undefined, this);
    this.physics.add.overlap(this.pacmanSprite, this.powerPillsGroup, this.eatPowerPill, undefined, this);
    
    // Reset positions
    this.resetPositions();
  }

  private resetPositions(): void {
    // Reset Pacman position
    this.pacmanSprite.setPosition(9 * this.CELL_SIZE + this.CELL_SIZE/2, 15 * this.CELL_SIZE + this.CELL_SIZE/2);
    this.pacmanSprite.setVelocity(0, 0);
    
    // Reset ghost positions
    const ghostPositions = [
      { x: 9 * this.CELL_SIZE + this.CELL_SIZE/2, y: 9 * this.CELL_SIZE + this.CELL_SIZE/2 },
      { x: 8 * this.CELL_SIZE + this.CELL_SIZE/2, y: 9 * this.CELL_SIZE + this.CELL_SIZE/2 },
      { x: 10 * this.CELL_SIZE + this.CELL_SIZE/2, y: 9 * this.CELL_SIZE + this.CELL_SIZE/2 },
      { x: 9 * this.CELL_SIZE + this.CELL_SIZE/2, y: 8 * this.CELL_SIZE + this.CELL_SIZE/2 }
    ];
    
    const ghostNames = ['blinky', 'pinky', 'inky', 'clyde'];
    
    this.ghostSprites.forEach((ghost, index) => {
      ghost.setPosition(ghostPositions[index].x, ghostPositions[index].y);
      ghost.setVelocity(0, 0);
      ghost.setData('direction', Math.floor(Math.random() * 4)); // Random initial direction
      ghost.setData('moveTimer', 0);
      ghost.setData('mode', 'scatter');
      ghost.setData('name', ghostNames[index]);
      ghost.setData('homeCorner', this.getGhostHomeCorner(ghostNames[index]));
      
      // Apply current level speed
      const speedMultiplier = 1 + (this.level - 1) * 0.2;
      ghost.setData('speed', this.GHOST_SPEED * speedMultiplier);
      
      // Reset visual effects
      const colors = [0xff0000, 0xffb8ff, 0x00ffff, 0xffb852];
      ghost.setTint(colors[index]);
      ghost.setAlpha(1);
    });
    
    // Reset power mode
    this.powerMode = false;
    this.powerModeTimer = 0;
  }

  private handleInput(): void {
    const speed = this.PACMAN_SPEED;
    
    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      this.pacmanSprite.setVelocityX(-speed);
      this.pacmanSprite.setVelocityY(0);
      this.pacmanSprite.setRotation(Math.PI);
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      this.pacmanSprite.setVelocityX(speed);
      this.pacmanSprite.setVelocityY(0);
      this.pacmanSprite.setRotation(0);
    } else if (this.cursors.up.isDown || this.wasd.up.isDown) {
      this.pacmanSprite.setVelocityX(0);
      this.pacmanSprite.setVelocityY(-speed);
      this.pacmanSprite.setRotation(-Math.PI / 2);
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      this.pacmanSprite.setVelocityX(0);
      this.pacmanSprite.setVelocityY(speed);
      this.pacmanSprite.setRotation(Math.PI / 2);
    } else {
      this.pacmanSprite.setVelocity(0, 0);
    }
  }

  private updateGhosts(): void {
    this.ghostSprites.forEach((ghost, index) => {
      let mode = ghost.getData('mode');
      const moveTimer = ghost.getData('moveTimer') + this.game.loop.delta;
      ghost.setData('moveTimer', moveTimer);
      
      // Dynamic mode switching based on game time
      const gameTime = this.time.now;
      if (!this.powerMode) {
        // Alternate between scatter and chase modes
        const cycleTime = (gameTime / 7000) % 2; // 7 second cycles
        mode = cycleTime < 1 ? 'scatter' : 'chase';
        ghost.setData('mode', mode);
      }
      
      // Enhanced AI: Change direction based on mode and obstacles
      if (moveTimer > 800) { // Direction changes every 800ms
        const newDirection = this.getGhostDirection(ghost, mode);
        ghost.setData('direction', newDirection);
        ghost.setData('moveTimer', 0);
      }
      
      const direction = ghost.getData('direction');
      let speed = ghost.getData('speed') || this.GHOST_SPEED;
      
      // Adjust speed based on mode
      if (this.powerMode && mode !== 'eaten') {
        speed = speed * 0.5; // Slower when frightened
        ghost.setData('mode', 'frightened');
      } else if (!this.powerMode && mode === 'frightened') {
        // Return to normal behavior
        const cycleTime = (gameTime / 7000) % 2;
        mode = cycleTime < 1 ? 'scatter' : 'chase';
        ghost.setData('mode', mode);
      }
      
      // Move ghost
      switch (direction) {
        case 0: // Up
          ghost.setVelocity(0, -speed);
          break;
        case 1: // Down
          ghost.setVelocity(0, speed);
          break;
        case 2: // Left
          ghost.setVelocity(-speed, 0);
          break;
        case 3: // Right
          ghost.setVelocity(speed, 0);
          break;
      }
      
      // Apply visual effects based on mode
      if (mode === 'frightened') {
        ghost.setTint(0xffffff); // White when frightened
        ghost.setAlpha(1); // Full opacity, no blinking
      } else if (mode === 'eaten') {
        ghost.setAlpha(0.5); // Semi-transparent when eaten
      } else {
        // Reset to original color
        const colors = [0xff0000, 0xffb8ff, 0x00ffff, 0xffb852];
        ghost.setTint(colors[index]);
        ghost.setAlpha(1);
      }
    });
  }

  private getGhostDirection(ghost: Phaser.Physics.Arcade.Sprite, mode: string): number {
    const ghostX = Math.floor(ghost.x / this.CELL_SIZE);
    const ghostY = Math.floor(ghost.y / this.CELL_SIZE);
    const pacmanX = Math.floor(this.pacmanSprite.x / this.CELL_SIZE);
    const pacmanY = Math.floor(this.pacmanSprite.y / this.CELL_SIZE);
    
    let targetX, targetY;
    
    switch (mode) {
      case 'chase':
        // Target Pacman directly
        targetX = pacmanX;
        targetY = pacmanY;
        break;
      case 'scatter':
        // Target home corner
        const homeCorner = ghost.getData('homeCorner');
        targetX = homeCorner.x;
        targetY = homeCorner.y;
        break;
      case 'frightened':
        // Move randomly away from Pacman
        const directions = [0, 1, 2, 3];
        return directions[Math.floor(Math.random() * directions.length)];
      default:
        return ghost.getData('direction');
    }
    
    // Check for valid directions to avoid wall collisions
    const currentDirection = ghost.getData('direction');
    const possibleDirections = [];
    
    // Check each direction for walls
    for (let dir = 0; dir < 4; dir++) {
      let nextX = ghostX;
      let nextY = ghostY;
      
      switch (dir) {
        case 0: nextY--; break; // Up
        case 1: nextY++; break; // Down
        case 2: nextX--; break; // Left
        case 3: nextX++; break; // Right
      }
      
      // Check if next position is valid (not a wall and within bounds)
      if (nextY >= 0 && nextY < this.maze.length && 
          nextX >= 0 && nextX < this.maze[0].length &&
          this.maze[nextY][nextX] !== 1) {
        possibleDirections.push(dir);
      }
    }
    
    if (possibleDirections.length === 0) {
      return currentDirection; // Keep current direction if no valid moves
    }
    
    // Simple pathfinding: move towards target, but only if direction is valid
    const dx = targetX - ghostX;
    const dy = targetY - ghostY;
    
    let preferredDirection;
    if (Math.abs(dx) > Math.abs(dy)) {
      preferredDirection = dx > 0 ? 3 : 2; // Right or Left
    } else {
      preferredDirection = dy > 0 ? 1 : 0; // Down or Up
    }
    
    // Use preferred direction if valid, otherwise pick random valid direction
    if (possibleDirections.includes(preferredDirection)) {
      return preferredDirection;
    } else {
      return possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
    }
  }

  private getPowerPillPositions(dotPositions: {x: number, y: number, row: number, col: number}[]): {x: number, y: number, row: number, col: number}[] {
    const powerPillPositions: {x: number, y: number, row: number, col: number}[] = [];
    
    // Configuration: use class constants for power pill distribution
    const totalPowerPills = Math.max(this.MIN_POWER_PILLS, Math.floor(dotPositions.length * this.POWER_PILL_PERCENTAGE));
    
    // Strategy 1: Place power pills in corners and strategic positions
    const cornerPositions = dotPositions.filter(pos => {
      const isNearCorner = (pos.row <= 3 || pos.row >= this.maze.length - 4) && 
                          (pos.col <= 3 || pos.col >= this.maze[0].length - 4);
      return isNearCorner;
    });
    
    // Strategy 2: Place power pills in central areas for better gameplay
    const centralPositions = dotPositions.filter(pos => {
      const centerRow = Math.floor(this.maze.length / 2);
      const centerCol = Math.floor(this.maze[0].length / 2);
      const distanceFromCenter = Math.abs(pos.row - centerRow) + Math.abs(pos.col - centerCol);
      return distanceFromCenter >= 3 && distanceFromCenter <= 6;
    });
    
    // Strategy 3: Ensure good distribution across the maze
    const distributedPositions = dotPositions.filter(pos => {
      // Select positions that are well-spaced
      return (pos.row + pos.col) % 7 === 0; // Every 7th position in a diagonal pattern
    });
    
    // Combine strategies and remove duplicates
    const candidatePositions = [...new Set([...cornerPositions, ...centralPositions, ...distributedPositions])];
    
    // If we don't have enough candidates, add random positions
    if (candidatePositions.length < totalPowerPills) {
      const remainingPositions = dotPositions.filter(pos => 
        !candidatePositions.some(candidate => candidate.row === pos.row && candidate.col === pos.col)
      );
      
      // Shuffle and add random positions
      for (let i = remainingPositions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [remainingPositions[i], remainingPositions[j]] = [remainingPositions[j], remainingPositions[i]];
      }
      
      candidatePositions.push(...remainingPositions.slice(0, totalPowerPills - candidatePositions.length));
    }
    
    // Select final power pill positions (shuffle for randomness)
    for (let i = candidatePositions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [candidatePositions[i], candidatePositions[j]] = [candidatePositions[j], candidatePositions[i]];
    }
    
    powerPillPositions.push(...candidatePositions.slice(0, totalPowerPills));
    
    console.log(`Generated ${powerPillPositions.length} power pills out of ${dotPositions.length} total dots (${(powerPillPositions.length/dotPositions.length*100).toFixed(1)}%)`);
    
    return powerPillPositions;
  }

  private getGhostHomeCorner(name: string): { x: number, y: number } {
    const corners = {
      'blinky': { x: 18, y: 0 },   // Top right
      'pinky': { x: 0, y: 0 },     // Top left
      'inky': { x: 18, y: 20 },    // Bottom right
      'clyde': { x: 0, y: 20 }     // Bottom left
    };
    return corners[name as keyof typeof corners] || { x: 9, y: 10 };
  }

  private eatDot(pacman: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile, dot: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile): void {
    if (dot instanceof Phaser.GameObjects.GameObject) {
      dot.destroy();
      this.score += this.DOT_POINTS;
      this.dotsEaten++;
      this.scoreText.setText(`SCORE: ${this.score}`);
      
      // Update Angular component UI
      if (this.gameComponent && this.gameComponent.updateGameStats) {
        this.gameComponent.updateGameStats(this.score, this.lives, this.level);
      }
    }
  }

  private eatPowerPill(pacman: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile, powerPill: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile): void {
    if (powerPill instanceof Phaser.GameObjects.GameObject) {
      powerPill.destroy();
      this.score += this.POWER_PILL_POINTS;
      this.scoreText.setText(`SCORE: ${this.score}`);
      this.powerMode = true;
      this.powerModeTimer = this.POWER_MODE_DURATION;
      
      // Update Angular component UI
      if (this.gameComponent && this.gameComponent.updateGameStats) {
        this.gameComponent.updateGameStats(this.score, this.lives, this.level);
      }
      
      // Set all ghosts to frightened mode and change color to white
      this.ghostSprites.forEach(ghost => {
        ghost.setData('mode', 'frightened');
        ghost.setTint(0xffffff); // White color when frightened
      });
    }
  }

  private hitGhost(pacman: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile, ghost: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile): void {
    if (this.gameOver) return; // Don't process hits if game is over
    
    if (this.powerMode && ghost instanceof Phaser.Physics.Arcade.Sprite) {
      // Eat ghost - return to ghost house
      ghost.setPosition(14 * this.CELL_SIZE, 9 * this.CELL_SIZE);
      ghost.setData('mode', 'eaten');
      this.score += this.GHOST_POINTS;
      this.scoreText.setText(`SCORE: ${this.score}`);
      
      // Update Angular component UI
      if (this.gameComponent && this.gameComponent.updateGameStats) {
        this.gameComponent.updateGameStats(this.score, this.lives, this.level);
      }
      
      // Ghost respawn after delay
      this.time.delayedCall(3000, () => {
        ghost.setData('mode', 'scatter');
      });
    } else if (!this.powerMode && this.lives > 0) {
      // Pac-Man dies
      this.lives--;
      this.livesText.setText(`LIVES: ${this.lives}`);
      
      // Update Angular component UI
      if (this.gameComponent && this.gameComponent.updateGameStats) {
        this.gameComponent.updateGameStats(this.score, this.lives, this.level);
      }
      
      if (this.lives <= 0) {
        this.gameOver = true;
        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 50, 'GAME OVER', {
          fontSize: '32px',
          color: '#ff0000',
          fontFamily: 'monospace'
        }).setOrigin(0.5);
        
        // Stop all movement
        this.pacmanSprite.setVelocity(0, 0);
        this.ghostSprites.forEach(ghost => {
          ghost.setVelocity(0, 0);
        });
        
        // Notify Angular component to save high score
        this.notifyGameOver();
      } else {
        this.resetPositions();
      }
    }
  }

  private restartGame(): void {
    // Reset all game state variables
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.gameOver = false;
    this.isGameWon = false;
    this.powerMode = false;
    this.powerModeTimer = 0;
    this.dotsEaten = 0;
    this.totalDots = 0;
    
    // Update UI
    this.scoreText.setText('SCORE: 0');
    this.livesText.setText('LIVES: 3');
    this.levelText.setText('LEVEL: 1');
    
    // Clear all existing game objects
    this.dotsGroup.clear(true, true);
    this.powerPillsGroup.clear(true, true);
    
    // Recreate the game
    this.createCollectibles();
    this.resetPositions();
    
    // Re-setup collisions
    this.physics.add.overlap(this.pacmanSprite, this.dotsGroup, this.eatDot, undefined, this);
    this.physics.add.overlap(this.pacmanSprite, this.powerPillsGroup, this.eatPowerPill, undefined, this);
    
    // Clear any existing UI elements (game over text, buttons)
    this.children.list.forEach(child => {
      if (child instanceof Phaser.GameObjects.Text && 
          (child.text === 'GAME OVER' || child.text === 'EMPEZAR DE NUEVO')) {
        child.destroy();
      }
      if (child instanceof Phaser.GameObjects.Rectangle && child.fillColor === 0x4444ff) {
        child.destroy();
      }
    });
    
    // Show ready text
    const readyText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'READY!', {
      fontSize: '16px',
      color: '#ffff00',
      fontFamily: 'monospace'
    }).setOrigin(0.5);
    
    // Remove ready text after 2 seconds
    this.time.delayedCall(2000, () => {
      readyText.destroy();
    });
  }

  private resetGhosts(): void {
    const ghostPositions = [
      { x: 11 * this.CELL_SIZE + this.CELL_SIZE / 2, y: 9 * this.CELL_SIZE + this.CELL_SIZE / 2 },
      { x: 10 * this.CELL_SIZE + this.CELL_SIZE / 2, y: 9 * this.CELL_SIZE + this.CELL_SIZE / 2 },
      { x: 12 * this.CELL_SIZE + this.CELL_SIZE / 2, y: 9 * this.CELL_SIZE + this.CELL_SIZE / 2 },
      { x: 13 * this.CELL_SIZE + this.CELL_SIZE / 2, y: 9 * this.CELL_SIZE + this.CELL_SIZE / 2 }
    ];

    this.ghostSprites.forEach((ghost, index) => {
      ghost.setPosition(ghostPositions[index].x, ghostPositions[index].y);
      ghost.setVelocity(0, 0);
    });
  }

  private notifyGameOver(): void {
    // Notify Angular component that game is over so it can save the high score
    if (this.gameComponent && this.gameComponent.checkForHighScore) {
      this.gameComponent.checkForHighScore(this.score);
    }
  }

  private gameWon(): void {
    this.gameOver = true;
    this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'YOU WIN!', {
      fontSize: '32px',
      color: '#00ff00',
      fontFamily: 'Courier New'
    }).setOrigin(0.5);
    this.pacmanSprite.setVelocity(0, 0);
    this.ghostSprites.forEach(ghost => ghost.setVelocity(0, 0));
    
    // Notify Angular component to save high score
    this.notifyGameOver();
  }
}
