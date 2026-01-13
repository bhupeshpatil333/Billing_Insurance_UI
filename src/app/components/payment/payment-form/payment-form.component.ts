import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../shared/material.module';
import { PaymentService } from '../../../core/services/payment.service';
import { BillingService } from '../../../core/services/billing.service';
import { ToastrService } from 'ngx-toastr';
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
  isLoading = false;
  paymentMethods = ['Cash', 'Credit Card', 'Debit Card', 'UPI', 'Net Banking'];

  constructor(
    private fb: FormBuilder,
    private paymentService: PaymentService,
    private billingService: BillingService,
    private toastr: ToastrService
  ) {
    this.paymentForm = this.fb.group({
      billId: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(1)]],
      paymentMethod: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Load only unpaid bills
    this.billingService.getAllBills()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (bills) => {
          // Filter only pending/unpaid bills
          this.bills = bills.filter(b => b.status !== 'Paid');
        },
        error: (error) => {
          console.error('Error fetching bills:', error);
          this.toastr.error('Failed to load bills', 'Error');
        }
      });

    // Watch for bill selection changes to update max amount
    this.paymentForm.get('billId')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(billId => {
        if (billId) {
          const selectedBill = this.bills.find(b => b.billId === billId);
          if (selectedBill) {
            const maxAmount = selectedBill.remainingAmount || selectedBill.netPayable;
            // Update amount validator with max amount
            this.paymentForm.get('amount')?.setValidators([
              Validators.required,
              Validators.min(1),
              Validators.max(maxAmount)
            ]);
            this.paymentForm.get('amount')?.updateValueAndValidity();
          }
        }
      });
  }

  getSelectedBillRemainingAmount(): number {
    const billId = this.paymentForm.get('billId')?.value;
    if (billId) {
      const bill = this.bills.find(b => b.billId === billId);
      return bill?.remainingAmount || bill?.netPayable || 0;
    }
    return 0;
  }

  makePayment(): void {
    if (this.paymentForm.valid) {
      const paymentData = {
        billId: this.paymentForm.value.billId,
        paidAmount: this.paymentForm.value.amount,
        paymentMode: this.paymentForm.value.paymentMethod as 'Cash' | 'UPI' | 'Card'
      };

      this.isLoading = true;
      this.paymentService.recordPayment(paymentData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            console.log('Payment processed successfully:', response);
            this.isLoading = false;
            // ... (rest of success logic)
            if (response.status === 'Paid') {
              this.toastr.success(`Bill fully paid! Amount: ₹${paymentData.paidAmount}`, 'Payment Successful', {
                timeOut: 4000
              });
            } else if (response.status === 'Partially Paid') {
              const remaining = (response as any).remainingBalance || 0;
              this.toastr.success(
                `Partial payment recorded. Remaining: ₹${remaining}`,
                'Payment Successful',
                { timeOut: 4000 }
              );
            } else {
              this.toastr.success(`Payment of ₹${paymentData.paidAmount} processed successfully`, 'Payment Successful');
            }

            this.paymentForm.reset();

            // Reload bills to remove paid bill from dropdown
            this.ngOnInit();
          },
          error: (error) => {
            this.isLoading = false;
            console.error('Error processing payment:', error);
            const errorMessage = error.error?.message || error.message || 'Payment processing failed';
            this.toastr.error(errorMessage, 'Payment Failed', {
              timeOut: 5000
            });
          }
        });
    } else {
      this.toastr.warning('Please fill in all required fields', 'Incomplete Form');
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
