import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { environment } from '../../../environment/environment';

interface LoginResponse {
  token: string;
  role: string;
  user?: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private api = environment.apiUrl + '/auth';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.isLoggedIn());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) { }

  login(data: any): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.api}/login`, data).pipe(
      tap(response => {
        if (response.token) {
          this.saveToken(response.token, response.role);
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
    return this.getRole() === 'BillingStaff';
  }

  isInsurance(): boolean {
    return this.getRole() === 'InsuranceStaff';
  }


  logout(): void {
    localStorage.clear();
    this.isAuthenticatedSubject.next(false);
    console.log('User logged out');
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }

    console.error('Auth Service Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
