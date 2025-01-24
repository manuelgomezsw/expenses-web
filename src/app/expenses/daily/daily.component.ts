import {Component, OnInit} from '@angular/core';
import {MatToolbar} from "@angular/material/toolbar";
import {FormsModule} from "@angular/forms";
import {CurrencyPipe, NgIf} from "@angular/common";
import {NgxCurrencyDirective} from "ngx-currency";

import {MatButton, MatIconButton} from "@angular/material/button";
import {MatCard, MatCardContent, MatCardFooter} from "@angular/material/card";
import {MatFormField, MatLabel, MatSuffix} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatRadioButton, MatRadioGroup} from "@angular/material/radio";

import {Expense} from "../../domain/expense";
import {CustomDatePipe} from '../../pipes/custom-date/custom-date.pipe';

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
import {MatOption} from "@angular/material/core";
import {MatSelect} from "@angular/material/select";
import {Pocket} from "../../domain/pocket";
import {PaymentType} from "../../domain/payment_type";
import {Title} from "@angular/platform-browser";
import {PaymentsTypeService} from "../../clients/paymentstype/paymentstype.service";
import {NotificationService} from "../../services/notification/notification.service";
import {environment} from "../../../environments/environment";
import {ExpensesService} from "../../clients/expenses/expenses.service";
import {CycleService} from "../../clients/cycles/cycle.service";
import {Cycle} from "../../domain/cycle";
import {ConfirmDialogComponent} from "../../components/confirm-dialog/confirm-dialog.component";
import {MatDialog} from "@angular/material/dialog";

@Component({
    selector: 'app-daily',
    imports: [
        MatToolbar,
        FormsModule,
        MatButton,
        MatCard,
        MatCardContent,
        MatCardFooter,
        MatFormField,
        MatInput,
        MatLabel,
        NgxCurrencyDirective,
        MatRadioGroup,
        MatRadioButton,
        CurrencyPipe,
        MatCell,
        MatCellDef,
        MatColumnDef,
        MatHeaderCell,
        MatHeaderRow,
        MatHeaderRowDef,
        MatIcon,
        MatIconButton,
        MatRow,
        MatRowDef,
        MatSuffix,
        MatTable,
        MatHeaderCellDef,
        CustomDatePipe,
        MatOption,
        MatSelect,
        NgIf
    ],
    templateUrl: './daily.component.html',
    styleUrl: './daily.component.css'
})
export class DailyComponent implements OnInit {
    displayedColumns: string[] = ['name', 'value', 'payment_type_name', 'pocket', 'created_at', 'actions'];
    paymentTypes: PaymentType[] = [];
    cycles: Cycle[] = [];
    expenses: Expense[] = [];
    expense: Expense = {};
    isEditMode = false;
    selectedPocket: Pocket = {};

    constructor(
        private titleService: Title,
        private expenseService: ExpensesService,
        private paymentsTypeService: PaymentsTypeService,
        private cycleServices: CycleService,
        private notificationService: NotificationService,
        private dialog: MatDialog
    ) {
    }

    ngOnInit() {
        this.titleService.setTitle(environment.titleWebSite + ' - Registro de gastos');
        this.loadPaymentsType();
        this.loadCycles();
        this.loadExpenses();
    }

    onSave(expense: Expense) {
        console.log(expense);
        if (this.isEditMode) {
            this.updateExpense(expense);
        } else {
            this.newExpense(expense);
        }
    }

    onEdit(expense_id: number): void {
        this.isEditMode = true;
        this.expense = this.expenses.find(e => e.expense_id === expense_id) || {};
    }

    onDelete(expense_id: number): void {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '400px',
            data: {message: '¿Deseas eliminar este gasto?'}
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result === true) {
                this.expenseService.delete(expense_id).subscribe({
                    next: () => {
                        this.expenses = this.expenses.filter(e => e.expense_id !== expense_id);
                        this.notificationService.openSnackBar(
                            'Gasto eliminado correctamente',
                        );
                    },
                    error: (error: any) => {
                        console.log('Error deleting expense: ' + JSON.stringify(error));
                        this.notificationService.openSnackBar(
                            'Ups... Algo malo ocurrió. Intenta de nuevo.'
                        );
                    }
                });
            }
        });
    }

    onCancel() {
        this.isEditMode = false;
        this.clearFields();
    }

    private newExpense(expense: Expense) {
        this.expenseService.new(expense).subscribe({
            next: () => {
                this.notificationService.openSnackBar(
                    'Gasto almacenado correctamente',
                );
                this.loadExpenses();
            },
            error: (error) => {
                console.log('Error updating pocket: ' + JSON.stringify(error));
                this.notificationService.openSnackBar(
                    'Ups... Algo malo ocurrió. Intenta de nuevo.'
                );
            }
        });
    }

    private updateExpense(expense: Expense) {
        this.expenseService.edit(expense).subscribe({
            next: () => {
                this.notificationService.openSnackBar(
                    'Gasto actualizado correctamente',
                );
                this.isEditMode = false;
            },
            error: (error) => {
                console.log('Error updating pocket: ' + JSON.stringify(error));
                this.notificationService.openSnackBar(
                    'Ups... Algo malo ocurrió. Intenta de nuevo.'
                );
            }
        });
    }

    private loadCycles() {
        this.cycleServices.getActive().subscribe({
            next: (response) => {
                this.cycles = response;
            },
            error: (error) => {
                console.log('Error getting pockets: ' + JSON.stringify(error));
                this.notificationService.openSnackBar(
                    'Ups... Algo malo ocurrió. Intenta de nuevo.'
                );
            }
        })
    }

    private loadPaymentsType() {
        this.paymentsTypeService.getAll().subscribe({
            next: (response) => {
                this.paymentTypes = response;
            },
            error: (error) => {
                console.log('Error getting payments type: ' + JSON.stringify(error));
                this.notificationService.openSnackBar(
                    'Ups... Algo malo ocurrió. Intenta de nuevo.'
                );
            }
        })
    }

    private loadExpenses() {
        this.expenseService.getAll().subscribe({
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

    private clearFields() {
        this.expense = {}
    }
}
