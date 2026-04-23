import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'admin',
    canActivate: [AuthGuard],
    loadComponent: () => import('./pages/admin/admin.component').then(m => m.AdminComponent)
  },
  {
    path: ':section',
    loadComponent: () => import('./pages/section/section.component').then(m => m.SectionComponent)
  },
  {
    path: 'booking/:id',
    loadComponent: () => import('./pages/booking-detail/booking-detail.component').then(m => m.BookingDetailComponent)
  },
  {
    path: 'resume',
    loadComponent: () => import('./pages/resume/resume.component').then(m => m.ResumeComponent)
  },
  {
    path: 'payment',
    loadComponent: () => import('./pages/payment-gateway/payment-gateway.component').then(m => m.PaymentGatewayComponent)
  },
  {
    path: 'success',
    loadComponent: () => import('./pages/success/success.component').then(m => m.SuccessComponent)
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];
