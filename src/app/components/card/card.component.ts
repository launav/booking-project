import { Component, computed, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface CardData {
  id: number;
  title: string;
  subtitle: string;
  rating: number;
  imageUrl: string;
  isFavorite?: boolean;
}

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
})
export class CardComponent {

  // Inputs
  card          = input.required<CardData>();
  isFavorite    = input<boolean>(false);
  showFavorite  = input<boolean>(true);   // oculta el botón de favorito
  interactive   = input<boolean>(true);   // false: sin cursor pointer ni click

  // Outputs
  favoriteToggle = output<number>();
  cardClick = output<number>();

  // Internal state
  favorite = signal<boolean>(false);

  // Computed
  heartIcon = computed(() => this.favorite() ? 'heart_smile' : 'favorite');
  ratingLabel = computed(() => this.card().rating.toFixed(1));

  ngOnInit(): void {
    this.favorite.set(this.isFavorite());
  }

  // Actions
  toggleFavorite(event: MouseEvent): void {
    event.stopPropagation();
    this.favorite.update(v => !v);
    this.favoriteToggle.emit(this.card().id);
  }

  onClick(): void {
    if (!this.interactive()) return;
    this.cardClick.emit(this.card().id);
  }
}
