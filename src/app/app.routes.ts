import {Routes} from '@angular/router';
import {DashboardComponent} from "./dashboard/dashboard.component";

export const routes: Routes = [
    {path: '', redirectTo: '/dashboard', pathMatch: 'full'},
    {path: 'dashboard', title: 'Dashboard Financiero', component: DashboardComponent},
    {path: '**', redirectTo: '/dashboard'} // Wildcard route for 404 pages
];
