import { Component, computed, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

export interface FooterLink {
  label: string;
  route?: string;
  url?: string;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {

  // ── Inputs ─────────────────────────────────────────────────
  brandName = input<string>('Roomify');
  locale = input<string>('Español (ES)');

  columns = input<FooterColumn[]>([
    {
      title: 'Roomify',
      links: [
        { label: 'Centro de ayuda',        route: '/ayuda' },
        { label: 'Opciones de cancelación', route: '/cancelacion' },
      ],
    },
    {
      title: 'Publica tu alojamiento',
      links: [
        { label: '¿Cómo publico mi hotel?', route: '/publicar' },
      ],
    },
  ]);

  // ── Estado interno ──────────────────────────────────────────
  private _year = signal<number>(new Date().getFullYear());

  // ── Computed ────────────────────────────────────────────────
  copyrightText = computed(() => `© ${this._year()} ${this.brandName()}`);
}
