import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MaterialModule } from '../../material.module';

@Component({
  selector: 'app-user-edit-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, MatDialogModule],
  templateUrl: './user-edit-dialog.component.html',
  styleUrl: './user-edit-dialog.component.scss'
})
export class UserEditDialogComponent implements OnInit {
  userForm!: FormGroup;
  roles = ['Admin', 'BillingStaff', 'InsuranceStaff'];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<UserEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.userForm = this.fb.group({
      name: [this.data?.name || '', Validators.required],
      email: [this.data?.email || '', [Validators.required, Validators.email]],
      role: [this.data?.role || '', Validators.required]
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
