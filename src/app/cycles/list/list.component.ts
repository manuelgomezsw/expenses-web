import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";

import {MatToolbar} from "@angular/material/toolbar";
import {
    MatCell, MatCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderCellDef,
    MatHeaderRow, MatHeaderRowDef,
    MatRow, MatRowDef,
    MatTable
} from "@angular/material/table";
import {MatSuffix} from "@angular/material/form-field";
import {MatIcon} from "@angular/material/icon";
import {MatButton, MatIconButton} from "@angular/material/button";

import {StatusPipe} from "../../pipes/status.pipe";
import {Cycle} from "../../domain/cycle";

@Component({
    selector: 'app-list',
    imports: [
        MatToolbar,
        FormsModule,
        MatCell,
        MatColumnDef,
        MatHeaderCell,
        MatHeaderRow,
        MatIcon,
        MatIconButton,
        MatRow,
        MatSuffix,
        MatTable,
        CommonModule,
        ReactiveFormsModule,
        StatusPipe,
        MatHeaderCellDef,
        MatCellDef,
        MatHeaderRowDef,
        MatRowDef,
        MatButton,
    ],
    templateUrl: './list.component.html',
    styleUrl: './list.component.css'
})
export class ListCycleComponent {
    cycles: Cycle[] = [
        {
            cycle_id: 1,
            pocket_id: 1,
            pocket_name: 'Hogar',
            name: 'Enero 2024',
            budget: 2030000,
            date_init: '2024-01-24',
            date_end: '2022-02-24',
            status: true
        },
        {
            cycle_id: 2,
            pocket_id: 2,
            pocket_name: 'Yaque',
            name: 'Enero 2024',
            budget: 1030000,
            date_init: '2024-01-24',
            date_end: '2022-02-24',
            status: true
        },
    ]
    displayedColumns: string[] = ['cycle', 'pocket_name', 'budget', 'date_init', 'date_end', 'status', 'actions'];

    constructor(
        private router: Router
    ) {
    }

    onNewCycle(): void {
        this.router.navigate(['/cycles/new']);
    }

    onEdit(cycle_id: number): void {

    }
}
