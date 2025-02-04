import {Component, OnInit} from '@angular/core';
import {Title} from "@angular/platform-browser";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";

import {MatToolbar} from "@angular/material/toolbar";
import {MatFormField, MatLabel, MatSuffix} from "@angular/material/form-field";
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
import {CustomDatePipe} from "../pipes/custom-date/custom-date.pipe";
import {
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatHeaderCell, MatHeaderCellDef,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow, MatRowDef, MatTable
} from "@angular/material/table";
import {MatIcon} from "@angular/material/icon";
import {MatIconButton} from "@angular/material/button";
import {MatTooltip} from "@angular/material/tooltip";
import {Expense} from "../domain/expense";
import {ExpensesService} from "../clients/expenses/expenses.service";

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
        CurrencyPipe,
        CustomDatePipe,
        MatCell,
        MatCellDef,
        MatColumnDef,
        MatHeaderCell,
        MatHeaderRow,
        MatHeaderRowDef,
        MatRow,
        MatRowDef,
        MatTable,
        MatHeaderCellDef
    ],
    templateUrl: './budget.component.html',
    styleUrl: './budget.component.css'
})
export class BudgetComponent implements OnInit {
    displayedColumns: string[] = ['name', 'value', 'payment_type_name', 'pocket', 'created_at'];
    expenses: Expense[] = [];
    cycles: Cycle[] = [];
    budget: Budget = {};

    constructor(
        protected titleService: Title,
        private budgetsService: BudgetsService,
        private cycleService: CycleService,
        private expensesService: ExpensesService,
        private notificationService: NotificationService
    ) {
    }

    ngOnInit(): void {
        this.titleService.setTitle(environment.titleWebSite + ' - Ejecución del presupuesto');
        this.loadCycles();
    }

    onSelectionChanged(event: MatSelectChange): void {
        if (event.value === undefined) {
            this.budget = {};
            this.expenses = [];
        } else {
            this.budgetsService.getByCycleID(event.value).subscribe({
                next: (response: any) => {
                    this.budget = response;
                    this.budget.available = Number(this.budget.budget) - Number(this.budget.spent);
                    this.loadExpenses(event.value);
                },
                error: (error: any) => {
                    console.log('Error getting budget: ' + JSON.stringify(error));
                    this.notificationService.openSnackBar(
                        'Ups... Algo malo ocurrió. Intenta de nuevo.'
                    );
                }
            });
        }
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

    private loadExpenses(cycle_id: any): void {
        this.expensesService.getByCycleID(cycle_id).subscribe({
            next: (response) => {
                this.expenses = response;
            },
            error: (error) => {
                console.log('Error getting expenses: ' + JSON.stringify(error));
                this.notificationService.openSnackBar(
                    'Ups... Algo malo ocurrió. Intenta de nuevo.'
                );
            }
        })
    }
}
