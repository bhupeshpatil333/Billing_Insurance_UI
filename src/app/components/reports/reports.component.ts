import { Component, OnInit, OnDestroy } from '@angular/core';
import { ReportService } from '../../core/services/report.service';
import { MaterialModule } from '../shared/material.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [MaterialModule, CommonModule, FormsModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss'
})
export class ReportsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  fromDate: string = '';
  toDate: string = '';
  maxDate: Date = new Date();

  billingReport: any[] = [];
  paymentReport: any = null;
  insuranceReport: any = null;

  isLoading: boolean = false;

  // Table columns for billing report
  displayedColumns: string[] = ['invoiceNumber', 'patientName', 'grossAmount', 'insuranceAmount', 'netPayable', 'paidAmount', 'remainingAmount', 'status', 'billDate'];

  constructor(
    private reportService: ReportService,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    // Set default dates: 1st of current month to today
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    this.fromDate = firstDayOfMonth.toISOString().split('T')[0];
    this.toDate = today.toISOString().split('T')[0];
  }

  loadReports() {
    if (!this.fromDate || !this.toDate) {
      this.toastr.warning('Please select both From and To dates', 'Incomplete Date Range');
      return;
    }

    this.isLoading = true;

    // Load billing report
    this.reportService.getBillingReport(this.fromDate, this.toDate)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          console.log('Billing report response:', data);

          // Extract records from nested structure
          if (data && data.records) {
            this.billingReport = data.records;
            console.log('Billing records extracted:', this.billingReport);
          } else {
            this.billingReport = [];
            console.warn('No billing records found in response');
          }
        },
        error: (error) => {
          console.error('Error loading billing report:', error);
          this.billingReport = [];
          this.isLoading = false;
        }
      });

    // Load payment report
    this.reportService.getPaymentReport(this.fromDate, this.toDate)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.paymentReport = data;
          console.log('Payment report:', data);
        },
        error: (error) => console.error('Error loading payment report:', error)
      });

    // Load insurance report
    this.reportService.getInsuranceReport(this.fromDate, this.toDate)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.insuranceReport = data;
          this.isLoading = false;
          console.log('Insurance report:', data);
        },
        error: (error) => {
          console.error('Error loading insurance report:', error);
          this.isLoading = false;
        }
      });
  }

  getTotalBilled(): number {
    return this.billingReport.reduce((sum, bill) => sum + (bill.grossAmount || 0), 0);
  }

  getTotalInsurance(): number {
    return this.billingReport.reduce((sum, bill) => sum + (bill.insuranceAmount || 0), 0);
  }

  getTotalNet(): number {
    return this.billingReport.reduce((sum, bill) => sum + (bill.netPayable || 0), 0);
  }

  getTotalCollected(): number {
    return this.paymentReport?.totalAmount || 0;
  }

  getPendingAmount(): number {
    return this.getTotalNet() - this.getTotalCollected();
  }

  getCollectionRate(): number {
    const billed = this.getTotalNet();
    const collected = this.getTotalCollected();
    return billed > 0 ? (collected / billed * 100) : 0;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
