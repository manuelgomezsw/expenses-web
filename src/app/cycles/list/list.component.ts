import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router, RouterLink} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {Title} from "@angular/platform-browser";
import {MatDialog} from "@angular/material/dialog";

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

import {StatusPipe} from "../../pipes/status/status.pipe";
import {Cycle} from "../../domain/cycle";
import {CycleService} from "../../clients/cycles/cycle.service";
import {NotificationService} from "../../services/notification/notification.service";
import {environment} from "../../../environments/environment";
import {ConfirmDialogComponent} from "../../components/confirm-dialog/confirm-dialog.component";
import {MatTooltip} from "@angular/material/tooltip";
import {MatProgressBar} from "@angular/material/progress-bar";

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
        RouterLink,
        MatTooltip,
        MatProgressBar,
    ],
    templateUrl: './list.component.html',
    styleUrl: './list.component.css'
})
export class ListCycleComponent implements OnInit {
    displayedColumns: string[] = ['cycle', 'pocket_name', 'budget', 'date_init', 'date_end', 'status', 'actions'];
    cycles: Cycle[] = []
    isLoading = false;

    constructor(
        private titleService: Title,
        private cycleService: CycleService,
        private notificationService: NotificationService,
        private router: Router,
        private dialog: MatDialog
    ) {
    }

    ngOnInit() {
        this.titleService.setTitle(environment.titleWebSite + ' - Ciclos');
        this.loadCycles();
    }

    onNewCycle(): void {
        this.router.navigate(['/cycles/new']);
    }

    onDelete(cycle_id: number): void {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '400px',
            data: {message: '¿Deseas eliminar este ciclo?'}
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result === true) {
                this.cycleService.deleteCycle(cycle_id).subscribe({
                    next: () => {
                        this.cycles = this.cycles.filter(e => e.cycle_id !== cycle_id);
                        this.notificationService.openSnackBar(
                            'Ciclo eliminado correctamente',
                        );
                    },
                    error: (error: any) => {
                        console.log('Error deleting cycle: ' + JSON.stringify(error));
                        this.notificationService.openSnackBar(
                            'Ups... Algo malo ocurrió. Intenta de nuevo.'
                        );
                    }
                });
            }
        });
    }

    onFinish(cycle_id: number): void {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '400px',
            data: {message: '¿Deseas cerrar este ciclo?'}
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result === true) {
                this.isLoading = true;
                this.cycleService.finishCycle(cycle_id).subscribe({
                    next: () => {
                        this.cycles = this.cycles.filter(e => e.cycle_id !== cycle_id);
                        this.notificationService.openSnackBar(
                            'Ciclo cerrado correctamente',
                        );
                        this.loadCycles();
                        this.isLoading = false;
                    },
                    error: (error: any) => {
                        console.log('Error deleting cycle: ' + JSON.stringify(error));
                        this.notificationService.openSnackBar(
                            'Ups... Algo malo ocurrió. Intenta de nuevo.'
                        );
                        this.isLoading = false;
                    }
                });
            }
        });
    }

    private loadCycles(): void {
        this.cycleService.getAll().subscribe({
            next: (response: any) => {
                this.cycles = response;
            },
            error: (error: any) => {
                console.log('Error getting cycles: ' + JSON.stringify(error));
                this.notificationService.openSnackBar(
                    'Ups... Algo malo ocurrió. Intenta de nuevo.'
                );
            }
        });
    }
}
