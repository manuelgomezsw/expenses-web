import {Routes} from '@angular/router';
import {ListPocketsComponent} from "./pockets/list/list.component";
import {PocketFormComponent} from "./pockets/form/form.component";
import {ListPaymentTypeComponent} from "./paymentstype/list/list.component";
import {DailyComponent} from "./expenses/daily/daily.component";
import {ListCycleComponent} from "./cycles/list/list.component";
import {CycleFormComponent} from "./cycles/form/form.component";

export const routes: Routes = [
    {path: 'expenses/daily', title: 'Gastos', component: DailyComponent},
    {path: 'pockets/list', title: 'Bolsillo', component: ListPocketsComponent},
    {path: 'pockets/new', title: 'Nuevo bolsillo', component: PocketFormComponent},
    {path: 'pockets/:id/edit', title: 'Editar bolsillo', component: PocketFormComponent},
    {path: 'payments/types/list', title: 'Tipos de pago', component: ListPaymentTypeComponent},
    {path: 'cycles/list', title: 'Ciclos', component: ListCycleComponent},
    {path: 'cycles/new', title: 'Nuevo ciclo', component: CycleFormComponent},
    {path: 'cycles/:id/edit', title: 'Editar ciclo', component: CycleFormComponent}
];
