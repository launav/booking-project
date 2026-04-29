import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cancelacion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cancelacion.component.html',
  styleUrl: './cancelacion.component.scss',
})
export class CancelacionComponent {
  private router = inject(Router);
  goHome(): void { this.router.navigate(['/home']); }
}
