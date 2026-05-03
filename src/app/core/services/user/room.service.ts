import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, switchMap, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

import { Room } from './models/room.model';
import { Hotel } from './models/hotel.model';
import { RoomImage } from './models/room-image.model';
import { PaginatedResponse } from './models/pagination.model';

import { CardData } from '../../../components/card/model/card.model';

const TYPE_FALLBACKS: Record<string, string> = {
  individual: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&q=80',
  single:     'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&q=80',
  doble:      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80',
  double:     'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80',
  suite:      'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=600&q=80',
  studio:     'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80',
  default:    'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600&q=80',
};

export function fallbackImage(type: string): string {
  return TYPE_FALLBACKS[type?.toLowerCase()] ?? TYPE_FALLBACKS['default'];
}

function buildImageUrl(relativeUrl: string): string {
  if (relativeUrl.startsWith('http')) return relativeUrl;
  const clean = relativeUrl.startsWith('/') ? relativeUrl.slice(1) : relativeUrl;
  return `${environment.apiUrl.replace('/api', '')}/${clean}`;
}

@Injectable({ providedIn: 'root' })
export class RoomService {

  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/rooms`;

  getAll(params?: { page?: number; limit?: number; hotel_id?: number }): Observable<PaginatedResponse<Room>> {
    const pairs: string[] = [];
    if (params?.page) pairs.push(`page=${params.page}`);
    if (params?.limit) pairs.push(`limit=${params.limit}`);
    if (params?.hotel_id) pairs.push(`hotel_id=${params.hotel_id}`);
    const query = pairs.length ? '?' + pairs.join('&') : '';
    return this.http.get<PaginatedResponse<Room>>(`${this.base}${query}`);
  }

  searchRooms(params: {
    city?: string;
    checkIn?: string;
    checkOut?: string;
    capacity?: number;
    page?: number;
    limit?: number;
  }): Observable<PaginatedResponse<Room>> {
    const pairs: string[] = [];
    if (params.city) pairs.push(`city=${encodeURIComponent(params.city)}`);
    if (params.checkIn) pairs.push(`checkIn=${params.checkIn}`);
    if (params.checkOut) pairs.push(`checkOut=${params.checkOut}`);
    if (params.capacity) pairs.push(`capacity=${params.capacity}`);
    if (params.page) pairs.push(`page=${params.page}`);
    if (params.limit) pairs.push(`limit=${params.limit}`);
    const query = pairs.length ? '?' + pairs.join('&') : '';
    return this.http.get<PaginatedResponse<Room>>(`${this.base}/search${query}`);
  }

  getById(id: number): Observable<Room> {
    return this.http.get<Room>(`${this.base}/${id}`);
  }

  checkAvailability(id: number, checkIn: string, checkOut: string): Observable<{ available: boolean }> {
    return this.http.get<{ available: boolean }>(
      `${this.base}/${id}/availability?checkIn=${checkIn}&checkOut=${checkOut}`
    );
  }

  getImages(roomId: number): Observable<RoomImage[]> {
    return this.http.get<RoomImage[]>(`${environment.apiUrl}/images?room_id=${roomId}`);
  }

  getHotelById(id: number): Observable<Hotel | null> {
    return this.http
      .get<Hotel>(`${environment.apiUrl}/hotels/${id}`)
      .pipe(catchError(() => of(null)));
  }

  // helpers
  getRoomsAsCards(
    limit = 8,
    filters?: {
      city?: string;
      checkIn?: string;
      checkOut?: string;
      capacity?: number;
    }
  ): Observable<CardData[]> {

    // 1. con filtros
    if (filters && (filters.city || filters.checkIn || filters.checkOut || filters.capacity)) {
      return this.searchRooms({
        ...filters,
        limit
      }).pipe(
        switchMap(res => {
          const rooms = res.data;
          if (!rooms.length) return of([]);

          const imageRequests = rooms.map(r =>
            this.getImages(r.id_room).pipe(catchError(() => of([])))
          );

          return forkJoin(imageRequests).pipe(
            map(allImages =>
              rooms.map((room, i) => {
                const imgs = allImages[i];
                const imageUrl = imgs.length
                  ? buildImageUrl(imgs[0].url)
                  : fallbackImage(room.type);

                return {
                  id: room.id_room,
                  title: `Habitación ${room.room_number} · ${room.type}`,
                  subtitle: `${room.price_per_night}€ / noche · Cap. ${room.capacity}`,
                  location: room.hotel_name
                    ? `${room.hotel_name} · ${room.hotel_city}`
                    : '',
                  capacity: room.capacity,
                  rating: 0,
                  imageUrl,
                } as CardData;
              })
            )
          );
        })
      );
    }

    // 2. fallback SIEMPRE (esto faltaba)
    return this.getAll({ limit }).pipe(
      switchMap(res => {
        const rooms = res.data;
        if (!rooms.length) return of([]);

        const imageRequests = rooms.map(r =>
          this.getImages(r.id_room).pipe(catchError(() => of([])))
        );

        return forkJoin(imageRequests).pipe(
          map(allImages =>
            rooms.map((room, i) => {
              const imgs = allImages[i];
              const imageUrl = imgs.length
                ? buildImageUrl(imgs[0].url)
                : fallbackImage(room.type);

              return {
                id: room.id_room,
                title: `Habitación ${room.room_number} · ${room.type}`,
                subtitle: `${room.price_per_night}€ / noche · Cap. ${room.capacity}`,
                location: room.hotel_name
                  ? `${room.hotel_name} · ${room.hotel_city}`
                  : '',
                capacity: room.capacity,
                rating: 0,
                imageUrl,
              } as CardData;
            })
          )
        );
      })
    );
  }
  getRoomDetail(id: number): Observable<{ room: Room; images: string[]; hotel: Hotel | null }> {
    return this.getById(id).pipe(
      switchMap(room =>
        forkJoin({
          images: this.getImages(id).pipe(catchError(() => of([]))),
          hotel: this.getHotelById(room.id_hotel),
        }).pipe(
          map(({ images, hotel }) => ({
            room,
            hotel,
            images: images.length
              ? images.map(img => buildImageUrl(img.url))
              : [fallbackImage(room.type)],
          }))
        )
      )
    );
  }
}
