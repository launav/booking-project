import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SaveImageUrlDto } from './models/image.model';

@Injectable({ providedIn: 'root' })
export class ImageService {

  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/images`;

  saveUrl(dto: SaveImageUrlDto): Observable<{ id_image: number; url: string }> {
    return this.http.post<{ id_image: number; url: string }>(`${this.base}/url`, dto);
  }
}
