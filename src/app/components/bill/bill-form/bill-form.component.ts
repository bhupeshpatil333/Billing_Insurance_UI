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
    { serviceId: 1, serviceName: 'Consultation', cost: 500, selected: false },
    { serviceId: 2, serviceName: 'X-Ray', cost: 1000, selected: false },
    { serviceId: 3, serviceName: 'Blood Test', cost: 800, selected: false },
    { serviceId: 4, serviceName: 'ECG', cost: 600, selected: false },
    { serviceId: 5, serviceName: 'MRI Scan', cost: 5000, selected: false },
    { serviceId: 6, serviceName: 'CT Scan', cost: 4000, selected: false },
    { serviceId: 7, serviceName: 'Ultrasound', cost: 1200, selected: false }
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

    const billData = {
      patientId: Number(this.patientId),
      services: selectedServices.map(s => ({
        serviceId: s.serviceId,
        quantity: 1
      }))
    };

    this.billingService.generateBill(billData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (bill) => {
          console.log('Bill generated successfully:', bill);
          this.patientId = 0;
          this.services.forEach(s => s.selected = false);
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
