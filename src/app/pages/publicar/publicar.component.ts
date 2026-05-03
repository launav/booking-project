import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-publicar',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './publicar.component.html',
  styleUrl: './publicar.component.scss',
})
export class PublicarComponent {
  private router = inject(Router);
  goHome(): void { this.router.navigate(['/home']); }
}
