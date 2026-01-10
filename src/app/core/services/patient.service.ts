import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap, map, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { environment } from '../../../environment/environment';

interface Patient {
  id?: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
}

@Injectable({
  providedIn: 'root'
})
export class PatientService {

  private api = environment.apiUrl + '/patients';
  private patientsSubject = new BehaviorSubject<Patient[]>([]);
  public patients$ = this.patientsSubject.asObservable();

  constructor(private http: HttpClient) { }

  addPatient(data: any): Observable<Patient> {
    return this.http.post<Patient>(this.api, data).pipe(
      tap(patient => {
        console.log('Patient added:', patient);
        this.refreshPatients();
      }),
      catchError(this.handleError)
    );
  }

  getPatients(): Observable<Patient[]> {
    return this.http.get<Patient[]>(this.api).pipe(
      tap(patients => {
        console.log(`Retrieved ${patients.length} patients`);
        this.patientsSubject.next(patients);
      }),
      catchError(this.handleError)
    );
  }

  getPatientById(id: string): Observable<Patient> {
    return this.http.get<Patient>(`${this.api}/${id}`).pipe(
      tap(patient => console.log('Patient retrieved:', patient)),
      catchError(this.handleError)
    );
  }

  updatePatient(id: string, data: any): Observable<Patient> {
    return this.http.put<Patient>(`${this.api}/${id}`, data).pipe(
      tap(patient => {
        console.log('Patient updated:', patient);
        this.refreshPatients();
      }),
      catchError(this.handleError)
    );
  }

  deletePatient(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`).pipe(
      tap(() => {
        console.log('Patient deleted');
        this.refreshPatients();
      }),
      catchError(this.handleError)
    );
  }

  searchPatients(searchTerm: Observable<string>): Observable<Patient[]> {
    return searchTerm.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      map(term => term.toLowerCase()),
      map(term => {
        const currentPatients = this.patientsSubject.value;
        return currentPatients.filter(patient =>
          patient.name.toLowerCase().includes(term) ||
          patient.email.toLowerCase().includes(term)
        );
      })
    );
  }

  private refreshPatients(): void {
    this.getPatients().subscribe();
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }

    console.error('Patient Service Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}

