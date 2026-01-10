import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../shared/material.module';
import { PatientService } from '../../core/services/patient.service';
import { BillingService } from '../../core/services/billing.service';
import { AuthService } from '../../core/services/auth.service';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';

interface DashboardStats {
  patients: number;
  bills: number;
  revenue: number;
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

  stats: DashboardStats = {
    patients: 0,
    bills: 0,
    revenue: 0
  };

  constructor(
    private patientService: PatientService,
    private billingService: BillingService,
    public auth: AuthService
  ) { }

  ngOnInit(): void {
    // Load all dashboard data in parallel using forkJoin
    forkJoin({
      patients: this.patientService.getPatients(),
      bills: this.billingService.getAllBills()
    })
      .pipe(
        map(result => ({
          patients: result.patients.length,
          bills: result.bills.length,
          revenue: result.bills.reduce((sum, bill) => sum + (bill.amount || 0), 0)
        })),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (stats) => {
          this.stats = stats;
        },
        error: (error) => {
          console.error('Error loading dashboard stats:', error);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
