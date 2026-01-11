import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MaterialModule } from '../../material.module';

@Component({
    selector: 'app-user-create-dialog',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, MaterialModule, MatDialogModule],
    templateUrl: './user-create-dialog.component.html',
    styleUrl: './user-create-dialog.component.scss'
})
export class UserCreateDialogComponent implements OnInit {
    userForm!: FormGroup;
    roles = ['Admin', 'Billing', 'Insurance'];

    constructor(
        private fb: FormBuilder,
        public dialogRef: MatDialogRef<UserCreateDialogComponent>
    ) { }

    ngOnInit(): void {
        this.userForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            role: ['', Validators.required]
        });
    }

    onSave(): void {
        if (this.userForm.valid) {
            this.dialogRef.close(this.userForm.value);
        }
    }

    onCancel(): void {
        this.dialogRef.close();
    }
}
