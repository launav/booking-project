import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface BookingForm {
  nombre:          string;
  apellido:        string;
  segundoApellido: string;
  direccion:       string;
  pais:            string;
  ciudad:          string;
  codigoPostal:    string;
  email:           string;
  telefono:        string;
}

@Component({
  selector: 'app-success',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './success.component.html',
  styleUrl: './success.component.scss'
})
export class SuccessComponent implements OnInit {

  formData = signal<BookingForm | null>(null);

  fullName    = () => {
    const d = this.formData();
    if (!d) return '';
    return [d.nombre, d.apellido, d.segundoApellido].filter(Boolean).join(' ');
  };

  addressLine = () => {
    const d = this.formData();
    return d ? d.direccion : '';
  };

  locationLine = () => {
    const d = this.formData();
    return d ? `${d.pais}, ${d.ciudad}, ${d.codigoPostal}` : '';
  };

  ngOnInit(): void {
    const raw = sessionStorage.getItem('bookingForm');
    if (raw) {
      try { this.formData.set(JSON.parse(raw)); } catch { /* noop */ }
    }
  }
}
