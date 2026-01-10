import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface User {
  id?: string;
  name: string;
  email: string;
  role: string;
}

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss'
})
export class UserListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  users: User[] = [];

  constructor() { }

  ngOnInit(): void {
    // Mock data for now - replace with actual service call
    this.users = [
      { id: '1', name: 'Admin User', email: 'admin@medicare.com', role: 'Admin' },
      { id: '2', name: 'Billing Staff', email: 'billing@medicare.com', role: 'BillingStaff' },
      { id: '3', name: 'Insurance Staff', email: 'insurance@medicare.com', role: 'InsuranceStaff' }
    ];
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
