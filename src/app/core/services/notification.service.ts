import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {

    constructor(private toastr: ToastrService) { }

    // Success notifications
    success(message: string, title: string = 'Success') {
        this.toastr.success(message, title, {
            timeOut: 3000,
            progressBar: true
        });
    }

    // Error notifications
    error(message: string, title: string = 'Error') {
        this.toastr.error(message, title, {
            timeOut: 5000,
            progressBar: true
        });
    }

    // Warning notifications
    warning(message: string, title: string = 'Warning') {
        this.toastr.warning(message, title, {
            timeOut: 4000,
            progressBar: true
        });
    }

    // Info notifications
    info(message: string, title: string = 'Info') {
        this.toastr.info(message, title, {
            timeOut: 3000,
            progressBar: true
        });
    }

    // Payment specific notifications
    paymentSuccess(amount: number, status: string, remainingBalance?: number) {
        if (status === 'Paid') {
            this.success(`Bill fully paid! Amount: ₹${amount}`, 'Payment Successful');
        } else if (status === 'Partially Paid' && remainingBalance !== undefined) {
            this.success(
                `Partial payment of ₹${amount} recorded. Remaining: ₹${remainingBalance}`,
                'Payment Successful'
            );
        } else {
            this.success(`Payment of ₹${amount} processed successfully`, 'Payment Successful');
        }
    }

    // Bill specific notifications
    billGenerated(invoiceNumber: string, amount: number) {
        this.success(
            `Invoice ${invoiceNumber} generated for ₹${amount}`,
            'Bill Generated'
        );
    }

    // Patient specific notifications
    patientAdded(patientName: string) {
        this.success(`${patientName} added successfully`, 'Patient Added');
    }

    patientUpdated(patientName: string) {
        this.success(`${patientName} updated successfully`, 'Patient Updated');
    }

    patientDeleted() {
        this.success('Patient deleted successfully', 'Patient Deleted');
    }

    // User specific notifications
    userCreated(userName: string) {
        this.success(`${userName} created successfully`, 'User Created');
    }

    userUpdated(userName: string) {
        this.success(`${userName} updated successfully`, 'User Updated');
    }

    userStatusChanged(action: string) {
        this.success(`User ${action}d successfully`, 'Status Updated');
    }
}
