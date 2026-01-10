import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../shared/material.module';
import { PaymentService } from '../../../core/services/payment.service';
import { BillingService } from '../../../core/services/billing.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './payment-form.component.html',
  styleUrl: './payment-form.component.scss'
})
export class PaymentFormComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  paymentForm: FormGroup;
  bills: any[] = [];
  paymentMethods = ['Cash', 'Credit Card', 'Debit Card', 'UPI', 'Net Banking'];

  constructor(
    private fb: FormBuilder,
    private paymentService: PaymentService,
    private billingService: BillingService
  ) {
    this.paymentForm = this.fb.group({
      billId: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(1)]],
      paymentMethod: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.billingService.getAllBills()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (bills) => {
          this.bills = bills;
        },
        error: (error) => {
          console.error('Error fetching bills:', error);
        }
      });
  }

  makePayment(): void {
    if (this.paymentForm.valid) {
      const paymentData = {
        ...this.paymentForm.value,
        transactionDate: new Date(),
        status: 'completed'
      };

      this.paymentService.makePayment(paymentData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (payment) => {
            console.log('Payment processed successfully:', payment);
            this.paymentForm.reset();
          },
          error: (error) => {
            console.error('Error processing payment:', error);
          }
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
