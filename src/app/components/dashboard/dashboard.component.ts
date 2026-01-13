import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../shared/material.module';
import { PatientService } from '../../core/services/patient.service';
import { BillingService } from '../../core/services/billing.service';
import { InsuranceService } from '../../core/services/insurance.service';
import { AuthService } from '../../core/services/auth.service';
import { Subject, forkJoin, of } from 'rxjs';
import { takeUntil, map, catchError } from 'rxjs/operators';

interface DashboardStats {
  patients: number;
  bills: number;
  revenue: number;
  policies: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  isLoading = false;

  stats: DashboardStats = {
    patients: 0,
    bills: 0,
    revenue: 0,
    policies: 0
  };

  constructor(
    private patientService: PatientService,
    private billingService: BillingService,
    private insuranceService: InsuranceService,
    public auth: AuthService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    const isAdmin = this.auth.isAdmin();
    const isBilling = this.auth.isBilling();
    const isInsurance = this.auth.isInsurance();

    // Define sources based on role to avoid 403 errors and forkJoin failures
    const sources: any = {};

    if (isAdmin || isBilling) {
      sources.patients = this.patientService.getPatients().pipe(catchError(() => of([])));
      sources.bills = this.billingService.getAllBills().pipe(catchError(() => of([])));
    } else {
      sources.patients = of([]);
      sources.bills = of([]);
    }

    if (isAdmin || isInsurance) {
      sources.policies = this.insuranceService.getAllPolicies().pipe(catchError(() => of([])));
    } else {
      sources.policies = of([]);
    }

    forkJoin(sources)
      .pipe(
        map((result: any) => ({
          patients: result.patients?.length || 0,
          bills: result.bills?.length || 0,
          policies: result.policies?.length || 0,
          revenue: result.bills?.reduce((sum: number, bill: any) => sum + (bill.netPayable || bill.grossAmount || 0), 0) || 0
        })),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (stats) => {
          this.stats = stats;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading dashboard stats:', error);
          this.isLoading = false;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
