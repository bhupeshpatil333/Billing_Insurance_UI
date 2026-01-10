import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/dialogs/confirm-dialog/confirm-dialog.component';
import { UserEditDialogComponent } from '../../shared/dialogs/user-edit-dialog/user-edit-dialog.component';

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

  constructor(private dialog: MatDialog) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    // Mock data for now - replace with actual service call
    this.users = [
      { id: '1', name: 'Admin User', email: 'admin@medicare.com', role: 'Admin' },
      { id: '2', name: 'Billing Staff', email: 'billing@medicare.com', role: 'BillingStaff' },
      { id: '3', name: 'Insurance Staff', email: 'insurance@medicare.com', role: 'InsuranceStaff' }
    ];
  }

  editUser(user: User): void {
    const dialogRef = this.dialog.open(UserEditDialogComponent, {
      width: '600px',
      data: user
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Update user in the array
        const index = this.users.findIndex(u => u.id === user.id);
        if (index !== -1) {
          this.users[index] = { ...this.users[index], ...result };
          alert('User updated successfully!');
        }
        // In real app, call service to update on backend
      }
    });
  }

  deleteUser(user: User): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete User',
        message: `Are you sure you want to delete ${user.name}? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Remove user from array
        this.users = this.users.filter(u => u.id !== user.id);
        alert('User deleted successfully!');
        // In real app, call service to delete on backend
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
