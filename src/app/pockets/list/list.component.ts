import {Component, OnInit} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {Title} from '@angular/platform-browser';

import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import {MatTableModule} from '@angular/material/table';
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatSuffix} from "@angular/material/form-field";
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatDialog} from '@angular/material/dialog';

import {Pocket} from "../../domain/pocket";
import {environment} from "../../../environments/environment";
import {StatusPipe} from '../../pipes/status/status.pipe';
import {Status} from "../../domain/status";
import {NotificationService} from "../../services/notification/notification.service";
import {PocketService} from "../../clients/pockets/pocket.service";
import {ConfirmDialogComponent} from "../../components/confirm-dialog/confirm-dialog.component"
import {Router, RouterLink} from "@angular/router";
import {MatProgressBar} from "@angular/material/progress-bar";
import {CurrencyPipe, NgIf} from "@angular/common";

@Component({
    selector: 'app-list',
    imports: [
        MatToolbarModule,
        MatIconModule,
        FormsModule,
        MatTableModule,
        MatIconButton,
        MatSuffix,
        StatusPipe,
        MatTooltipModule,
        MatButton,
        RouterLink,
        MatProgressBar,
        NgIf,
        CurrencyPipe,
    ],
    templateUrl: './list.component.html',
    styleUrl: './list.component.css'
})
export class ListPocketsComponent implements OnInit {
    displayedColumns: string[] = ['name', 'totalAmount', 'status', 'actions'];
    pockets: Pocket[] = [];
    isLoading = false;

    constructor(
        private titleService: Title,
        private pocketService: PocketService,
        private notificationService: NotificationService,
        private router: Router,
        private dialog: MatDialog
    ) {
    }

    ngOnInit() {
        this.titleService.setTitle(environment.titleWebSite + ' - Bolsillos');
        this.loadPockets();
    }

    onNew(): void {
        this.router.navigate(['/pockets/new']);
    }

    onDelete(pocket_id: any) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '400px',
            data: {message: '¿Deseas eliminar este bolsillo?'}
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result === true) {
                this.pocketService.deletePocket(pocket_id).subscribe({
                    next: () => {
                        this.pockets = this.pockets.filter(e => e.pocket_id !== pocket_id);
                        this.notificationService.openSnackBar(
                            'Bolsillo eliminado correctamente',
                        );
                    },
                    error: (error: any) => {
                        console.log('Error deleting pocket: ' + JSON.stringify(error));
                        this.notificationService.openSnackBar(
                            'Ups... Algo malo ocurrió. Intenta de nuevo.'
                        );
                    }
                });
            }
        });
    }

    private loadPockets() {
        this.isLoading = true;
        this.pocketService.getAll().subscribe({
            next: (response) => {
                this.pockets = response;
                this.isLoading = false;
            },
            error: (error) => {
                console.log('Error getting pockets: ' + JSON.stringify(error));
                this.notificationService.openSnackBar(
                    'Ups... Algo malo ocurrió. Intenta de nuevo.'
                );
                this.isLoading = false;
            }
        })
    }
}
