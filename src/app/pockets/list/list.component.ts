import {Component, OnInit} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {Title} from '@angular/platform-browser';
import {NgIf} from "@angular/common";

import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import {MatTableModule} from '@angular/material/table';
import {MatIconButton} from "@angular/material/button";
import {MatFormField, MatSuffix} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatDialog} from '@angular/material/dialog';
import {MatOption, MatSelect} from "@angular/material/select";

import {Pocket} from "../../domain/pocket";
import {environment} from "../../../environments/environment";
import {StatusPipe} from '../../pipes/status/status.pipe';
import {Status} from "../../domain/status";
import {NotificationService} from "../../services/notification/notification.service";
import {PocketService} from "../../clients/pockets/pocket.service";
import {ConfirmDialogComponent} from "../../components/confirm-dialog/confirm-dialog.component"

@Component({
    selector: 'app-list',
    imports: [
        MatToolbarModule,
        MatIconModule,
        FormsModule,
        MatTableModule,
        MatIconButton,
        MatSuffix,
        MatFormField,
        MatInput,
        NgIf,
        StatusPipe,
        MatSelect,
        MatOption,
        MatTooltipModule,
    ],
    templateUrl: './list.component.html',
    styleUrl: './list.component.css'
})
export class ListPocketsComponent implements OnInit {
    displayedColumns: string[] = ['name', 'status', 'actions'];
    pockets: Pocket[] = [];
    status: Status[] = [
        {value: true, name: 'Activo'},
        {value: false, name: 'Inactivo'},
    ];
    selectedStatus: boolean = false;

    constructor(
        private titleService: Title,
        private pocketService: PocketService,
        private notificationService: NotificationService,
        private dialog: MatDialog
    ) {
    }

    ngOnInit() {
        this.titleService.setTitle(environment.titleWebSite + ' - Bolsillos');
        this.loadPockets();
    }

    onEdit(pocket: any) {
        this.pockets.forEach(element => {
            element.is_editing = false;
        });
        this.selectedStatus = pocket.status;
        pocket.is_editing = true;
    }

    onSave(pocket: any) {
        this.pocketService.editPocket(pocket).subscribe({
            next: () => {
                pocket.is_editing = false;
                this.notificationService.openSnackBar(
                    'Bolsillo actualizado correctamente',
                );
            },
            error: (error) => {
                console.log('Error updating pocket: ' + JSON.stringify(error));
                this.notificationService.openSnackBar(
                    'Ups... Algo malo ocurrió. Intenta de nuevo.'
                );
            }
        });
    }

    onCancel(pocket: any) {
        pocket.is_editing = false;
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

    loadPockets() {
        this.pocketService.getAll().subscribe({
            next: (response) => {
                this.pockets = response;
            },
            error: (error) => {
                console.log('Error getting pockets: ' + JSON.stringify(error));
                this.notificationService.openSnackBar(
                    'Ups... Algo malo ocurrió. Intenta de nuevo.'
                );
            }
        })
    }
}
