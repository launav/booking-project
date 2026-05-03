import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';

import { CardData } from '../../../components/card/model/card.model';
import { CarouselItem } from '../../../components/carousel/carousel.component';
import { RoomService } from '../user/room.service';
import { ActiveFilters } from './models/activeFilters.model';
import { RoomImage } from './models/room-image.model';
import { Hotel } from '../admin/models/hotel.model';
import { PaginatedResponse } from '../admin/models/pagination.model';
import { environment } from '../../../../environments/environment';

const HOTEL_FALLBACK = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80';

function buildImageUrl(url: string): string {
  if (url.startsWith('http')) return url;
  const clean = url.startsWith('/') ? url.slice(1) : url;
  return `${environment.apiUrl.replace('/api', '')}/${clean}`;
}

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  private http       = inject(HttpClient);
  private roomService = inject(RoomService);

  location = signal<string>('');

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

  getRooms(limit: number, filters?: ActiveFilters): Observable<CardData[]> {
    const apiFilters = filters
      ? {
          city:     filters.destination || undefined,
          checkIn:  filters.checkIn  ? filters.checkIn.toISOString().split('T')[0]  : undefined,
          checkOut: filters.checkOut ? filters.checkOut.toISOString().split('T')[0] : undefined,
          capacity: filters.travelers || undefined,
        }
      : undefined;

    return this.roomService.getRoomsAsCards(limit, apiFilters);
  }

  getHotels(limit = 4): Observable<CardData[]> {
    return this.http
      .get<PaginatedResponse<Hotel>>(`${environment.apiUrl}/hotels?limit=${limit}`)
      .pipe(
        switchMap(res => {
          const hotels = res.data;
          if (!hotels.length) return of([]);

          const imageReqs = hotels.map(h =>
            this.http
              .get<RoomImage[]>(`${environment.apiUrl}/images?hotel_id=${h.id_hotel}`)
              .pipe(catchError(() => of([])))
          );

          return forkJoin(imageReqs).pipe(
            map(allImages =>
              hotels.map((hotel, i) => {
                const imgs = allImages[i] as RoomImage[];
                const imageUrl = imgs.length ? buildImageUrl(imgs[0].url) : HOTEL_FALLBACK;

                return {
                  id:       hotel.id_hotel,
                  title:    hotel.name,
                  subtitle: hotel.city,
                  location: hotel.address,
                  rating:   0,
                  imageUrl,
                } as CardData;
              })
            )
          );
        }),
        catchError(() => of([]))
      );
  }

  getVisits(): Observable<CarouselItem[]> {
    return of(this.mockVisits);
  }
}
