import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cancelacion',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './cancelacion.component.html',
  styleUrl: './cancelacion.component.scss',
})
export class CancelacionComponent {
  private router = inject(Router);
  goHome(): void { this.router.navigate(['/home']); }
}
