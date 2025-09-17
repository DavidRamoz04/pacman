import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-player-name',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './player-name.component.html',
  styleUrls: ['./player-name.component.scss']
})
export class PlayerNameComponent {
  @Output() playerNameSet = new EventEmitter<string>();
  @Output() backToMenu = new EventEmitter<void>();

  playerName = '';

  startGame(): void {
    const name = this.playerName.trim() || 'Player 1';
    this.playerNameSet.emit(name);
  }

  goBack(): void {
    this.backToMenu.emit();
  }
}
