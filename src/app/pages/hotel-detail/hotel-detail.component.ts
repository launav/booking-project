import { Component, DestroyRef, inject, OnInit, signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { forkJoin, of } from 'rxjs';
import { switchMap, catchError, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

import { Hotel } from '../../core/services/user/models/hotel.model';
import { Room } from '../../core/services/user/models/room.model';
import { RoomImage } from '../../core/services/user/models/room-image.model';
import { fallbackImage } from '../../core/services/user/room.service';

const HOTEL_FALLBACK = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80';

function buildUrl(url: string): string {
  if (url.startsWith('http')) return url;
  const clean = url.startsWith('/') ? url.slice(1) : url;
  return `${environment.apiUrl.replace('/api', '')}/${clean}`;
}

export interface RoomCard {
  id: number;
  type: string;
  roomNumber: string;
  capacity: number;
  price: number;
  image: string;
  status: string;
}

@Component({
  selector: 'app-hotel-detail',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './hotel-detail.component.html',
  styleUrl: './hotel-detail.component.scss',
})
export class HotelDetailComponent implements OnInit {

  private route      = inject(ActivatedRoute);
  private router     = inject(Router);
  private http       = inject(HttpClient);
  private destroyRef = inject(DestroyRef);

  hotel      = signal<Hotel | null>(null);
  images     = signal<string[]>([]);
  rooms      = signal<RoomCard[]>([]);
  loading    = signal(true);
  imageIndex = signal(0);

  currentImage = computed(() => {
    const imgs = this.images();
    if (!imgs.length) return HOTEL_FALLBACK;
    return imgs[this.imageIndex()];
  });

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        const id = Number(params.get('id'));
        if (!id) { this.router.navigate(['/home']); return; }
        this.loadHotel(id);
      });
  }

  private loadHotel(id: number): void {
    this.loading.set(true);

    const hotel$ = this.http.get<Hotel>(`${environment.apiUrl}/hotels/${id}`);
    const images$ = this.http
      .get<RoomImage[]>(`${environment.apiUrl}/images?hotel_id=${id}`)
      .pipe(catchError(() => of([])));
    const rooms$ = this.http
      .get<{ data: Room[] }>(`${environment.apiUrl}/rooms?hotel_id=${id}&limit=100`)
      .pipe(catchError(() => of({ data: [] })));

    forkJoin({ hotel: hotel$, images: images$, roomsRes: rooms$ })
      .pipe(
        switchMap(({ hotel, images, roomsRes }) => {
          const rooms = (roomsRes as any).data as Room[];
          if (!rooms.length) {
            return of({ hotel, images, rooms: [] as RoomCard[] });
          }

          const roomImageReqs = rooms.map(r =>
            this.http
              .get<RoomImage[]>(`${environment.apiUrl}/images?room_id=${r.id_room}`)
              .pipe(catchError(() => of([])))
          );

          return forkJoin(roomImageReqs).pipe(
            map(allRoomImages => ({
              hotel,
              images,
              rooms: rooms.map((r, i) => {
                const imgs = allRoomImages[i] as RoomImage[];
                return {
                  id:         r.id_room,
                  type:       r.type,
                  roomNumber: r.room_number,
                  capacity:   r.capacity,
                  price:      r.price_per_night,
                  status:     r.status,
                  image:      imgs.length ? buildUrl(imgs[0].url) : fallbackImage(r.type),
                } as RoomCard;
              }),
            }))
          );
        }),
        takeUntilDestroyed(this.destroyRef),
        catchError(() => {
          this.router.navigate(['/home']);
          return of(null);
        })
      )
      .subscribe(result => {
        if (!result) return;
        this.hotel.set(result.hotel);
        this.images.set(
          (result.images as RoomImage[]).length
            ? (result.images as RoomImage[]).map(img => buildUrl(img.url))
            : [HOTEL_FALLBACK]
        );
        this.rooms.set(result.rooms);
        this.loading.set(false);
      });
  }

  prevImage(): void {
    const len = this.images().length;
    this.imageIndex.update(i => (i - 1 + len) % len);
  }

  nextImage(): void {
    const len = this.images().length;
    this.imageIndex.update(i => (i + 1) % len);
  }

  goToRoom(roomId: number): void {
    this.router.navigate(['/room', roomId]);
  }

  goBack(): void {
    history.back();
  }

  onImgError(event: Event, type = 'default'): void {
    const img = event.target as HTMLImageElement;
    img.onerror = null;
    img.src = fallbackImage(type);
  }
}
