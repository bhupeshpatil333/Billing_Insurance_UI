import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MaterialModule } from '../../material.module';
import { UserService } from '../../../../core/services/user.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-user-edit-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, MatDialogModule],
  templateUrl: './user-edit-dialog.component.html',
  styleUrl: './user-edit-dialog.component.scss'
})
export class UserEditDialogComponent implements OnInit {
  userForm!: FormGroup;
  roles = ['Admin', 'Billing', 'Insurance'];
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<UserEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private userService: UserService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.userForm = this.fb.group({
      email: [{ value: this.data?.email || '', disabled: true }],
      role: [this.data?.role || '', Validators.required]
    });
  }

  onSave(): void {
    if (this.userForm.valid) {
      this.isLoading = true;
      const role = this.userForm.get('role')?.value;
      this.userService.updateUserRole(this.data.userId, role)
        .subscribe({
          next: () => {
            this.isLoading = false;
            this.dialogRef.close({ role });
          },
          error: (error) => {
            this.isLoading = false;
            console.error('Error updating user role:', error);
            this.toastr.error(error.error?.message || 'Failed to update user role', 'Error');
          }
        });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
