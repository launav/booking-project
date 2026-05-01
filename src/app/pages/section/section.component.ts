import { Component, DestroyRef, inject, OnInit, signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, catchError } from 'rxjs';

import { CardComponent } from '../../components/card/card.component';
import { CarouselComponent, CarouselItem } from '../../components/carousel/carousel.component';

import { HomeService } from '../../core/services/user/home.service';
import { CardData } from '../../components/card/model/card.model';

export type SectionType = 'rooms' | 'events' | 'visits';

const SECTION_TITLES: Record<SectionType, string> = {
  rooms: 'Habitaciones populares en',
  events: 'Eventos en',
  visits: 'Visitas en',
};

export interface ActiveFilters {
  destination: string;
  travelers: number;
  checkIn: Date | null;
  checkOut: Date | null;
}

@Component({
  selector: 'app-section',
  standalone: true,
  imports: [CommonModule, CardComponent, CarouselComponent],
  templateUrl: './section.component.html',
  styleUrl: './section.component.scss'
})
export class SectionComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private homeService = inject(HomeService);
  private destroyRef = inject(DestroyRef);

  location = this.homeService.location;

  section = signal<SectionType>('rooms');
  allCards = signal<CardData[]>([]);
  visits = signal<CarouselItem[]>([]);

  filters = signal<ActiveFilters>({
    destination: '',
    travelers: 0,
    checkIn: null,
    checkOut: null
  });

  cards = computed(() => {
    const all = this.allCards();
    const { destination, travelers } = this.filters();
    const term = destination.toLowerCase().trim();

    return all.filter(card => {
      const searchable = [card.title, card.subtitle ?? '', card.location ?? '']
        .join(' ')
        .toLowerCase();

      const matchDest = !term || searchable.includes(term);
      const matchCap = !travelers || (card.capacity ? card.capacity >= travelers : true);

      return matchDest && matchCap;
    });
  });

  title = computed(() => {
    const base = SECTION_TITLES[this.section()];
    const raw = this.filters().destination || this.location();
    const dest = raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : '';
    return `${base} ${dest}`;
  });

  filtersLabel = computed(() => {
    const { travelers, checkIn, checkOut } = this.filters();
    const parts: string[] = [];

    if (travelers > 0) {
      parts.push(`${travelers} viajero${travelers > 1 ? 's' : ''}`);
    }

    if (checkIn) {
      const fmt = (d: Date) =>
        d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });

      parts.push(checkOut ? `${fmt(checkIn)} – ${fmt(checkOut)}` : fmt(checkIn));
    }

    return parts.join(' · ');
  });

  hasFilters = computed(() => !!this.filtersLabel());

  ngOnInit(): void {

    let lastKey = '';

    combineLatest([this.route.paramMap, this.route.queryParamMap])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([params, query]) => {

        const section = (params.get('section') ?? 'rooms') as SectionType;

        const filters: ActiveFilters = {
          destination: query.get('destination') ?? '',
          travelers: Number(query.get('rooms') ?? 0),
          checkIn: query.get('checkIn') ? new Date(query.get('checkIn')!) : null,
          checkOut: query.get('checkOut') ? new Date(query.get('checkOut')!) : null,
        };

        this.section.set(section);
        this.filters.set(filters);

        const key = `${section}-${JSON.stringify(filters)}`;

        if (key !== lastKey) {
          lastKey = key;
          this.loadData(section, filters);
        }
      });
  }

  private loadData(section: SectionType, filters: ActiveFilters): void {

    if (section === 'rooms') {

      this.homeService.getRooms(50, filters)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: data => this.allCards.set(data),
          error: () => {
            // manteniendo comportamiento consistente
            this.homeService.getRooms(50)
              .pipe(takeUntilDestroyed(this.destroyRef))
              .subscribe(data => this.allCards.set(data));
          }
        });

      return;
    }

    if (section === 'visits') {
      this.homeService.getVisits()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(data => this.visits.set(data));
    }
  }

  clearFilters(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      replaceUrl: true
    });
  }

  goBack(): void {
    history.back();
  }

  onCardClick(id: number): void {

    const f = this.filters();

    const queryParams: any = {
      ...(f.checkIn && { checkIn: this.formatDate(f.checkIn) }),
      ...(f.checkOut && { checkOut: this.formatDate(f.checkOut) }),
      ...(f.travelers && { travelers: f.travelers }),
    };

    this.router.navigate(['room', id], { queryParams });
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
