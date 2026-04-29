import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/user/auth.service';
import { CardComponent, CardData } from '../../components/card/card.component';
import { ProfileService } from '../../core/services/user/profile.service';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterLink, CardComponent],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.scss'
})
export class FavoritesComponent implements OnInit {

  authService    = inject(AuthService);
  profileService = inject(ProfileService);

  favorites = signal<CardData[]>([]);

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) return;
    // TODO: cargar favoritos reales del usuario
    // this.profileService.getProfile(this.authService.currentUser()!.id)
    //   .subscribe(profile => { ... cargar habitaciones por ids ... });
    this.favorites.set([]);
  }
}
