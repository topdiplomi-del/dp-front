import { Routes } from '@angular/router';
import { authGuard } from './features/admin/pages/admin-page/auth.guard';

export const routes: Routes = [

  {
    path: '',
    loadComponent: () =>
      import('./features/home/pages/home-page/home-page').then((m) => m.HomePage),
  },
  {
    path: 'department/:id',
    loadComponent: () =>
      import('./features/department/pages/department-page/department-page').then(
        (m) => m.DepartmentPage,
      ),
  },
  {
    path: 'speciality/:id',
    loadComponent: () =>
      import('./features/speciality/pages/speciality-page/speciality-page').then(
        (m) => m.SpecialityPage,
      ),
  },


  {
    path: 'admin/login',
    loadComponent: () => import('./features/admin/pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/admin/pages/admin-page/admin-page').then((m) => m.AdminPage),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
