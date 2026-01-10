import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../shared/material.module';
import { InsuranceService } from '../../../core/services/insurance.service';
import { PatientService } from '../../../core/services/patient.service';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-insurance-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './insurance-form.component.html',
  styleUrl: './insurance-form.component.scss'
})
export class InsuranceFormComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  policyForm: FormGroup;
  patients: any[] = [];
  policies: any[] = [];

  constructor(
    private fb: FormBuilder,
    private insuranceService: InsuranceService,
    private patientService: PatientService
  ) {
    this.policyForm = this.fb.group({
      patientId: ['', Validators.required],
      policyId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Load patients and policies in parallel using forkJoin
    forkJoin({
      patients: this.patientService.getPatients(),
      providers: this.insuranceService.getProviders()
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.patients = result.patients;
          this.policies = result.providers as any[];
        },
        error: (error) => {
          console.error('Error loading data:', error);
        }
      });
  }

  assign(): void {
    if (this.policyForm.valid) {
      this.insuranceService.assignPolicy(this.policyForm.value)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result) => {
            console.log('Policy assigned successfully:', result);
            this.policyForm.reset();
          },
          error: (error) => {
            console.error('Error assigning policy:', error);
          }
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
