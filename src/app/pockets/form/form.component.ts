import {Component, OnInit} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {Title} from "@angular/platform-browser";
import {ActivatedRoute, Router} from "@angular/router";

import {MatButton} from "@angular/material/button";
import {MatCard, MatCardContent, MatCardFooter} from "@angular/material/card";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatOption} from "@angular/material/core";
import {MatSelect} from "@angular/material/select";
import {MatToolbar} from "@angular/material/toolbar";

import {Pocket} from "../../domain/pocket";
import {Status} from "../../domain/status";
import {environment} from "../../../environments/environment";
import {PocketService} from "../../clients/pockets/pocket.service";
import {NotificationService} from "../../services/notification/notification.service";

@Component({
  selector: 'app-form',
    imports: [
        FormsModule,
        MatButton,
        MatCard,
        MatCardContent,
        MatCardFooter,
        MatFormField,
        MatInput,
        MatLabel,
        MatOption,
        MatSelect,
        MatToolbar,
    ],
  templateUrl: './form.component.html',
  styleUrl: './form.component.css'
})
export class PocketFormComponent implements OnInit {
    pocket: Pocket = {};
    status: Status[] = [
        {value: true, name: 'Activo'},
        {value: false, name: 'Inactivo'},
    ];
    isEditMode = false;

    constructor(
        private titleService: Title,
        private pocketService: PocketService,
        private notificationService: NotificationService,
        private router: Router,
        private route: ActivatedRoute,
    ) {
        const pocket_id = this.route.snapshot.paramMap.get('id');
        if (pocket_id) {
            this.isEditMode = true;
            this.loadPocket(pocket_id);
        }
    }

    ngOnInit() {
        this.titleService.setTitle(environment.titleWebSite + (this.isEditMode ? 'Editar Bolsillo' : 'Nuevo Bolsillo'));
        this.pocket.status = (this.isEditMode ? this.pocket.status : true);
    }

    onSave(pocket: any) {
        if (this.isEditMode) {
            this.updatePocket(pocket);
        } else {
            this.newPocket(pocket);
        }
    }

    onCancel() {
        this.router.navigate(['/pockets', 'list']);
    }

    private newPocket(pocket: any) {
        this.pocketService.newPocket(pocket).subscribe({
            next: () => {
                this.notificationService.openSnackBar(
                    'Bolsillo creado correctamente',
                );
                this.router.navigate(['/pockets', 'list']);
            },
            error: (error) => {
                console.log('Error updating pocket: ' + JSON.stringify(error));
                this.notificationService.openSnackBar(
                    'Ups... Algo malo ocurrió. Intenta de nuevo.'
                );
            }
        });
    }

    private updatePocket(pocket: any) {
        this.pocketService.editPocket(pocket).subscribe({
            next: () => {
                this.notificationService.openSnackBar(
                    'Bolsillo actualizado correctamente',
                );
                this.router.navigate(['/pockets', 'list']);
            },
            error: (error) => {
                console.log('Error updating pocket: ' + JSON.stringify(error));
                this.notificationService.openSnackBar(
                    'Ups... Algo malo ocurrió. Intenta de nuevo.'
                );
            }
        });
    }

    private loadPocket(pocket_id: string): void {
        this.pocketService.getByID(pocket_id).subscribe({
            next: (result) => {
                this.pocket = result;
            },
            error: (err) => console.error(err)
        });
    }
}
