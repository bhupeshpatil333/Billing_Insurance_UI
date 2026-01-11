import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../shared/material.module';
import { PatientService } from '../../../core/services/patient.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/dialogs/confirm-dialog/confirm-dialog.component';
import { PatientEditDialogComponent } from '../../shared/dialogs/patient-edit-dialog/patient-edit-dialog.component';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [CommonModule, MaterialModule, FormsModule],
  templateUrl: './patient-list.component.html',
  styleUrl: './patient-list.component.scss'
})
export class PatientListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  displayedColumns: string[] = ['fullName', 'dob', 'mobile', 'actions'];
  dataSource: MatTableDataSource<any>;
  filterValue: string = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private patientService: PatientService,
    private dialog: MatDialog
  ) {
    this.dataSource = new MatTableDataSource<any>([]);
  }

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.patientService.getPatients()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          // Sort by patientId descending (latest first)
          const sortedPatients = res.sort((a, b) => (b.patientId || 0) - (a.patientId || 0));
          this.dataSource.data = sortedPatients;
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        },
        error: (error) => {
          console.error('Error fetching patients:', error);
        }
      });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  clearFilter(): void {
    this.filterValue = '';
    this.dataSource.filter = '';
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  addPatient(): void {
    const dialogRef = this.dialog.open(PatientEditDialogComponent, {
      width: '600px',
      data: null // Pass null for new patient
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Call service to add new patient
        this.patientService.addPatient(result)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (patientId) => {
              // Refresh the list
              this.loadPatients();
              alert(`Patient added successfully with ID: ${patientId}`);
            },
            error: (error) => {
              console.error('Error adding patient:', error);
              alert('Error adding patient. Please try again.');
            }
          });
      }
    });
  }

  editPatient(patient: any): void {
    const dialogRef = this.dialog.open(PatientEditDialogComponent, {
      width: '600px',
      data: patient
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Update patient with result data
        const updatedPatient = { ...patient, ...result };

        // Call service to update (assuming updatePatient method exists)
        this.patientService.updatePatient(patient.patientId || patient.id, updatedPatient)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              // Refresh the list
              this.loadPatients();
              alert('Patient updated successfully!');
            },
            error: (error) => {
              console.error('Error updating patient:', error);
              alert('Error updating patient. Please try again.');
            }
          });
      }
    });
  }

  deletePatient(patient: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Patient',
        message: `Are you sure you want to delete ${patient.fullName}? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Call service to delete
        this.patientService.deletePatient(patient.patientId || patient.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              // Refresh the list
              this.loadPatients();
              alert('Patient deleted successfully!');
            },
            error: (error) => {
              console.error('Error deleting patient:', error);
              alert('Error deleting patient. Please try again.');
            }
          });
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
