import { Component, DestroyRef, inject, OnInit, signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest } from 'rxjs';
import { HomeService } from '../../core/services/user/home.service';
import { RoomService } from '../../core/services/user/room.service';
import { BookingContextService } from '../../core/services/user/booking-context.service';
import { RoomDetail } from '../../core/services/user/models/room-detail.model';
import { Hotel } from '../../core/services/user/models/hotel.model';
import { Room } from '../../core/services/user/models/room.model';

export interface Amenity {
  icon: string;
  label: string;
}

export interface PricingOption {
  name: string;
  pricePerNight: number;
  totalPrice: number;
}

/** Convierte los datos de la API en el RoomDetail que usa el template */
function mapToDetail(room: Room, images: string[], hotel: Hotel | null): RoomDetail {
  const priceBase = room.price_per_night;

  return {
    id: room.id_room,
    id_hotel: room.id_hotel,
    name: hotel
      ? `${hotel.name} · Hab. ${room.room_number}`
      : `Habitación ${room.room_number} · ${room.type}`,
    roomType: room.type,
    bedType:
      room.capacity <= 1
        ? 'Cama individual'
        : room.capacity <= 2
        ? 'Cama doble'
        : 'Varias camas',
    size: 0,
    basePrice: priceBase,
    stars: 4,
    description:
      room.description ??
      `Disfruta de nuestra ${room.type} con todo el confort que necesitas.`,
    amenities: [
      { icon: 'wifi', label: 'Wi-fi' },
      { icon: 'ac_unit', label: 'Aire acondicionado' },
      { icon: 'tv', label: 'Televisión' },
    ],
    images,
    hotelCity:  hotel?.city,
    hotelName:  hotel?.name,
    pricingOptions: [
      { name: 'Alojamiento', pricePerNight: priceBase, totalPrice: priceBase * 4 },
      { name: 'Alojamiento + Desayuno', pricePerNight: priceBase + 50, totalPrice: (priceBase + 50) * 4 },
      { name: 'Alojamiento + Media pensión', pricePerNight: priceBase + 90, totalPrice: (priceBase + 90) * 4 },
    ],
  };
}

@Component({
  selector: 'app-booking-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking-detail.component.html',
  styleUrl: './booking-detail.component.scss',
})
export class BookingDetailComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private homeService = inject(HomeService);
  private roomService = inject(RoomService);
  private ctx = inject(BookingContextService);
  private destroyRef = inject(DestroyRef);

  location = this.homeService.location;

  room = signal<RoomDetail | null>(null);
  loading = signal(true);
  imageIndex = signal<number>(0);
  selectedOption = signal<PricingOption | null>(null);

  // Lightbox
  lightboxOpen = signal(false);
  lightboxIndex = signal(0);

  breadcrumb = computed(() => {
    const r = this.room();
    if (!r) return '';
    const city = r.hotelCity || this.location();
    return city
      ? `Habitaciones populares en ${city} › ${r.name}`
      : `Habitaciones › ${r.name}`;
  });

  currentImage = computed(() => {
    const r = this.room();
    if (!r || r.images.length === 0) return '';
    return r.images[this.imageIndex()];
  });

  ngOnInit(): void {
    combineLatest([this.route.paramMap, this.route.queryParamMap])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([params, query]) => {
        const id = Number(params.get('id'));
        if (!id) { this.router.navigate(['/home']); return; }

        // Guardar las fechas del contexto si vienen en la URL
        const checkIn = query.get('checkIn') ? new Date(query.get('checkIn')!) : null;
        const checkOut = query.get('checkOut') ? new Date(query.get('checkOut')!) : null;
        const travelers = Number(query.get('travelers') ?? 1);

        if (checkIn || checkOut) {
          this.ctx.setContext({ checkIn, checkOut, adults: travelers });
        }

        this.loading.set(true);

        this.roomService.getRoomDetail(id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: ({ room, images, hotel }) => {
              this.room.set(mapToDetail(room, images, hotel));
              this.imageIndex.set(0);
              this.loading.set(false);
            },
            error: () => {
              // Si falla la API, redirigir a home
              this.loading.set(false);
              this.router.navigate(['/home']);
            },
          });
      });
  }

  prevImage(): void {
    const r = this.room();
    if (!r) return;
    this.imageIndex.update(i => (i - 1 + r.images.length) % r.images.length);
  }

  nextImage(): void {
    const r = this.room();
    if (!r) return;
    this.imageIndex.update(i => (i + 1) % r.images.length);
  }

  selectOption(option: PricingOption): void {
    this.selectedOption.set(option);
  }

  isSelected(option: PricingOption): boolean {
    return this.selectedOption()?.name === option.name;
  }

  continue(): void {
    const option = this.selectedOption();
    const room = this.room();
    if (!option || !room) return;
    this.ctx.setSelection(room, option);
    this.router.navigate(['/resume']);
  }

  goBack(): void {
    history.back();
  }

  onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.onerror = null;
    const type = this.room()?.roomType?.toLowerCase() ?? 'default';
    const fallbacks: Record<string, string> = {
      individual: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&q=80',
      single:     'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&q=80',
      doble:      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80',
      double:     'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80',
      suite:      'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=600&q=80',
      studio:     'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80',
      default:    'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600&q=80',
    };
    img.src = fallbacks[type] ?? fallbacks['default'];
  }
}
