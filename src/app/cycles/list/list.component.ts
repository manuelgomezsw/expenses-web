import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router, RouterLink} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {Title} from "@angular/platform-browser";
import {MatDialog} from "@angular/material/dialog";
import {HTTP_INTERCEPTORS} from "@angular/common/http";

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
import {MatTooltip} from "@angular/material/tooltip";

import {environment} from "../../../environments/environment";
import {Cycle} from "../../domain/cycle";
import {CycleService} from "../../clients/cycles/cycle.service";
import {NotificationService} from "../../shared/services/notification/notification.service";
import {StatusPipe} from "../../pipes/status/status.pipe";
import {ConfirmDialogComponent} from "../../shared/components/confirm-dialog/confirm-dialog.component";
import {TokenInterceptor} from "../../shared/interceptors/token/token";

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
    ],
    providers: [
        {provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true}
    ],
    templateUrl: './list.component.html',
    styleUrl: './list.component.css'
})
export class ListCycleComponent implements OnInit {
    displayedColumns: string[] = ['cycle', 'pocket_name', 'budget', 'date_init', 'date_end', 'status', 'actions'];
    cycles: Cycle[] = []

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
