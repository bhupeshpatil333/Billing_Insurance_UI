import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MaterialModule } from '../../material.module';
import { Policy } from '../../../../core/services/insurance.service';

export interface CreatePolicyRequest {
    policyNumber: string;
    coveragePercentage: number;
    validFrom: string;
    validTo: string;
}

@Component({
    selector: 'app-policy-create-dialog',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, MaterialModule],
    templateUrl: './policy-create-dialog.component.html',
    styleUrl: './policy-create-dialog.component.scss'
})
export class PolicyCreateDialogComponent implements OnInit {
    policyForm: FormGroup;
    isEditMode: boolean = false;

    constructor(
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<PolicyCreateDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: Policy | null
    ) {
        this.isEditMode = !!data;

        this.policyForm = this.fb.group({
            policyNumber: [data?.policyNumber || '', [Validators.required, Validators.minLength(3)]],
            coveragePercentage: [data?.coveragePercentage || 0, [Validators.required, Validators.min(0), Validators.max(100)]],
            validFrom: [data?.validFrom ? new Date(data.validFrom).toISOString().split('T')[0] : '', Validators.required],
            validTo: [data?.validTo ? new Date(data.validTo).toISOString().split('T')[0] : '', Validators.required]
        });
    }

    ngOnInit(): void {
        // Additional initialization if needed
    }

    onSubmit(): void {
        if (this.policyForm.valid) {
            const formValue = this.policyForm.value;

            // Format dates to ISO string
            const policyData: CreatePolicyRequest = {
                policyNumber: formValue.policyNumber,
                coveragePercentage: formValue.coveragePercentage,
                validFrom: new Date(formValue.validFrom).toISOString(),
                validTo: new Date(formValue.validTo).toISOString()
            };

            this.dialogRef.close(policyData);
        }
    }

    onCancel(): void {
        this.dialogRef.close();
    }
}
