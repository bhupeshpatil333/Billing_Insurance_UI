import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../shared/material.module';
import { BillingService } from '../../../core/services/billing.service';
import { PatientService } from '../../../core/services/patient.service';
import { Subject } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-bill-form',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './bill-form.component.html',
  styleUrl: './bill-form.component.scss'
})
export class BillFormComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  patientId!: number;
  selectedServices: any[] = [];
  patients: any[] = [];
  services: any[] = [
    { serviceName: 'Consultation', cost: 500, selected: false },
    { serviceName: 'X-Ray', cost: 1000, selected: false },
    { serviceName: 'Blood Test', cost: 800, selected: false },
    { serviceName: 'ECG', cost: 600, selected: false },
    { serviceName: 'MRI Scan', cost: 5000, selected: false },
    { serviceName: 'CT Scan', cost: 4000, selected: false },
    { serviceName: 'Ultrasound', cost: 1200, selected: false }
  ];

  constructor(
    private billingService: BillingService,
    private patientService: PatientService
  ) { }

  ngOnInit(): void {
    this.patientService.getPatients()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.patients = res;
        },
        error: (error) => {
          console.error('Error fetching patients:', error);
        }
      });
  }

  calculateTotal(): number {
    return this.services
      .filter(s => s.selected)
      .reduce((sum, service) => sum + service.cost, 0);
  }

  generateBill(): void {
    const selectedServices = this.services.filter(s => s.selected);
    if (!this.patientId || selectedServices.length === 0) {
      console.error('Please select patient and services');
      return;
    }

    const totalAmount = this.selectedServices.reduce((sum, service) => sum + service.cost, 0);

    const billData = {
      patientId: this.patientId,
      amount: totalAmount,
      date: new Date(),
      status: 'pending',
      services: this.selectedServices
    };

    this.billingService.generateBill(billData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (bill) => {
          console.log('Bill generated successfully:', bill);
          this.patientId = 0;
          this.selectedServices = [];
        },
        error: (error) => {
          console.error('Error generating bill:', error);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
