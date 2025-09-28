import {Routes} from '@angular/router';
import {DashboardComponent} from "./dashboard/dashboard.component";
import {ListPocketsComponent} from "./pockets/list/list.component";
import {PocketFormComponent} from "./pockets/form/form.component";
import {ListPaymentTypeComponent} from "./paymentstype/list/list.component";
import {DailyComponent} from "./expenses/daily/daily.component";
import {ListCycleComponent} from "./cycles/list/list.component";
import {CycleFormComponent} from "./cycles/form/form.component";
import {BudgetComponent} from "./budget/budget.component";
import {ConceptsComponent} from "./pockets/concepts/concepts.component";

export const routes: Routes = [
    {path: '', redirectTo: '/dashboard', pathMatch: 'full'},
    {path: 'dashboard', title: 'Dashboard Financiero', component: DashboardComponent},
    {path: 'budget', title: 'Ejecución del presupuesto', component: BudgetComponent},
    {path: 'expenses/daily', title: 'Gastos', component: DailyComponent},
    {path: 'pockets/list', title: 'Bolsillo', component: ListPocketsComponent},
    {path: 'pockets/new', title: 'Nuevo bolsillo', component: PocketFormComponent},
    {path: 'pockets/:id/edit', title: 'Editar bolsillo', component: PocketFormComponent},
    {path: 'pockets/:id/concepts', title: 'Conceptos', component: ConceptsComponent},
    {path: 'payments/types/list', title: 'Tipos de pago', component: ListPaymentTypeComponent},
    {path: 'cycles/list', title: 'Ciclos', component: ListCycleComponent},
    {path: 'cycles/new', title: 'Nuevo ciclo', component: CycleFormComponent},
    {path: 'cycles/:id/edit', title: 'Editar ciclo', component: CycleFormComponent}
];
