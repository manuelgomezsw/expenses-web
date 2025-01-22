import {Component} from '@angular/core';
import {MatToolbar} from "@angular/material/toolbar";
import {FormsModule} from "@angular/forms";
import {CurrencyPipe} from "@angular/common";
import {NgxCurrencyDirective} from "ngx-currency";

import {MatButton, MatIconButton} from "@angular/material/button";
import {MatCard, MatCardContent, MatCardFooter} from "@angular/material/card";
import {MatFormField, MatLabel, MatSuffix} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatRadioButton, MatRadioGroup} from "@angular/material/radio";

import {Expense} from "../../domain/expense";
import {CustomDatePipe} from '../../pipes/custom-date.pipe';

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
import {StatusPipe} from "../../pipes/status.pipe";
import {MatOption} from "@angular/material/core";
import {MatSelect} from "@angular/material/select";
import {Pocket} from "../../domain/pocket";

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
        StatusPipe,
        MatHeaderCellDef,
        CustomDatePipe,
        MatOption,
        MatSelect
    ],
    templateUrl: './daily.component.html',
    styleUrl: './daily.component.css'
})
export class DailyComponent {
    expense: Expense = {};
    expenses: Expense[] = [
        {expense_id: 1, name: 'Pañales Emma', value: 21950, payment_type_id: 2, cycle_id: 1, pocket_name: 'Emma (Ene 2025)', created_at: '2025-01-21'},
        {expense_id: 2, name: 'Mercado Euro', value: 319540, payment_type_id: 2, cycle_id: 1, pocket_name: 'Hogar (Ene 2025)', created_at: '2025-01-20'},
        {expense_id: 2, name: 'Helados la fresita', value: 319540, payment_type_id: 2, cycle_id: 1, pocket_name: 'Mecato (Ene 2025)', created_at: '2025-01-19'},
        {expense_id: 2, name: 'Papitas de pollo', value: 319540, payment_type_id: 2, cycle_id: 1, pocket_name: 'Emma (Ene 2025)', created_at: '2025-01-07'},
    ];
    pockets: Pocket[] = [
        {pocket_id: 1, name: "Emma (Ene 2025)", status: true},
        {pocket_id: 2, name: "Hogar (Ene 2025)", status: true},
        {pocket_id: 3, name: "Yaque (Ene 2025)", status: true},
    ];
    selectedPocket: Pocket = {};
    displayedColumns: string[] = ['name', 'value', 'pocket', 'created_at', 'actions'];

    onSave() {

    }

    onEdit(expense_id: number): void {

    }

    onDelete(expense_id: number): void {

    }
}
