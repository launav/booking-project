import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CardData } from '../../../components/card/card.component';
import { CarouselItem } from '../../../components/carousel/carousel.component';

export interface HomeSection {
  rooms: CardData[];
  events: CardData[];
}

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  location = signal<string>('Madrid');

  private readonly mockRooms: CardData[] = [
    {
      id: 1,
      title: 'Habitación en Gran Vía',
      subtitle: 'Viva la Gran Vía',
      rating: 4.5,
      imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80',
    },
    {
      id: 2,
      title: 'Suite en Tetuán',
      subtitle: 'Viva Tetuán',
      rating: 4.8,
      imageUrl: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=600&q=80',
    },
    {
      id: 3,
      title: 'Estudio para dos',
      subtitle: 'Viva el estudio',
      rating: 4.2,
      imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80',
    },
    {
      id: 4,
      title: 'Habitación Moncloa',
      subtitle: 'Viva las habitaciones',
      rating: 4.6,
      imageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&q=80',
    },
  ];

  private readonly mockEvents: CardData[] = [
    {
      id: 10,
      title: 'Conciertos',
      subtitle: 'Viva la música',
      rating: 0,
      imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80',
    },
    {
      id: 11,
      title: 'Candlelight',
      subtitle: 'Viva el espectáculo',
      rating: 0,
      imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80',
    },
    {
      id: 12,
      title: 'Cata',
      subtitle: 'Viva el vino',
      rating: 0,
      imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&q=80',
    },
    {
      id: 13,
      title: 'Degustación',
      subtitle: 'Viva la comida',
      rating: 4.6,
      imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80',
    },
  ];

  private readonly mockVisits: CarouselItem[] = [
    {
      id: 20,
      title: 'Melia te lleva a Fitur',
      description: 'Inspírate con lo mejor del sector, consigue las mejores ofertas especializamos, conoce las nuevas tendencias del mercado y vive la experiencia con Melia.',
      imageUrl: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800&q=80',
      linkText: 'Reserva aquí',
      linkUrl: '#',
    },
    {
      id: 21,
      title: 'Melia te lleva a Fitur',
      description: 'Inspírate con lo mejor del sector, consigue las mejores ofertas especializamos, conoce las nuevas tendencias del mercado y vive la experiencia con Melia.',
      imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
      linkText: 'Reserva aquí',
      linkUrl: '#',
    },
    {
      id: 22,
      title: 'Descubre Madrid con nosotros',
      description: 'Los mejores planes culturales, gastronómicos y de ocio para disfrutar al máximo de tu estancia en la capital.',
      imageUrl: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&q=80',
      linkText: 'Reserva aquí',
      linkUrl: '#',
    },
    {
      id: 23,
      title: 'Experiencias únicas en la ciudad',
      description: 'Vive Madrid desde otra perspectiva con nuestros planes exclusivos diseñados para cada tipo de viajero.',
      imageUrl: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80',
      linkText: 'Reserva aquí',
      linkUrl: '#',
    },
  ];

  getRooms(): Observable<CardData[]> {
    return of(this.mockRooms);
  }

  getEvents(): Observable<CardData[]> {
    return of(this.mockEvents);
  }

  getVisits(): Observable<CarouselItem[]> {
    return of(this.mockVisits);
  }
}
