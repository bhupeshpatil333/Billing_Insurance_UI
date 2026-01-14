import { Component, Inject, OnInit } from '@angular/core';

import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MaterialModule } from '../../shared/material.module';
import { ServiceService } from '../../../core/services/service.service';
import { AppServiceItem, CreateServiceRequest } from '../../../core/Interfaces/interfaces';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
    selector: 'app-service-dialog',
    standalone: true,
    imports: [ReactiveFormsModule, MaterialModule],
    templateUrl: './service-dialog.component.html'
})
export class ServiceDialogComponent implements OnInit {
    serviceForm: FormGroup;
    isEditMode: boolean;
    isLoading = false;

    constructor(
        private fb: FormBuilder,
        private serviceService: ServiceService,
        private notification: NotificationService,
        private dialogRef: MatDialogRef<ServiceDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: AppServiceItem | null
    ) {
        this.isEditMode = !!data;
        this.serviceForm = this.fb.group({
            serviceName: [data?.serviceName || '', [Validators.required, Validators.minLength(3)]],
            cost: [data?.cost || 0, [Validators.required, Validators.min(0)]],
            isActive: [data ? data.isActive : true]
        });
    }

    ngOnInit(): void { }

    onSubmit(): void {
        if (this.serviceForm.invalid) return;

        this.isLoading = true;
        const request: CreateServiceRequest = this.serviceForm.value;

        const operation = this.isEditMode
            ? this.serviceService.updateService(this.data!.serviceId, request)
            : this.serviceService.createService(request);

        operation.subscribe({
            next: () => {
                this.notification.success(`Service ${this.isEditMode ? 'updated' : 'created'} successfully`);
                this.isLoading = false;
                this.dialogRef.close(true);
            },
            error: (err: any) => {
                this.notification.error(err.message || 'Operation failed');
                this.isLoading = false;
            }
        });
    }

    onCancel(): void {
        this.dialogRef.close(false);
    }
}
