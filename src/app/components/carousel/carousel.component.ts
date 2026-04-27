import { Component, input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface CarouselItem {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  linkText: string;
  linkUrl?: string;
}

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.scss'
})
export class CarouselComponent {

  items = input.required<CarouselItem[]>();
  visible = input<number>(2);

  currentIndex = signal(0);

  visibleItems = computed(() => {
    const list = this.items();
    const count = this.visible();
    const start = this.currentIndex();
    const result = [];

    for (let i = 0; i < count; i++) {
      result.push(list[(start + i) % list.length]);
    }
    return result;
  });

  next(): void {
    const total = this.items().length;
    this.currentIndex.update(i => (i + 1) % total);
  }
}
