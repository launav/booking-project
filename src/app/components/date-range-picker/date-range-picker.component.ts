import { Component, computed, model, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-date-range-picker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './date-range-picker.component.html',
  styleUrl: './date-range-picker.component.scss',
})
export class DateRangePickerComponent {

  checkIn  = model<Date | null>(null);
  checkOut = model<Date | null>(null);

  currentMonth = signal<Date>(new Date());
  nextMonth = computed(() => {
    const d = new Date(this.currentMonth());
    d.setMonth(d.getMonth() + 1);
    return d;
  });

  hoveredDate = signal<Date | null>(null);
  readonly weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

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
    const year  = date.getFullYear();
    const month = date.getMonth();
    const first = new Date(year, month, 1);
    const last  = new Date(year, month + 1, 0);
    const offset = (first.getDay() + 6) % 7;
    const days: (Date | null)[] = Array(offset).fill(null);
    for (let d = 1; d <= last.getDate(); d++) {
      days.push(new Date(year, month, d));
    }
    return days;
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

  isRangeStart(date: Date): boolean {
    return this.isCheckIn(date) && !!this.checkOut();
  }

  isRangeEnd(date: Date): boolean {
    return this.isCheckOut(date) && !!this.checkIn();
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

}
