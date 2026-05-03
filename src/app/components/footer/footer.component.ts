import { Component, computed, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

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
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {

  // ── Inputs ─────────────────────────────────────────────────
  brandName = input<string>('Roomify');
  locale = input<string>('footer.locale');

  columns = input<FooterColumn[]>([
    {
      title: 'footer.col1Title',
      links: [
        { label: 'footer.helpCenter',        route: '/ayuda' },
        { label: 'footer.cancellationOptions', route: '/cancelacion' },
      ],
    },
    {
      title: 'footer.col2Title',
      links: [
        { label: 'footer.howToPublish', route: '/publicar' },
      ],
    },
  ]);

  // ── Estado interno ──────────────────────────────────────────
  private _year = signal<number>(new Date().getFullYear());

  // ── Computed ────────────────────────────────────────────────
  copyrightText = computed(() => `© ${this._year()} ${this.brandName()}`);
}
