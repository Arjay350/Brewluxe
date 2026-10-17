import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService, UserRole } from './auth.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};

export const loginGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    return true;
  }

  const role = authService.getCurrentRole();
  const redirectPath = role ? authService.getDashboardForRole(role) : '/login';
  router.navigate([redirectPath]);
  return false;
};

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const requiredRole = route.data['role'] as UserRole | UserRole[];

  if (!authService.isLoggedIn()) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  const currentRole = authService.getCurrentRole();

  const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  if (!currentRole || (!requiredRoles.includes(currentRole) && currentRole !== 'SUPER_ADMIN')) {
    const redirectPath = currentRole ? authService.getDashboardForRole(currentRole) : '/login';
    router.navigate([redirectPath]);
    return false;
  }

  return true;
};
