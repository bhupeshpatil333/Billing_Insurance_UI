import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { MaterialModule } from '../shared/material.module';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, MaterialModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';
  hidePassword: boolean = true;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  login(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.authService.login(this.loginForm.value)
        .subscribe({
          next: (res) => {
            this.router.navigate(['/']);
            console.log('Login successful');
            this.isLoading = false;
          },
          error: (error) => {
            this.errorMessage = error.message || 'Login failed. Please try again.';
            console.error('Login error:', error);
            this.isLoading = false;
          }
        });
    } else {
      this.errorMessage = 'Please fill in all required fields correctly.';
    }
  }
}
