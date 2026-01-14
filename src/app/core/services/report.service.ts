import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environment/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ApiResponse, BillingReportItem, PaymentReportData, InsuranceReportData } from '../Interfaces/interfaces';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  private api = environment.apiUrl + '/reports';

  constructor(private http: HttpClient) { }

  getBillingReport(from: string, to: string): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.api}/billing?from=${from}&to=${to}`).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.message);
        }
        // Return the entire data object which contains summary and records
        return response.data;
      })
    );
  }

  getPaymentReport(from: string, to: string): Observable<PaymentReportData> {
    return this.http.get<ApiResponse<PaymentReportData>>(`${this.api}/payments?from=${from}&to=${to}`).pipe(
      map(response => response.data)
    );
  }

  getInsuranceReport(from: string, to: string): Observable<InsuranceReportData> {
    return this.http.get<ApiResponse<InsuranceReportData>>(`${this.api}/insurance?from=${from}&to=${to}`).pipe(
      map(response => response.data)
    );
  }
}
