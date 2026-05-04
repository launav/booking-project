import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterOutlet, Router, NavigationEnd, NavigationStart, NavigationCancel, NavigationError } from '@angular/router';
import { filter } from 'rxjs/operators';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { SearchBarComponent } from '../../components/search-bar/search-bar.component';
import { LoadingComponent } from '../../components/loading/loading.component';
import { ErrorModalComponent } from '../../components/error-modal/error-modal.component';
import { LoadingService } from '../../core/services/loading/loading.service';
import { ToastComponent } from '../../components/toast/toast.component';
import { PreviousRouteService } from '../../core/services/loading/previous-route.service';
import { HomeService } from '../../core/services/user/home.service';
import { SearchParams } from '../../components/search-bar/models/search.model';

const NO_SEARCHBAR_NO_FOOTER = ['/resume', '/payment'];
const NO_SEARCHBAR_WITH_FOOTER = ['/success', '/login', '/admin', '/profile'];

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    SearchBarComponent,
    LoadingComponent,
    ErrorModalComponent,
    ToastComponent,
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent {

  private router       = inject(Router);
  private loadingService = inject(LoadingService);
  private prevRoute    = inject(PreviousRouteService);
  private homeService  = inject(HomeService);
  private destroyRef   = inject(DestroyRef);

  hideSearchBar = signal(this.checkHideSearch(this.router.url));
  hideFooter = signal(this.checkHideFooter(this.router.url));

  constructor() {
    this.router.events
      .pipe(
        filter(e => e instanceof NavigationStart),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => this.loadingService.show());

    this.router.events
      .pipe(
        filter(e => e instanceof NavigationEnd || e instanceof NavigationCancel || e instanceof NavigationError),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((e) => {
        this.loadingService.hide();
        if (e instanceof NavigationEnd) {
          this.hideSearchBar.set(this.checkHideSearch(e.urlAfterRedirects));
          this.hideFooter.set(this.checkHideFooter(e.urlAfterRedirects));
          this.prevRoute.track(e.urlAfterRedirects);
        }
      });
  }

  onSearch(params: SearchParams): void {
    // Actualizar el location del servicio para que la home refleje la ciudad buscada
    this.homeService.location.set(params.destination ?? '');
  }

  private checkHideSearch(url: string): boolean {
    return [...NO_SEARCHBAR_NO_FOOTER, ...NO_SEARCHBAR_WITH_FOOTER].some(r => url.startsWith(r));
  }

  private checkHideFooter(url: string): boolean {
    return NO_SEARCHBAR_NO_FOOTER.some(r => url.startsWith(r));
  }
}
