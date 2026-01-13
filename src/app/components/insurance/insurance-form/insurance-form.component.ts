import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../shared/material.module';
import { InsuranceService, Policy } from '../../../core/services/insurance.service';
import { PatientService, Patient } from '../../../core/services/patient.service';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NotificationService } from '../../../core/services/notification.service';
import { MatDialog } from '@angular/material/dialog';
import { PolicyCreateDialogComponent } from '../../shared/dialogs/policy-create-dialog/policy-create-dialog.component';

@Component({
  selector: 'app-insurance-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './insurance-form.component.html',
  styleUrl: './insurance-form.component.scss'
})
export class InsuranceFormComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  assignPolicyForm: FormGroup;
  patients: Patient[] = [];
  policies: Policy[] = [];
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private insuranceService: InsuranceService,
    private patientService: PatientService,
    private notificationService: NotificationService,
    private dialog: MatDialog
  ) {
    this.assignPolicyForm = this.fb.group({
      patientId: ['', Validators.required],
      policyId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  openCreatePolicyDialog(): void {
    const dialogRef = this.dialog.open(PolicyCreateDialogComponent, {
      width: '600px',
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData(); // Refresh the policies list
      }
    });
  }


  loadData(): void {
    this.isLoading = true;

    // Load patients and ALL policies in parallel using forkJoin
    forkJoin({
      patients: this.patientService.getPatients(),
      policies: this.insuranceService.getAllPolicies() // ✅ NEW: Get all policies
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.patients = result.patients;
          this.policies = result.policies;
          this.isLoading = false;
          console.log('Loaded patients:', this.patients.length);
          console.log('Loaded policies:', this.policies.length);
        },
        error: (error) => {
          console.error('Error loading data:', error);
          this.notificationService.error('Error loading data: ' + error.message);
          this.isLoading = false;
        }
      });
  }

  assignPolicy(): void {
    if (this.assignPolicyForm.valid) {
      this.isLoading = true;
      const formValue = this.assignPolicyForm.value;

      // Convert to numbers for the API
      const request = {
        patientId: parseInt(formValue.patientId, 10),
        policyId: parseInt(formValue.policyId, 10)
      };

      this.insuranceService.assignPolicy(request)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result) => {
            console.log('Policy assigned successfully:', result);
            this.notificationService.success('Policy assigned successfully!', 'Assignment Success');
            this.assignPolicyForm.reset();
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error assigning policy:', error);
            this.notificationService.error('Error assigning policy: ' + error.message);
            this.isLoading = false;
          }
        });
    } else {
      this.notificationService.warning('Please fill all required fields');
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
