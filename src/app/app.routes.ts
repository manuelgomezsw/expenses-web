import {Routes} from '@angular/router';
import {ListPocketsComponent} from "./pockets/list/list.component";
import {PocketFormComponent} from "./pockets/form/form.component";
import {ListPaymentTypeComponent} from "./paymentstype/list/list.component";
import {DailyComponent} from "./expenses/daily/daily.component";
import {ListCycleComponent} from "./cycles/list/list.component";
import {CycleFormComponent} from "./cycles/form/form.component";
import {BudgetComponent} from "./budget/budget.component";
import {AuthGuard} from "./shared/services/authguard/authguard.service";
import {LoginComponent} from "./login/login.component";

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    {path: 'budget', component: BudgetComponent, canActivate: [AuthGuard]},
    {path: 'expenses/daily', component: DailyComponent, canActivate: [AuthGuard]},
    {path: 'pockets/list', component: ListPocketsComponent, canActivate: [AuthGuard]},
    {path: 'pockets/new', component: PocketFormComponent, canActivate: [AuthGuard]},
    {path: 'pockets/:id/edit', component: PocketFormComponent, canActivate: [AuthGuard]},
    {path: 'payments/types/list', component: ListPaymentTypeComponent, canActivate: [AuthGuard]},
    {path: 'cycles/list', component: ListCycleComponent, canActivate: [AuthGuard]},
    {path: 'cycles/new', component: CycleFormComponent, canActivate: [AuthGuard]},
    {path: 'cycles/:id/edit', component: CycleFormComponent, canActivate: [AuthGuard]}
];
