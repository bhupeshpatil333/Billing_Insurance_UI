import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { environment } from '../../../environment/environment';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface BillResponse {
  billId: number;
  patientId: number;
  grossAmount: number;
  insuranceAmount: number;
  netPayable: number;
  invoiceNumber: string;
  status?: string;
  createdAt: string;
}

export interface GenerateBillRequest {
  patientId: number;
  services: Array<{
    serviceId: number;
    quantity: number;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class BillingService {

  private api = environment.apiUrl + '/billing';

  constructor(private http: HttpClient) { }

  generateBill(data: GenerateBillRequest): Observable<BillResponse> {
    return this.http.post<ApiResponse<BillResponse>>(`${this.api}`, data).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.message);
        }
        return response.data;
      }),
      tap(bill => console.log('Bill generated:', bill)),
      catchError(this.handleError)
    );
  }

  getBillById(id: number): Observable<BillResponse> {
    return this.http.get<ApiResponse<BillResponse>>(`${this.api}/${id}`).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.message);
        }
        return response.data;
      }),
      tap(bill => console.log('Bill retrieved:', bill)),
      catchError(this.handleError)
    );
  }

  getAllBills(): Observable<BillResponse[]> {
    return this.http.get<ApiResponse<BillResponse[]>>(this.api).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.message);
        }
        return response.data;
      }),
      tap(bills => console.log(`Retrieved ${bills.length} bills`)),
      catchError(this.handleError)
    );
  }

  downloadInvoice(billId: number): Observable<Blob> {
    return this.http.get(`${this.api}/${billId}/invoice`, {
      responseType: 'blob'
    }).pipe(
      tap(() => console.log('Invoice downloaded')),
      catchError(this.handleError)
    );
  }

  emailInvoice(billId: number): Observable<void> {
    return this.http.post<ApiResponse<void>>(`${this.api}/${billId}/email-invoice`, {}).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.message);
        }
        return response.data;
      }),
      tap(() => console.log('Invoice emailed')),
      catchError(this.handleError)
    );
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

    console.error('Billing Service Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
