import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { inject } from '@angular/core';

@Component({
  selector: 'app-ayuda',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './ayuda.component.html',
  styleUrl: './ayuda.component.scss',
})
export class AyudaComponent {
  private router = inject(Router);
  goHome(): void { this.router.navigate(['/home']); }
}
