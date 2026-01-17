import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap, map, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { environment } from '../../../environment/environment';

import { ApiResponse, Patient } from '../Interfaces/interfaces';

@Injectable({
  providedIn: 'root'
})
export class PatientService {

  private api = environment.apiUrl + '/patients';
  private patientsSubject = new BehaviorSubject<Patient[]>([]);
  public patients$ = this.patientsSubject.asObservable();

  constructor(private http: HttpClient) { }

  addPatient(data: any): Observable<number> {
    return this.http.post<ApiResponse<number>>(this.api, data).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.message);
        }
        return response.data;
      }),
      tap(patientId => {
        console.log('Patient added with ID:', patientId);
        this.refreshPatients();
      }),
      catchError(this.handleError)
    );
  }

  getPatients(): Observable<Patient[]> {
    return this.http.get<ApiResponse<Patient[]>>(this.api).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.message);
        }
        return response.data;
      }),
      tap(patients => {
        console.log(`Retrieved ${patients.length} patients`);
        this.patientsSubject.next(patients);
      }),
      catchError(this.handleError)
    );
  }

  getPatientById(id: number): Observable<Patient> {
    return this.http.get<ApiResponse<Patient>>(`${this.api}/${id}`).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.message);
        }
        return response.data;
      }),
      tap(patient => console.log('Retrieved patient:', patient)),
      catchError(this.handleError)
    );
  }

  updatePatient(id: number, data: Patient): Observable<Patient> {
    return this.http.put<ApiResponse<Patient>>(`${this.api}/${id}`, data).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.message);
        }
        return response.data;
      }),
      tap(patient => {
        console.log('Patient updated:', patient);
        this.refreshPatients();
      }),
      catchError(this.handleError)
    );
  }

  deletePatient(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.api}/${id}`).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.message);
        }
        return response.data;
      }),
      tap(() => {
        console.log('Patient deleted');
        this.refreshPatients();
      }),
      catchError(this.handleError)
    );
  }

  private refreshPatients(): void {
    this.getPatients().subscribe();
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }

    console.error('Patient Service Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
