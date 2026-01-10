import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map, retry } from 'rxjs/operators';
import { environment } from '../../../environment/environment';

interface Bill {
  id?: string;
  patientId: string;
  amount: number;
  date: Date;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class BillingService {

  private api = environment.apiUrl + '/billing';

  constructor(private http: HttpClient) { }

  generateBill(data: any): Observable<Bill> {
    return this.http.post<Bill>(this.api, data).pipe(
      tap(bill => console.log('Bill generated:', bill)),
      catchError(this.handleError)
    );
  }

  getBillById(id: string): Observable<Bill> {
    return this.http.get<Bill>(`${this.api}/${id}`).pipe(
      retry(2), // Retry failed requests up to 2 times
      tap(bill => console.log('Bill retrieved:', bill)),
      catchError(this.handleError)
    );
  }

  getAllBills(): Observable<Bill[]> {
    return this.http.get<Bill[]>(this.api).pipe(
      map(bills => bills.sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )),
      tap(bills => console.log(`Retrieved ${bills.length} bills`)),
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

    console.error('Billing Service Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}

