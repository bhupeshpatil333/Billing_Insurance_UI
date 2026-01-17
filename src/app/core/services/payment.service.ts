import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map, switchMap } from 'rxjs/operators';
import { environment } from '../../../environment/environment';

import { PaymentResponse, CreatePaymentRequest } from '../Interfaces/interfaces';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  private api = environment.apiUrl + '/payments';

  constructor(private http: HttpClient) { }

  recordPayment(data: CreatePaymentRequest): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(this.api, data).pipe(
      tap(payment => console.log('Payment processed:', payment)),
      catchError(this.handleError)
    );
  }

  // Keeping these as potentially useful but unverified against the provided doc snippet
  getPaymentById(id: number): Observable<any> {
    return this.http.get<any>(`${this.api}/${id}`).pipe(
      tap(payment => console.log('Payment retrieved:', payment)),
      catchError(this.handleError)
    );
  }

  getPaymentsByBill(billId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/bill/${billId}`).pipe(
      tap(payments => console.log(`Retrieved ${payments ? payments.length : 0} payments for bill`)),
      catchError(this.handleError)
    );
  }

  getAllPayments(): Observable<any[]> {
    return this.http.get<any[]>(this.api).pipe(
      tap(payments => console.log(`Retrieved ${payments ? payments.length : 0} payments`)),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }

    console.error('Payment Service Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}

