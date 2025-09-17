import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface MenuOption {
  id: string;
  label: string;
  action: () => void;
}

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent {
  @Output() newGame = new EventEmitter<void>();
  @Output() showHighScores = new EventEmitter<void>();
  @Output() showInstructions = new EventEmitter<void>();

  selectedIndex = 0;

  menuOptions: MenuOption[] = [
    {
      id: 'new-game',
      label: 'Nuevo Juego',
      action: () => this.newGame.emit()
    },
    {
      id: 'high-scores',
      label: 'Puntuaciones',
      action: () => this.showHighScores.emit()
    },
    {
      id: 'instructions',
      label: 'Instrucciones',
      action: () => this.showInstructions.emit()
    }
  ];

  constructor() {
    // Listen for keyboard events
    document.addEventListener('keydown', (event) => this.handleKeyPress(event));
  }

  selectOption(index: number): void {
    this.selectedIndex = index;
    this.menuOptions[index].action();
  }

  private handleKeyPress(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        this.selectedIndex = this.selectedIndex > 0 ? this.selectedIndex - 1 : this.menuOptions.length - 1;
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.selectedIndex = this.selectedIndex < this.menuOptions.length - 1 ? this.selectedIndex + 1 : 0;
        break;
      case 'Enter':
        event.preventDefault();
        this.menuOptions[this.selectedIndex].action();
        break;
    }
  }
}
