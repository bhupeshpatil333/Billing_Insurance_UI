import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map, switchMap } from 'rxjs/operators';
import { environment } from '../../../environment/environment';

interface Payment {
  id?: string;
  billId: string;
  amount: number;
  paymentMethod: string;
  transactionDate: Date;
  status: 'pending' | 'completed' | 'failed';
}

interface PaymentValidation {
  isValid: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  private api = environment.apiUrl + '/payments';

  constructor(private http: HttpClient) { }

  makePayment(data: any): Observable<Payment> {
    return this.validatePayment(data).pipe(
      switchMap(validation => {
        if (!validation.isValid) {
          return throwError(() => new Error(validation.message));
        }
        return this.http.post<Payment>(this.api, data).pipe(
          tap(payment => console.log('Payment processed:', payment)),
          catchError(this.handleError)
        );
      })
    );
  }

  getPaymentById(id: string): Observable<Payment> {
    return this.http.get<Payment>(`${this.api}/${id}`).pipe(
      tap(payment => console.log('Payment retrieved:', payment)),
      catchError(this.handleError)
    );
  }

  getPaymentsByBill(billId: string): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.api}/bill/${billId}`).pipe(
      map(payments => payments.sort((a, b) =>
        new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime()
      )),
      tap(payments => console.log(`Retrieved ${payments.length} payments for bill`)),
      catchError(this.handleError)
    );
  }

  getAllPayments(): Observable<Payment[]> {
    return this.http.get<Payment[]>(this.api).pipe(
      tap(payments => console.log(`Retrieved ${payments.length} payments`)),
      catchError(this.handleError)
    );
  }

  refundPayment(paymentId: string): Observable<Payment> {
    return this.http.post<Payment>(`${this.api}/${paymentId}/refund`, {}).pipe(
      tap(payment => console.log('Payment refunded:', payment)),
      catchError(this.handleError)
    );
  }

  private validatePayment(data: any): Observable<PaymentValidation> {
    // Client-side validation
    const validation: PaymentValidation = {
      isValid: true,
      message: ''
    };

    if (!data.amount || data.amount <= 0) {
      validation.isValid = false;
      validation.message = 'Payment amount must be greater than zero';
    } else if (!data.billId) {
      validation.isValid = false;
      validation.message = 'Bill ID is required';
    } else if (!data.paymentMethod) {
      validation.isValid = false;
      validation.message = 'Payment method is required';
    }

    return new Observable(observer => {
      observer.next(validation);
      observer.complete();
    });
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

