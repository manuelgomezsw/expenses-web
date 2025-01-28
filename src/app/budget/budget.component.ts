import {Component, OnInit} from '@angular/core';
import {Title} from "@angular/platform-browser";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";

import {MatToolbar} from "@angular/material/toolbar";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatOption} from "@angular/material/core";
import {MatSelect, MatSelectChange} from "@angular/material/select";

import {Cycle} from "../domain/cycle";
import {CycleService} from "../clients/cycles/cycle.service";
import {NotificationService} from "../services/notification/notification.service";
import {environment} from "../../environments/environment";
import {MatProgressBar} from "@angular/material/progress-bar";
import {CurrencyPipe} from "@angular/common";
import {BudgetsService} from "../clients/budgets/budgets.service";
import {Budget} from "../domain/budget";

@Component({
    selector: 'app-budget',
    imports: [
        MatToolbar,
        FormsModule,
        MatFormField,
        MatLabel,
        ReactiveFormsModule,
        MatOption,
        MatSelect,
        MatProgressBar,
        CurrencyPipe
    ],
    templateUrl: './budget.component.html',
    styleUrl: './budget.component.css'
})
export class BudgetComponent implements OnInit {
    cycles: Cycle[] = [];
    budget: Budget = {};

    constructor(
        protected titleService: Title,
        private budgetsService: BudgetsService,
        private cycleService: CycleService,
        private notificationService: NotificationService
    ) {
    }

    ngOnInit(): void {
        this.titleService.setTitle(environment.titleWebSite + ' - Ejecución del presupuesto');
        this.loadCycles();
    }

    onSelectionChanged(event: MatSelectChange): void {
        this.budgetsService.getByCycleID(event.value).subscribe({
            next: (response: any) => {
                this.budget = response;
            },
            error: (error: any) => {
                console.log('Error getting budget: ' + JSON.stringify(error));
                this.notificationService.openSnackBar(
                    'Ups... Algo malo ocurrió. Intenta de nuevo.'
                );
            }
        });
    }

    private loadCycles(): void {
        this.cycleService.getActive().subscribe({
            next: (response) => {
                this.cycles = response;
            },
            error: (error) => {
                console.log('Error getting cycles: ' + JSON.stringify(error));
                this.notificationService.openSnackBar(
                    'Ups... Algo malo ocurrió. Intenta de nuevo.'
                );
            }
        })
    }
}
