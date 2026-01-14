import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { environment } from '../../../environment/environment';

import { LoginResponse, ApiResponse } from '../Interfaces/interfaces';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private api = environment.apiUrl + '/auth';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.isLoggedIn());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  login(data: any): Observable<LoginResponse> {
    return this.http.post<ApiResponse<LoginResponse>>(`${this.api}/login`, data).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.message || 'Login failed');
        }
        return response.data;
      }),
      tap(loginData => {
        if (loginData.token) {
          this.saveToken(loginData.token, loginData.role);
          this.isAuthenticatedSubject.next(true);
          console.log('Login successful');
        }
      }),
      catchError(this.handleError)
    );
  }

  saveToken(token: string, role: string): void {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    this.isAuthenticatedSubject.next(true);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    return this.getRole() === 'Admin';
  }

  isBilling(): boolean {
    return this.getRole() === 'Billing';
  }

  isInsurance(): boolean {
    return this.getRole() === 'Insurance';
  }


  logout(): void {
    localStorage.clear();
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
    console.log('User logged out and redirected');
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error - check for standardized API response format
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.error?.success === false) {
        errorMessage = error.error.message || 'Request failed';
      } else {
        errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      }
    }

    console.error('Auth Service Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
