import { Component, OnInit } from '@angular/core';

import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MaterialModule } from '../../material.module';
import { UserService } from '../../../../core/services/user.service';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-user-create-dialog',
    standalone: true,
    imports: [ReactiveFormsModule, MaterialModule, MatDialogModule],
    templateUrl: './user-create-dialog.component.html',
    styleUrl: './user-create-dialog.component.scss'
})
export class UserCreateDialogComponent implements OnInit {
    userForm!: FormGroup;
    roles = ['Admin', 'Billing', 'Insurance'];
    isLoading = false;

    constructor(
        private fb: FormBuilder,
        public dialogRef: MatDialogRef<UserCreateDialogComponent>,
        private userService: UserService,
        private toastr: ToastrService
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
            this.isLoading = true;
            this.userService.createUser(this.userForm.value)
                .subscribe({
                    next: (user) => {
                        this.isLoading = false;
                        this.dialogRef.close(user);
                    },
                    error: (error) => {
                        this.isLoading = false;
                        console.error('Error creating user:', error);
                        this.toastr.error(error.error?.message || 'Failed to create user', 'Error');
                    }
                });
        }
    }

    onCancel(): void {
        this.dialogRef.close();
    }
}
