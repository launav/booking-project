import { Routes } from '@angular/router';
import { AuthGuard }  from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layouts/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: 'home',
        loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
      },
      {
        path: 'room/:id',
        loadComponent: () => import('./pages/booking-detail/booking-detail.component').then(m => m.BookingDetailComponent),
      },
      {
        path: 'resume',
        canActivate: [AuthGuard],
        loadComponent: () => import('./pages/resume/resume.component').then(m => m.ResumeComponent),
      },
      {
        path: 'payment',
        canActivate: [AuthGuard],
        loadComponent: () => import('./pages/payment-gateway/payment-gateway.component').then(m => m.PaymentGatewayComponent),
      },
      {
        path: 'success',
        loadComponent: () => import('./pages/success/success.component').then(m => m.SuccessComponent),
      },
      {
        path: 'ayuda',
        loadComponent: () => import('./pages/ayuda/ayuda.component').then(m => m.AyudaComponent),
      },
      {
        path: 'cancelacion',
        loadComponent: () => import('./pages/cancelacion/cancelacion.component').then(m => m.CancelacionComponent),
      },
      {
        path: 'publicar',
        loadComponent: () => import('./pages/publicar/publicar.component').then(m => m.PublicarComponent),
      },
      {
        path: 'login',
        loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
      },
      {
        path: 'reservations',
        loadComponent: () => import('./pages/reservations/reservations.component').then(m => m.ReservationsComponent),
      },
      {
        path: 'profile',
        canActivate: [AuthGuard],
        loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent),
      },
      {
        path: 'admin',
        canActivate: [AdminGuard],
        loadComponent: () => import('./pages/admin/admin.component').then(m => m.AdminComponent),
      },
      {
        path: 'hotel/:id',
        loadComponent: () => import('./pages/hotel-detail/hotel-detail.component').then(m => m.HotelDetailComponent),
      },
      {
        path: ':section',
        loadComponent: () => import('./pages/section/section.component').then(m => m.SectionComponent),
      },
    ],
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent),
  },
];
