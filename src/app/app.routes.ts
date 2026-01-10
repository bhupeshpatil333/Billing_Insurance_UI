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
      { path: 'dashboard', component: DashboardComponent },

      // Admin only route
      {
        path: 'users',
        component: UserListComponent,
        canActivate: [roleGuard],
        data: { roles: ['Admin'] }
      },

      // All authenticated users can access patients
      { path: 'patients', component: PatientListComponent },

      // Insurance staff and admin
      {
        path: 'insurance',
        component: InsuranceFormComponent,
        canActivate: [roleGuard],
        data: { roles: ['Admin', 'InsuranceStaff'] }
      },

      // Billing staff and admin
      {
        path: 'billing',
        component: BillListComponent,
        canActivate: [roleGuard],
        data: { roles: ['Admin', 'BillingStaff'] }
      },

      { path: 'billing/:id', component: BillListComponent },
      { path: 'payments', component: PaymentFormComponent },

      // Reports - Admin only
      {
        path: 'reports',
        component: DashboardComponent, // Placeholder - create reports component later
        canActivate: [roleGuard],
        data: { roles: ['Admin'] }
      }
    ]
  },

  // Fallback route
  { path: '**', redirectTo: 'login' }
];
