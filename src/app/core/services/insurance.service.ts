import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, tap, map, shareReplay } from 'rxjs/operators';
import { environment } from '../../../environment/environment';

interface InsuranceProvider {
  id: string;
  name: string;
  contactInfo: string;
}

interface Policy {
  id?: string;
  providerId: string;
  policyNumber: string;
  coverageAmount: number;
}

@Injectable({
  providedIn: 'root'
})
export class InsuranceService {

  private api = environment.apiUrl + '/insurance';
  private providersCache$?: Observable<InsuranceProvider[]>;

  constructor(private http: HttpClient) { }

  getProviders(forceRefresh: boolean = false): Observable<InsuranceProvider[]> {
    if (!this.providersCache$ || forceRefresh) {
      this.providersCache$ = this.http.get<InsuranceProvider[]>(`${this.api}/providers`).pipe(
        tap(providers => console.log(`Retrieved ${providers.length} insurance providers`)),
        shareReplay(1), // Cache the result
        catchError(this.handleError)
      );
    }
    return this.providersCache$;
  }

  addPolicy(data: any): Observable<Policy> {
    return this.http.post<Policy>(`${this.api}/policies`, data).pipe(
      tap(policy => console.log('Policy added:', policy)),
      catchError(this.handleError)
    );
  }

  assignPolicy(data: any): Observable<any> {
    return this.http.post(`${this.api}/assign`, data).pipe(
      tap(result => console.log('Policy assigned:', result)),
      catchError(this.handleError)
    );
  }

  getPoliciesByPatient(patientId: string): Observable<Policy[]> {
    return this.http.get<Policy[]>(`${this.api}/policies/patient/${patientId}`).pipe(
      map(policies => policies.filter(p => p.coverageAmount > 0)),
      tap(policies => console.log(`Retrieved ${policies.length} policies for patient`)),
      catchError(this.handleError)
    );
  }

  clearProvidersCache(): void {
    this.providersCache$ = undefined;
    console.log('Providers cache cleared');
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }

    console.error('Insurance Service Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}

