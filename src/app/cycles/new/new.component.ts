import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {Router} from '@angular/router';

import {MatToolbar} from "@angular/material/toolbar";
import {MatCard, MatCardContent, MatCardFooter} from "@angular/material/card";
import {MatFormField} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatLabel} from "@angular/material/form-field";
import {MatButton} from "@angular/material/button";
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatFormFieldModule} from '@angular/material/form-field';
import {NgxCurrencyDirective} from "ngx-currency";

import {MatOption, provideNativeDateAdapter} from '@angular/material/core';

import {Cycle} from "../../domain/cycle";
import {MatSelect} from "@angular/material/select";
import {Pocket} from "../../domain/pocket";

@Component({
    selector: 'app-new',
    imports: [
        FormsModule,
        CommonModule,
        MatToolbar,
        MatCard,
        MatCardContent,
        MatCardFooter,
        MatFormField,
        MatInput,
        MatLabel,
        MatButton,
        MatDatepickerModule,
        MatFormFieldModule,
        NgxCurrencyDirective,
        MatOption,
        MatSelect,
    ],
    providers: [
        provideNativeDateAdapter()
    ],
    templateUrl: './new.component.html',
    styleUrl: './new.component.css'
})
export class NewCycleComponent {
    cycle: Cycle = {};
    pockets: Pocket[] = [
        {pocket_id: 1, name: "Hogar", status: true},
        {pocket_id: 2, name: "Padres", status: true},
        {pocket_id: 3, name: "Yaque", status: true},
    ];
    selectedPocket: Pocket = {};

    constructor(
        private router: Router
    ) {
    }

    onSave() {

    }

    onCancelNewCycle(): void {
        this.router.navigate(['/cycles/list']);
    }
}
