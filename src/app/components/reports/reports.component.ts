import { Component, OnInit } from '@angular/core';
import { ReportService } from '../../core/services/report.service';
import { MaterialModule } from '../shared/material.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reports',
  imports: [MaterialModule, CommonModule, FormsModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss'
})
export class ReportsComponent implements OnInit {

  fromDate!: string;
  toDate!: string;

  billingReport: any;
  paymentReport: any;
  insuranceReport: any;

  // Chart data
  billingChartData: any[] = [];
  paymentChartData: any[] = [];

  constructor(private reportService: ReportService) { }

  loadReports() {
    this.reportService.getBillingReport(this.fromDate, this.toDate)
      .subscribe(res => {
        this.billingReport = res;
        this.billingChartData = [
          { data: [res.GrossAmount, res.InsuranceAmount, res.NetAmount], label: 'Billing Amounts' }
        ];
      });

    this.reportService.getPaymentReport(this.fromDate, this.toDate)
      .subscribe(res => this.paymentReport = res);

    this.reportService.getInsuranceReport(this.fromDate, this.toDate)
      .subscribe(res => this.insuranceReport = res);
  }

  ngOnInit() { }
}
