import { Injectable, Provider } from '@angular/core';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

@Injectable({
  providedIn: 'root'
})
export class TranslateLoaderService {
  constructor() { }

  static getProviders(): Provider[] {
    return [
      provideTranslateService({ defaultLanguage: 'es-ES' }),
      provideTranslateHttpLoader({ prefix: './assets/i18n/', suffix: '.json' }),
    ];
  }
}
