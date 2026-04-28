import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { SearchBarComponent } from "../../components/search-bar/search-bar.component";

// Rutas sin buscador ni footer
const NO_SEARCHBAR_NO_FOOTER = ['/resume', '/payment'];
// Rutas sin buscador pero con footer
const NO_SEARCHBAR_WITH_FOOTER = ['/success'];

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, SearchBarComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent {

  private router = inject(Router);

  hideSearchBar = signal(this.checkHideSearch(this.router.url));
  hideFooter    = signal(this.checkHideFooter(this.router.url));

  constructor() {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: NavigationEnd) => {
        this.hideSearchBar.set(this.checkHideSearch(e.urlAfterRedirects));
        this.hideFooter.set(this.checkHideFooter(e.urlAfterRedirects));
      });
  }

  private checkHideSearch(url: string): boolean {
    return [...NO_SEARCHBAR_NO_FOOTER, ...NO_SEARCHBAR_WITH_FOOTER].some(r => url.startsWith(r));
  }

  private checkHideFooter(url: string): boolean {
    return NO_SEARCHBAR_NO_FOOTER.some(r => url.startsWith(r));
  }
}
