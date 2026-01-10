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

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [CommonModule, MaterialModule, FormsModule],
  templateUrl: './patient-list.component.html',
  styleUrl: './patient-list.component.scss'
})
export class PatientListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  displayedColumns: string[] = ['fullName', 'email', 'mobile', 'actions'];
  dataSource: MatTableDataSource<any>;
  filterValue: string = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private patientService: PatientService) {
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
          this.dataSource.data = res;
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
