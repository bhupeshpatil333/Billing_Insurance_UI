import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../shared/material.module';
import { BillingService } from '../../../core/services/billing.service';
import { PatientService } from '../../../core/services/patient.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ServiceService, ServiceItem } from '../../../core/services/service.service';
import { NotificationService } from '../../../core/services/notification.service';

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
  isLoading: boolean = false;
  patients: any[] = [];
  services: (ServiceItem & { quantity: number })[] = [];

  constructor(
    private billingService: BillingService,
    private patientService: PatientService,
    private serviceService: ServiceService,
    private notification: NotificationService
  ) { }

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.patientService.getPatients()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => this.patients = res,
        error: (error) => console.error('Error fetching patients:', error)
      });

    this.serviceService.getServices()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.services = res.map(s => ({ ...s, quantity: 0 }));
        },
        error: (error) => this.notification.error('Error fetching services: ' + error.message)
      });
  }

  calculateTotal(): number {
    return this.services
      .reduce((sum, service) => sum + (service.cost * service.quantity), 0);
  }

  updateQuantity(service: any, delta: number): void {
    const newQty = (service.quantity || 0) + delta;
    if (newQty >= 0) {
      service.quantity = newQty;
    }
  }

  generateBill(): void {
    const selectedItems = this.services.filter(s => s.quantity > 0);
    if (!this.patientId || selectedItems.length === 0) {
      this.notification.warning('Please select a patient and at least one service');
      return;
    }

    const billData = {
      patientId: Number(this.patientId),
      services: selectedItems.map(s => ({
        serviceId: s.serviceId,
        quantity: s.quantity
      }))
    };

    this.isLoading = true;
    this.billingService.generateBill(billData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (bill) => {
          this.notification.success(`Bill generated successfully! Invoice: ${bill.invoiceNumber}`);
          this.patientId = 0;
          this.services.forEach(s => s.quantity = 0);
          this.isLoading = false;
        },
        error: (error) => {
          this.notification.error(error.message || 'Error generating bill');
          this.isLoading = false;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
