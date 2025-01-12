import {Routes} from '@angular/router';
import {NewPocketComponent} from "./pockets/new/new.component";
import {ListPocketsComponent} from "./pockets/list/list.component";
import {ListPaymentTypeComponent} from "./paymentstype/list/list.component";

export const routes: Routes = [
    {
        path: 'pockets/new',
        title: 'New Pocket',
        component: NewPocketComponent
    },
    {
        path: 'pockets/list',
        title: 'Pockets',
        component: ListPocketsComponent
    },
    {
        path: 'payments/types/list',
        title: 'Tipos de pago',
        component: ListPaymentTypeComponent
    }
];
