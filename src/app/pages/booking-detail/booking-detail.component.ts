import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HomeService } from '../../core/services/user/home.service';

export interface Amenity {
  icon: string;
  label: string;
}

export interface PricingOption {
  name: string;
  pricePerNight: number;
  totalPrice: number;
}

export interface RoomDetail {
  id: number;
  name: string;         // nombre de la card: "Habitación en Gran Vía"
  roomType: string;     // tipo de habitación: "Suite Superior"
  bedType: string;
  size: number;
  basePrice: number;
  stars: number;
  description: string;
  amenities: Amenity[];
  images: string[];
  pricingOptions: PricingOption[];
}

const MOCK_ROOMS: RoomDetail[] = [
  {
    id: 1,
    name: 'Habitación en Gran Vía',
    roomType: 'Suite Superior',
    bedType: 'Cama doble',
    size: 45,
    basePrice: 392,
    stars: 5,
    description: 'Vive la exclusividad en la Suite Superior, donde el diseño sofisticado y la comodidad se encuentran. Un lugar perfecto para disfrutar de cada momento.',
    amenities: [
      { icon: 'ac_unit',    label: 'Aire acondicionado/climatizador' },
      { icon: 'wifi',       label: 'Wi-fi' },
      { icon: 'tv',         label: 'Televisión' },
      { icon: 'landscape',  label: 'Habitación con vistas' },
    ],
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
      'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
    ],
    pricingOptions: [
      { name: 'Alojamiento',              pricePerNight: 342, totalPrice: 1568 },
      { name: 'Alojamiento + Desayuno',   pricePerNight: 392, totalPrice: 1568 },
      { name: 'Alojamiento + Media pensión', pricePerNight: 432, totalPrice: 1568 },
    ],
  },
  {
    id: 2,
    name: 'Suite en Tetuán',
    roomType: 'Suite Deluxe',
    bedType: 'Cama king',
    size: 60,
    basePrice: 450,
    stars: 5,
    description: 'Disfruta del lujo y confort de nuestra Suite Deluxe en el corazón de Tetuán, con vistas panorámicas de la ciudad.',
    amenities: [
      { icon: 'ac_unit',    label: 'Aire acondicionado/climatizador' },
      { icon: 'wifi',       label: 'Wi-fi' },
      { icon: 'tv',         label: 'Televisión' },
      { icon: 'bathtub',    label: 'Bañera' },
    ],
    images: [
      'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
    ],
    pricingOptions: [
      { name: 'Alojamiento',              pricePerNight: 400, totalPrice: 1800 },
      { name: 'Alojamiento + Desayuno',   pricePerNight: 450, totalPrice: 2025 },
      { name: 'Alojamiento + Media pensión', pricePerNight: 500, totalPrice: 2250 },
    ],
  },
  {
    id: 3,
    name: 'Estudio para dos',
    roomType: 'Estudio Doble',
    bedType: 'Dos camas',
    size: 30,
    basePrice: 200,
    stars: 4,
    description: 'Acogedor estudio diseñado para dos, con todo lo necesario para una estancia cómoda y agradable.',
    amenities: [
      { icon: 'ac_unit', label: 'Aire acondicionado' },
      { icon: 'wifi',    label: 'Wi-fi' },
      { icon: 'kitchen', label: 'Cocina equipada' },
    ],
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80',
    ],
    pricingOptions: [
      { name: 'Alojamiento',              pricePerNight: 180, totalPrice: 810 },
      { name: 'Alojamiento + Desayuno',   pricePerNight: 200, totalPrice: 900 },
      { name: 'Alojamiento + Media pensión', pricePerNight: 230, totalPrice: 1035 },
    ],
  },
  {
    id: 4,
    name: 'Habitación Moncloa',
    roomType: 'Habitación Estándar',
    bedType: 'Cama doble',
    size: 25,
    basePrice: 150,
    stars: 4,
    description: 'Habitación cómoda y funcional en la zona de Moncloa, perfecta para viajeros que buscan comodidad y buen precio.',
    amenities: [
      { icon: 'ac_unit', label: 'Aire acondicionado' },
      { icon: 'wifi',    label: 'Wi-fi' },
      { icon: 'tv',      label: 'Televisión' },
    ],
    images: [
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
    ],
    pricingOptions: [
      { name: 'Alojamiento',              pricePerNight: 130, totalPrice: 585 },
      { name: 'Alojamiento + Desayuno',   pricePerNight: 150, totalPrice: 675 },
      { name: 'Alojamiento + Media pensión', pricePerNight: 180, totalPrice: 810 },
    ],
  },
];

@Component({
  selector: 'app-booking-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking-detail.component.html',
  styleUrl: './booking-detail.component.scss',
})
export class BookingDetailComponent implements OnInit {

  private route       = inject(ActivatedRoute);
  private router      = inject(Router);
  private homeService = inject(HomeService);

  location   = this.homeService.location;
  room            = signal<RoomDetail | null>(null);
  imageIndex      = signal<number>(0);
  selectedOption  = signal<PricingOption | null>(null);

  breadcrumb = computed(() => {
    const r = this.room();
    return r ? `Habitaciones populares en ${this.location()} > ${r.name}` : '';
  });

  currentImage = computed(() => {
    const r = this.room();
    if (!r) return '';
    return r.images[this.imageIndex()];
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      const found = MOCK_ROOMS.find(r => r.id === id) ?? MOCK_ROOMS[0];
      this.room.set(found);
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
    if (!option) return;
    sessionStorage.setItem('selectedOption', JSON.stringify({ room: this.room(), option }));
    this.router.navigate(['/resume']);
  }

  goBack(): void {
    history.back();
  }
}
