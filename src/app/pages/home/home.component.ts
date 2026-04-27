import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent, CardData } from '../../components/card/card.component';
import { CarouselComponent, CarouselItem } from '../../components/carousel/carousel.component';
import { HomeService } from '../../core/services/user/home.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, CardComponent, CarouselComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {

  private homeService = inject(HomeService);

  location = this.homeService.location;

  rooms  = signal<CardData[]>([]);
  events = signal<CardData[]>([]);
  visits = signal<CarouselItem[]>([]);

  ngOnInit(): void {
    this.homeService.getRooms().subscribe(data => this.rooms.set(data));
    this.homeService.getEvents().subscribe(data => this.events.set(data));
    this.homeService.getVisits().subscribe(data => this.visits.set(data));
  }

  onFavoriteToggle(id: number): void {
    console.log('Favorito toggled:', id);
  }

  onCardClick(id: number): void {
    console.log('Card clicked:', id);
  }
}
