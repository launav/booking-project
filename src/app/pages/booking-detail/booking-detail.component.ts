import { Component, DestroyRef, effect, inject, OnInit, signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { DateRangePickerComponent } from '../../components/date-range-picker/date-range-picker.component';
import { ClickOutsideDirective } from '../../directives/click-outside.directive';
import { combineLatest, Subscription } from 'rxjs';
import { HomeService } from '../../core/services/user/home.service';
import { RoomService, fallbackImage } from '../../core/services/user/room.service';
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
    hotelCity: hotel?.city,
    hotelName: hotel?.name,
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
  imports: [CommonModule, DateRangePickerComponent, ClickOutsideDirective, RouterLink, TranslatePipe],
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

  // Fechas: referencias directas al contexto para two-way binding con el picker
  checkIn = this.ctx.checkIn;
  checkOut = this.ctx.checkOut;
  nights = computed(() => this.ctx.nights());

  // Calendario colapsable
  calendarOpen = signal(false);

  toggleCalendar(): void {
    this.calendarOpen.update(v => !v);
  }

  datesLabel = computed(() => {
    const ci = this.checkIn();
    const co = this.checkOut();
    if (!ci) return 'Añade las fechas de tu estancia';
    const fmt = (d: Date) => d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
    return co ? `${fmt(ci)} – ${fmt(co)}` : fmt(ci);
  });

  // Disponibilidad
  unavailable = signal(false);
  checkingAvailability = signal(false);
  private _availabilitySub: Subscription | null = null;

  // Comprueba disponibilidad y auto-cierra el calendario cuando se seleccionan las dos fechas.
  // IMPORTANTE: no leer calendarOpen() aquí — si lo leyéramos, abrir el calendario
  // volvería a disparar el efecto y lo cerraría inmediatamente.
  private _autoClose = effect(() => {
    const ci = this.checkIn();
    const co = this.checkOut();

    // Cancela la petición anterior si aún está en vuelo
    this._availabilitySub?.unsubscribe();
    this._availabilitySub = null;

    if (ci && co) {
      // Cierra el calendario (escritura pura, sin lectura → no reactiva)
      setTimeout(() => this.calendarOpen.set(false), 350);

      const room = this.room();
      if (!room) return;

      const checkIn  = ci.toISOString().split('T')[0];
      const checkOut = co.toISOString().split('T')[0];

      this.unavailable.set(false);
      this.checkingAvailability.set(true);

      this._availabilitySub = this.roomService
        .checkAvailability(room.id, checkIn, checkOut)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: ({ available }) => {
            this.unavailable.set(!available);
            this.checkingAvailability.set(false);
          },
          error: () => {
            this.checkingAvailability.set(false);
          },
        });
    } else {
      this.unavailable.set(false);
    }
  });

  // Opciones con total dinámico según noches seleccionadas
  dynamicOptions = computed(() => {
    const r = this.room();
    if (!r) return [];
    const n = this.ctx.nights();
    return r.pricingOptions.map(opt => ({
      ...opt,
      totalPrice: n > 0 ? opt.pricePerNight * n : opt.totalPrice,
    }));
  });

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

  // ── Lightbox ───────────────────────────────────────────────────
  openLightbox(index: number): void {
    this.lightboxIndex.set(index);
    this.lightboxOpen.set(true);
  }

  closeLightbox(): void {
    this.lightboxOpen.set(false);
  }

  lightboxPrev(): void {
    const r = this.room();
    if (!r) return;
    this.lightboxIndex.update(i => (i - 1 + r.images.length) % r.images.length);
  }

  lightboxNext(): void {
    const r = this.room();
    if (!r) return;
    this.lightboxIndex.update(i => (i + 1) % r.images.length);
  }

  lightboxImage = computed(() => {
    const r = this.room();
    if (!r || r.images.length === 0) return '';
    return r.images[this.lightboxIndex()];
  });

  onLightboxKey(event: KeyboardEvent): void {
    if (event.key === 'Escape') this.closeLightbox();
    if (event.key === 'ArrowLeft') this.lightboxPrev();
    if (event.key === 'ArrowRight') this.lightboxNext();
  }

  selectOption(option: PricingOption): void {
    this.selectedOption.set(option);
  }

  isSelected(option: PricingOption): boolean {
    return this.selectedOption()?.name === option.name;
  }

  canContinue = computed(() =>
    !!this.selectedOption() &&
    !!this.ctx.checkIn() &&
    !!this.ctx.checkOut() &&
    !this.unavailable() &&
    !this.checkingAvailability()
  );

  continue(): void {
    const option = this.selectedOption();
    const room = this.room();
    if (!option || !room || !this.ctx.checkIn() || !this.ctx.checkOut()) return;
    this.ctx.setSelection(room, option);
    this.router.navigate(['/resume']);
  }

  goBack(): void {
    history.back();
  }

  onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.onerror = null;
    img.src = fallbackImage(this.room()?.roomType ?? 'default');
  }
}
