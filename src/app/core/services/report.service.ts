import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  private api = environment.apiUrl + '/reports';

  constructor(private http: HttpClient) { }

  getBillingReport(from: string, to: string) {
    return this.http.get<any>(`${this.api}/billing?from=${from}&to=${to}`);
  }

  getPaymentReport(from: string, to: string) {
    return this.http.get<any>(`${this.api}/payments?from=${from}&to=${to}`);
  }

  getInsuranceReport(from: string, to: string) {
    return this.http.get<any>(`${this.api}/insurance?from=${from}&to=${to}`);
  }
}
