import {Routes} from '@angular/router';
import {DashboardComponent} from "./dashboard/dashboard.component";
import {FinancialConfigComponent} from "./configuration/financial-config/financial-config.component";

export const routes: Routes = [
    {path: '', redirectTo: '/dashboard', pathMatch: 'full'},
    {path: 'dashboard', title: 'Dashboard Financiero', component: DashboardComponent},
    {path: 'configuration', title: 'Configuración Financiera', component: FinancialConfigComponent},
    {path: '**', redirectTo: '/dashboard'} // Wildcard route for 404 pages
];
