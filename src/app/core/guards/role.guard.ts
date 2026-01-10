import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const allowedRoles = route.data['roles'] as string[];
  const userRole = authService.getRole();

  if (!userRole) {
    router.navigate(['/login']);
    return false;
  }

  if (allowedRoles.includes(userRole)) {
    return true;
  }

  // Redirect to unauthorized page if user doesn't have permission
  router.navigate(['/unauthorized']);
  return false;
};
