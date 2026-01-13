import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { MatDialog } from '@angular/material/dialog';
import { MaterialModule } from '../../components/shared/material.module';
import { ConfirmDialogComponent } from '../../components/shared/dialogs/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, MaterialModule],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent implements OnInit {
  userRole: string | null = null;
  isLoggingOut: boolean = false;

  constructor(
    public authService: AuthService,
    private router: Router,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.userRole = this.authService.getRole();
  }

  logout(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        type: 'logout',
        title: 'Confirm Logout',
        message: 'Are you sure you want to logout from the system?',
        confirmText: 'Yes, Logout',
        cancelText: 'Cancel'
      },
      width: '450px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoggingOut = true;
        setTimeout(() => {
          this.authService.logout();
          this.router.navigate(['/login']);
          this.isLoggingOut = false;
        }, 1000); // Small delay for visual feedback
      }
    });
  }
}
