import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { BillingService } from '../../../core/services/billing.service';
import { PatientService } from '../../../core/services/patient.service';
import { InsuranceService } from '../../../core/services/insurance.service';
import { PaymentService } from '../../../core/services/payment.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { ServiceService } from '../../../core/services/service.service';
import { Patient, AppServiceItem, BillResponse } from '../../../core/Interfaces/interfaces';

@Component({
  selector: 'app-bill-list',
  standalone: true,
  imports: [RouterModule, MaterialModule, FormsModule],
  templateUrl: './bill-list.component.html',
  styleUrl: './bill-list.component.scss'
})
export class BillListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Data
  // Data
  patients: Patient[] = [];
  services: (AppServiceItem & { quantity: number })[] = [];

  // Form data
  patientId: string = '';
  insuranceCoverage: number = 0;
  isServicesLoading: boolean = false;

  // Calculations
  grossAmount: number = 0;
  insuranceAmount: number = 0;
  netPayable: number = 0;

  // Result
  billResult: BillResponse | null = null;

  // Table columns
  displayedColumns: string[] = ['service', 'cost', 'qty'];

  constructor(
    private route: ActivatedRoute,
    private patientService: PatientService,
    private billingService: BillingService,
    private insuranceService: InsuranceService,
    private paymentService: PaymentService,
    private serviceService: ServiceService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadPatients();
    this.loadServices();
  }

  loadPatients(): void {
    this.patientService.getPatients()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.patients = res;
        },
        error: (error) => {
          console.error('Error fetching patients:', error);
          this.toastr.error('Failed to load patients.', 'Error');
        }
      });
  }

  loadServices(): void {
    this.isServicesLoading = true;
    this.serviceService.getServices()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          // Only show services that are active
          this.services = res
            .filter(s => s.isActive)
            .map(s => ({ ...s, quantity: 0 }));
          this.isServicesLoading = false;
        },
        error: (error) => {
          console.error('Error fetching services:', error);
          this.toastr.error('Failed to load services from master.', 'Error');
          this.isServicesLoading = false;
        }
      });
  }

  onPatientChange(): void {
    if (!this.patientId) {
      this.insuranceCoverage = 0;
      this.calculateBill();
      return;
    }

    // Get active insurance policy for selected patient
    this.insuranceService.getPoliciesByPatient(this.patientId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (policies: any[]) => {
          // Assuming first policy is active and has coveragePercentage
          if (policies && policies.length > 0) {
            this.insuranceCoverage = policies[0]?.coveragePercentage || 0;
          } else {
            this.insuranceCoverage = 0;
          }
          this.calculateBill();
        },
        error: (error) => {
          console.error('Error fetching insurance:', error);
          this.toastr.error('Failed to fetch insurance details.', 'Error');
          this.insuranceCoverage = 0;
          this.calculateBill();
        }
      });
  }

  calculateBill(): void {
    // Calculate gross amount from selected services
    this.grossAmount = this.services
      .filter(s => s.quantity > 0)
      .reduce((sum, s) => sum + (s.cost * s.quantity), 0);

    // Calculate insurance deduction
    this.insuranceAmount = (this.grossAmount * this.insuranceCoverage) / 100;

    // Calculate net payable
    this.netPayable = this.grossAmount - this.insuranceAmount;
  }

  generateBill(): void {
    if (!this.patientId || this.grossAmount === 0) {
      this.toastr.warning('Please select a patient and at least one service', 'Incomplete Information');
      return;
    }

    const selectedServices = this.services.filter(s => s.quantity > 0);

    const payload = {
      patientId: parseInt(this.patientId, 10), // Ensure number
      services: selectedServices.map(s => ({
        serviceId: s.serviceId,
        quantity: s.quantity
      }))
    };

    this.billingService.generateBill(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.billResult = res;
          this.netPayable = res.netPayable; // Update net payable from backend response
          this.insuranceAmount = res.insuranceAmount;
          this.grossAmount = res.grossAmount;

          // Calculate or update insurance coverage percentage
          if (res.insurancePercentage !== undefined) {
            this.insuranceCoverage = res.insurancePercentage;
          } else if (this.grossAmount > 0) {
            this.insuranceCoverage = Math.round((this.insuranceAmount / this.grossAmount) * 100);
          }

          this.toastr.success('Bill generated successfully!', 'Success');
        },
        error: (error) => {
          console.error('Error generating bill:', error);
          this.toastr.error('Error generating bill. Please try again.', 'Error');
        }
      });
  }

  downloadInvoice() {
    if (!this.billResult || !(this.billResult.id || this.billResult.billId)) {
      this.toastr.warning('No bill generated to download invoice.', 'No Invoice');
      return;
    }
    const billId = this.billResult.id || this.billResult.billId;
    this.billingService.downloadInvoice(billId)
      .subscribe(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Invoice_${billId}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.toastr.success('Invoice downloaded successfully!', 'Download Complete');
      }, error => {
        console.error('Error downloading invoice:', error);
        this.toastr.error('Failed to download invoice.', 'Error');
      });
  }

  emailInvoice() {
    if (!this.billResult || !(this.billResult.id || this.billResult.billId)) {
      this.toastr.warning('No bill generated to email invoice.', 'No Invoice');
      return;
    }
    const billId = this.billResult.id || this.billResult.billId;
    this.billingService.emailInvoice(billId)
      .subscribe({
        next: () => {
          this.toastr.success('Invoice has been sent to the patient\'s registered email.', 'Email Sent');
        },
        error: (error) => {
          console.error('Error emailing invoice:', error);
          this.toastr.error('Failed to email invoice. Please try again.', 'Error');
        }
      });
  }


  makePayment(): void {
    if (!this.billResult) {
      this.toastr.warning('Please generate a bill first', 'No Bill Generated');
      return;
    }

    const payload = {
      billId: this.billResult.billId,
      paidAmount: this.netPayable,
      paymentMode: 'UPI' as const
    };

    this.paymentService.recordPayment(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastr.success('Payment Successful!', 'Success');
          this.resetForm();
        },
        error: (error) => {
          console.error('Error processing payment:', error);
          this.toastr.error('Payment failed. Please try again.', 'Error');
        }
      });
  }

  resetForm(): void {
    this.patientId = '';
    this.insuranceCoverage = 0;
    this.grossAmount = 0;
    this.insuranceAmount = 0;
    this.netPayable = 0;
    this.billResult = null;
    this.services.forEach(s => s.quantity = 0);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
