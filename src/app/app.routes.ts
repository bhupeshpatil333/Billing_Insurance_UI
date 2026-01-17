import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { LoginComponent } from './components/login/login.component';
import { UnauthorizedComponent } from './components/unauthorized/unauthorized.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { PatientListComponent } from './components/patient/patient-list/patient-list.component';
import { InsuranceFormComponent } from './components/insurance/insurance-form/insurance-form.component';
import { BillFormComponent } from './components/bill/bill-form/bill-form.component';
import { BillListComponent } from './components/bill/bill-list/bill-list.component';
import { PaymentFormComponent } from './components/payment/payment-form/payment-form.component';
import { UserListComponent } from './components/user/user-list/user-list.component';
import { ReportsComponent } from './components/reports/reports.component';

export const routes: Routes = [
  // Public routes
  { path: 'login', component: LoginComponent },
  { path: 'unauthorized', component: UnauthorizedComponent },

  // Protected routes with layout
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent) },

      // Admin only routes
      {
        path: 'users',
        loadComponent: () => import('./components/user/user-list/user-list.component').then(m => m.UserListComponent),
        canActivate: [roleGuard],
        data: { roles: ['Admin'] }
      },
      {
        path: 'services',
        loadComponent: () => import('./components/admin/service-list/service-list.component').then(m => m.ServiceListComponent),
        canActivate: [roleGuard],
        data: { roles: ['Admin'] }
      },

      // All authenticated users can access patients
      { path: 'patients', loadComponent: () => import('./components/patient/patient-list/patient-list.component').then(m => m.PatientListComponent) },

      // Insurance staff and admin
      {
        path: 'insurance',
        loadComponent: () => import('./components/insurance/insurance-form/insurance-form.component').then(m => m.InsuranceFormComponent),
        canActivate: [roleGuard],
        data: { roles: ['Admin', 'Insurance'] }
      },

      // Policy Management - Admin and Insurance
      {
        path: 'policies',
        loadComponent: () => import('./components/insurance/policy-list/policy-list.component').then(m => m.PolicyListComponent),
        canActivate: [roleGuard],
        data: { roles: ['Admin', 'Insurance'] }
      },

      // Billing staff and admin
      {
        path: 'billing',
        loadComponent: () => import('./components/bill/bill-list/bill-list.component').then(m => m.BillListComponent),
        canActivate: [roleGuard],
        data: { roles: ['Admin', 'Billing'] }
      },

      { path: 'billing/:id', loadComponent: () => import('./components/bill/bill-list/bill-list.component').then(m => m.BillListComponent) },
      { path: 'payments', loadComponent: () => import('./components/payment/payment-form/payment-form.component').then(m => m.PaymentFormComponent) },

      // Reports - Admin only
      // {
      //   path: 'reports',
      //   component: DashboardComponent, // Placeholder - create reports component later
      //   canActivate: [roleGuard],
      //   data: { roles: ['Admin'] }
      // }
      {
        path: 'reports',
        loadComponent: () => import('./components/reports/reports.component').then(m => m.ReportsComponent),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['Admin'] }
      }

    ]
  },

  // Fallback route
  { path: '**', redirectTo: 'login' }
];
