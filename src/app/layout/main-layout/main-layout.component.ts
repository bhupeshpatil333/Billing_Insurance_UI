import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent implements OnInit {
  userRole: string | null = null;

  constructor(
    public authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.userRole = this.authService.getRole();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
