import { Component, computed, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { ClickOutsideDirective } from '../../directives/click-outside.directive';


export interface SearchParams {
  destination: string;
  rooms: number;
  checkIn: Date | null;
  checkOut: Date | null;
}

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    ClickOutsideDirective
  ],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.scss',
})
export class SearchBarComponent {

  // Inputs
  destinationPlaceholder = input<string>('Prueba con Meliá, Madrid');
  roomsPlaceholder = input<string>('Añade habitaciones');
  datePlaceholder = input<string>('Introduce las fechas');
  navigateOnSearch = input<boolean>(true);
  searchRoute = input<string>('/alojamientos');

  // Output
  search = output<SearchParams>();

  // Internal state
  destination = signal<string>('');
  rooms = signal<number>(1);
  checkIn = signal<Date | null>(null);
  checkOut = signal<Date | null>(null);

  // Active panel
  activePanel = signal<'destination' | 'rooms' | 'date' | null>(null);

  // Computed labels
  destinationLabel = computed(() =>
    this.destination() || this.destinationPlaceholder()
  );

  roomsLabel = computed(() => {
    const r = this.rooms();
    return r > 0 ? `${r} viajero${r > 1 ? 's' : ''}` : this.roomsPlaceholder();
  });

  dateLabel = computed(() => {
    const from = this.checkIn();
    const to = this.checkOut();
    if (!from) return this.datePlaceholder();
    const fmt = (d: Date) => d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
    return to ? `${fmt(from)} – ${fmt(to)}` : fmt(from);
  });

  hasDestination = computed(() => !!this.destination());
  hasRooms = computed(() => this.rooms() > 0);
  hasDate = computed(() => !!this.checkIn());

  // Calendar state
  currentMonth = signal<Date>(new Date());
  nextMonth = computed(() => {
    const d = new Date(this.currentMonth());
    d.setMonth(d.getMonth() + 1);
    return d;
  });

  hoveredDate = signal<Date | null>(null);

  weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  // Calendar methods
  prevMonth(): void {
    this.currentMonth.update(d => {
      const n = new Date(d);
      n.setMonth(n.getMonth() - 1);
      return n;
    });
  }

  nextMonthNav(): void {
    this.currentMonth.update(d => {
      const n = new Date(d);
      n.setMonth(n.getMonth() + 1);
      return n;
    });
  }

  getMonthLabel(date: Date): string {
    return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  }

  getDays(date: Date): (Date | null)[] {
    const year = date.getFullYear();
    const month = date.getMonth();
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);

    // El offset se calcula para que el lunes sea el primer día (0) y el domingo el último (6)
    const offset = (first.getDay() + 6) % 7;
    const days: (Date | null)[] = Array(offset).fill(null);

    for (let d = 1; d <= last.getDate(); d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  }

  isRangeStart(date: Date): boolean {
    return this.isCheckIn(date) && !!this.checkOut();
  }

  isRangeEnd(date: Date): boolean {
    return this.isCheckOut(date) && !!this.checkIn();
  }

  selectDate(date: Date): void {
    const ci = this.checkIn();
    const co = this.checkOut();

    if (!ci || (ci && co)) {
      this.checkIn.set(date);
      this.checkOut.set(null);
    } else {
      if (date < ci) {
        this.checkIn.set(date);
        this.checkOut.set(null);
      } else {
        this.checkOut.set(date);
      }
    }
  }

  isCheckIn(date: Date): boolean {
    return this.checkIn()?.toDateString() === date.toDateString();
  }

  isCheckOut(date: Date): boolean {
    return this.checkOut()?.toDateString() === date.toDateString();
  }

  isInRange(date: Date): boolean {
    const ci = this.checkIn();
    const co = this.checkOut() ?? this.hoveredDate();
    if (!ci || !co) return false;
    return date > ci && date < co;
  }

  isPast(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  }

  constructor(private router: Router) { }

  // Panel
  togglePanel(panel: 'destination' | 'rooms' | 'date'): void {
    this.activePanel.update(current => current === panel ? null : panel);
  }

  closePanels(): void {
    this.activePanel.set(null);
  }

  // Date setters
  setCheckIn(value: string): void {
    this.checkIn.set(value ? new Date(value) : null);
  }

  setCheckOut(value: string): void {
    this.checkOut.set(value ? new Date(value) : null);
  }

  // Rooms
  incrementRooms(): void {
    this.rooms.update(r => r + 1);
  }

  decrementRooms(): void {
    this.rooms.update(r => Math.max(1, r - 1));
  }

  // Search
  onSearch(): void {
    const params: SearchParams = {
      destination: this.destination(),
      rooms: this.rooms(),
      checkIn: this.checkIn(),
      checkOut: this.checkOut(),
    };

    this.search.emit(params);

    if (this.navigateOnSearch()) {
      this.router.navigate([this.searchRoute()], {
        queryParams: {
          destination: params.destination || null,
          rooms: params.rooms,
          checkIn: params.checkIn?.toISOString() || null,
          checkOut: params.checkOut?.toISOString() || null,
        }
      });
    }

    this.closePanels();
  }
}
