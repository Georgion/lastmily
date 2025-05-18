import { Routes } from '@angular/router';

import { ErrorNotFoundComponent } from './error-not-found/error-not-found.component';
import { MainPageComponent } from './main-page/main-page.component';

export const routes: Routes = [
  { path: '', redirectTo: 'index', pathMatch: 'full' },
  {
    path: 'index',
    component: MainPageComponent, title: 'Shipment Management'
  },
  {
    path: '**',
    component: ErrorNotFoundComponent
  }
];

export default routes;
