import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CardComponent } from '../../components/card/card.component';
import { CarouselComponent, CarouselItem } from '../../components/carousel/carousel.component';
import { HomeService } from '../../core/services/user/home.service';
import { CardData } from '../../components/card/model/card.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, CardComponent, CarouselComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {

  private homeService = inject(HomeService);
  private router      = inject(Router);
  private destroyRef = inject(DestroyRef);

  location = this.homeService.location;

  error = signal('');
  loading = signal(false);

  rooms  = signal<CardData[]>([]);
  hotels = signal<CardData[]>([]);
  visits = signal<CarouselItem[]>([]);

  ngOnInit(): void {
    this.getServices();

    this.homeService.getHotels(4)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(data => this.hotels.set(data));

    this.homeService.getVisits()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(data => this.visits.set(data));
  }

  getServices() {
    const city = this.location();
    const filters = city
      ? { destination: city, travelers: 0, checkIn: null, checkOut: null }
      : undefined;

    this.homeService.getRooms(4, filters)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => {
          this.loading.set(false);
          this.rooms.set(data);
        },
        error: () => {
          this.loading.set(false);
          this.error.set('Error al cargar habitaciones');
        },
      });
  }

  goToSection(section: string): void {
    this.router.navigate([section]);
  }

  onFavoriteToggle(id: number): void {
    console.log('Favorito toggled:', id);
  }

  onCardClick(id: number): void {
    this.router.navigate(['room', id]);
  }
}
