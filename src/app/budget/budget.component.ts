import {Component, OnInit} from '@angular/core';
import {Title} from "@angular/platform-browser";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CurrencyPipe} from "@angular/common";
import {HTTP_INTERCEPTORS} from "@angular/common/http";

import {MatToolbar} from "@angular/material/toolbar";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatOption} from "@angular/material/core";
import {MatSelect, MatSelectChange} from "@angular/material/select";
import {MatProgressBar} from "@angular/material/progress-bar";
import {
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatHeaderCell, MatHeaderCellDef,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow, MatRowDef, MatTable
} from "@angular/material/table";

import {environment} from "../../environments/environment";
import {Cycle} from "../domain/cycle";
import {Budget} from "../domain/budget";
import {Expense} from "../domain/expense";
import {CycleService} from "../clients/cycles/cycle.service";
import {NotificationService} from "../shared/services/notification/notification.service";
import {BudgetsService} from "../clients/budgets/budgets.service";
import {ExpensesService} from "../clients/expenses/expenses.service";
import {CustomDatePipe} from "../pipes/custom-date/custom-date.pipe";
import {TokenInterceptor} from "../shared/interceptors/token/token";

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
    providers: [
        {provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true}
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
