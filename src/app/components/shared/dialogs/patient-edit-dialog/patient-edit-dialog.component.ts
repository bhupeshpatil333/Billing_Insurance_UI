import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MaterialModule } from '../../material.module';

@Component({
  selector: 'app-patient-edit-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, MatDialogModule],
  templateUrl: './patient-edit-dialog.component.html',
  styleUrl: './patient-edit-dialog.component.scss'
})
export class PatientEditDialogComponent implements OnInit {
  patientForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<PatientEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.patientForm = this.fb.group({
      fullName: [this.data?.fullName || '', Validators.required],
      email: [this.data?.email || '', [Validators.required, Validators.email]],
      mobile: [this.data?.mobile || '', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      dateOfBirth: [this.data?.dateOfBirth || '']
    });
  }

  onSave(): void {
    if (this.patientForm.valid) {
      this.dialogRef.close(this.patientForm.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
