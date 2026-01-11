import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map, shareReplay } from 'rxjs/operators';
import { environment } from '../../../environment/environment';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface InsuranceProvider {
  id: string;
  name: string;
  contactInfo: string;
}

export interface Policy {
  policyId?: number;
  id?: string;
  providerId?: string;
  policyNumber: string;
  coverageAmount: number;
  coveragePercentage?: number;
  validFrom?: string;
  validTo?: string;
}

export interface AssignPolicyRequest {
  patientId: number;
  policyId: number;
}

@Injectable({
  providedIn: 'root'
})
export class InsuranceService {

  private api = environment.apiUrl + '/insurance';
  private providersCache$?: Observable<InsuranceProvider[]>;
  private policiesCache$?: Observable<Policy[]>;

  constructor(private http: HttpClient) { }

  // Get all insurance providers
  getProviders(forceRefresh: boolean = false): Observable<InsuranceProvider[]> {
    if (!this.providersCache$ || forceRefresh) {
      this.providersCache$ = this.http.get<ApiResponse<InsuranceProvider[]>>(`${this.api}/providers`).pipe(
        map(response => {
          if (!response.success) {
            throw new Error(response.message);
          }
          return response.data;
        }),
        tap(providers => console.log(`Retrieved ${providers.length} insurance providers`)),
        shareReplay(1),
        catchError(this.handleError)
      );
    }
    return this.providersCache$;
  }

  // ✅ NEW: Get all policies (not patient-specific)
  getAllPolicies(forceRefresh: boolean = false): Observable<Policy[]> {
    if (!this.policiesCache$ || forceRefresh) {
      this.policiesCache$ = this.http.get<ApiResponse<Policy[]>>(`${this.api}/policies`).pipe(
        map(response => {
          if (!response.success) {
            throw new Error(response.message);
          }
          return response.data;
        }),
        tap(policies => console.log(`Retrieved ${policies.length} insurance policies`)),
        shareReplay(1),
        catchError(this.handleError)
      );
    }
    return this.policiesCache$;
  }

  // Get expiring policies (within 30 days)
  getExpiringPolicies(): Observable<Policy[]> {
    return this.http.get<ApiResponse<Policy[]>>(`${this.api}/policies/expiring`).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.message);
        }
        return response.data;
      }),
      tap(policies => console.log(`Retrieved ${policies.length} expiring policies`)),
      catchError(this.handleError)
    );
  }

  // Create new insurance policy
  createPolicy(policyData: any): Observable<Policy> {
    return this.http.post<ApiResponse<Policy>>(`${this.api}/policies`, policyData).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.message);
        }
        return response.data;
      }),
      tap(policy => {
        console.log('Policy created:', policy);
        // Clear cache to force refresh
        this.clearPoliciesCache();
      }),
      catchError(this.handleError)
    );
  }

  // Update existing insurance policy
  updatePolicy(policyId: number, policyData: any): Observable<Policy> {
    return this.http.put<ApiResponse<Policy>>(`${this.api}/policies/${policyId}`, policyData).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.message);
        }
        return response.data;
      }),
      tap(policy => {
        console.log('Policy updated:', policy);
        this.clearPoliciesCache();
      }),
      catchError(this.handleError)
    );
  }

  // Deactivate insurance policy
  deactivatePolicy(policyId: number): Observable<any> {
    return this.http.delete<ApiResponse<any>>(`${this.api}/policies/${policyId}`).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.message);
        }
        return response.data;
      }),
      tap(() => {
        console.log('Policy deactivated:', policyId);
        this.clearPoliciesCache();
      }),
      catchError(this.handleError)
    );
  }

  // Get policies for a specific patient (for billing auto-calculation)
  getPoliciesByPatient(patientId: string): Observable<Policy[]> {
    return this.http.get<ApiResponse<Policy[]>>(`${this.api}/policies/patient/${patientId}`).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.message);
        }
        return response.data;
      }),
      map(policies => policies.filter(p => p.coverageAmount > 0)),
      tap(policies => console.log(`Retrieved ${policies.length} policies for patient`)),
      catchError(this.handleError)
    );
  }

  // Assign policy to patient
  assignPolicy(data: AssignPolicyRequest): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.api}/assign`, data).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.message);
        }
        return response.data;
      }),
      tap(result => {
        console.log('Policy assigned:', result);
        // Clear cache to force refresh
        this.clearCaches();
      }),
      catchError(this.handleError)
    );
  }

  clearProvidersCache(): void {
    this.providersCache$ = undefined;
    console.log('Providers cache cleared');
  }

  clearPoliciesCache(): void {
    this.policiesCache$ = undefined;
    console.log('Policies cache cleared');
  }

  clearCaches(): void {
    this.clearProvidersCache();
    this.clearPoliciesCache();
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

    console.error('Insurance Service Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
