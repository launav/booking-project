import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CardComponent, CardData } from '../../components/card/card.component';
import { CarouselComponent, CarouselItem } from '../../components/carousel/carousel.component';
import { HomeService } from '../../core/services/user/home.service';

type SectionType = 'rooms' | 'events' | 'visits' | string;

const SECTION_TITLES: Record<string, string> = {
  rooms: 'Habitaciones populares en',
  events: 'Eventos en',
  visits: 'Visitas en',
};

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

  location = this.homeService.location;
  section = signal<SectionType>('');

  cards = signal<CardData[]>([]);
  visits = signal<CarouselItem[]>([]);

  title = computed(() => {
    const base = SECTION_TITLES[this.section()] ?? this.section();
    return `Habitaciones populares en ${this.location()}`;
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const section = params.get('section') ?? '';
      this.section.set(section);
      this.loadData(section);
    });
  }

  goBack(): void {
    history.back();
  }

  onCardClick(id: number): void {
    this.router.navigate(['room', id]);
  }

  private loadData(section: SectionType): void {
    if (section === 'rooms') {
      this.homeService.getRooms().subscribe(data => this.cards.set(data));
    } else if (section === 'events') {
      this.homeService.getEvents().subscribe(data => this.cards.set(data));
    } else if (section === 'visits') {
      this.homeService.getVisits().subscribe(data => this.visits.set(data));
    }
  }
}
