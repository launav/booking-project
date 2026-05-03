import { Component, computed, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardData } from './model/card.model';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
})
export class CardComponent {

  // Inputs
  card = input.required<CardData>();
  // isFavorite = input<boolean>(false);
  showFavorite = input<boolean>(true);   // oculta el botón de favorito
  interactive = input<boolean>(true);   // false: sin cursor pointer ni click

  // Outputs
  favoriteToggle = output<number>();
  cardClick = output<number>();

  // Internal state
  favorite = signal<boolean>(false);

  // Computed
  heartIcon = computed(() => this.favorite() ? 'heart_smile' : 'favorite');
  ratingLabel = computed(() => this.card().rating.toFixed(1));

  ngOnInit(): void {
    // this.favorite.set(this.isFavorite());
  }

  // Fallback si la imagen no carga (URL rota en BBDD)
  onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.onerror = null; // evita bucle infinito
    // img.src = 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600&q=80';
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
