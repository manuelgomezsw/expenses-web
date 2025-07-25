import {Component, OnInit} from '@angular/core';
import {MatToolbar} from '@angular/material/toolbar';
import {FormsModule} from '@angular/forms';
import {CurrencyPipe, NgIf} from '@angular/common';
import {NgxCurrencyDirective} from 'ngx-currency';

import {MatButton, MatIconButton} from '@angular/material/button';
import {MatCard, MatCardContent, MatCardFooter} from '@angular/material/card';
import {MatFormField, MatLabel, MatSuffix} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';

import {Concept} from '../../domain/concept';

import {
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatHeaderCell, MatHeaderCellDef,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow, MatRowDef, MatTable
} from '@angular/material/table';
import {MatIcon} from '@angular/material/icon';
import {Title} from '@angular/platform-browser';
import {NotificationService} from '../../services/notification/notification.service';
import {environment} from '../../../environments/environment';
import {ConceptsService} from '../../clients/concepts/concepts.service';
import {ConfirmDialogComponent} from '../../components/confirm-dialog/confirm-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {MatTooltip} from '@angular/material/tooltip';
import {StatusPipe} from "../../pipes/status/status.pipe";
import {ActivatedRoute, Router} from "@angular/router";
import {MatCheckbox} from "@angular/material/checkbox";

@Component({
    selector: 'app-concepts',
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
        NgIf,
        MatTooltip,
        StatusPipe,
        MatCheckbox
    ],
    templateUrl: './concepts.component.html',
    styleUrls: ['./concepts.component.css']
})
export class ConceptsComponent implements OnInit {
    displayedColumns: string[] = ['name', 'value', 'payed', 'actions'];
    concepts: Concept[] = [];
    concept: Concept = {};
    pocketName: string | undefined = "";
    isEditMode = false;
    pocket_id: number | undefined;

    constructor(
        private titleService: Title,
        private conceptsService: ConceptsService,
        private notificationService: NotificationService,
        private dialog: MatDialog,
        private route: ActivatedRoute,
    ) {
        const pocketParam = this.route.snapshot.paramMap.get('id');
        if (pocketParam !== null) {
            this.pocket_id = Number(pocketParam);
            this.loadConcepts();
        }
    }

    ngOnInit(): void {
        this.titleService.setTitle(environment.titleWebSite + ' - Conceptos');
    }

    onSave(concept: Concept): void {
        if (this.isEditMode) {
            this.updateConcept(concept);
        } else {
            this.newConcept(concept);
        }
    }

    onEdit(concept_id: number): void {
        this.isEditMode = true;
        this.concept = this.concepts.find(c => c.id === concept_id) || {};
    }

    onDelete(concept_id: number): void {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '400px',
            data: {message: '¿Deseas eliminar este concepto?'}
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result === true) {
                this.conceptsService.delete(concept_id).subscribe({
                    next: () => {
                        this.concepts = this.concepts.filter(c => c.id !== concept_id);
                        this.notificationService.openSnackBar('Concepto eliminado correctamente');
                    },
                    error: (error: any) => {
                        console.log('Error deleting concept: ' + JSON.stringify(error));
                        this.notificationService.openSnackBar('Ups... Algo malo ocurrió. Intenta de nuevo.');
                    }
                });
            }
        });
    }

    onCancel(): void {
        this.isEditMode = false;
        this.clearFields();
    }

    private newConcept(concept: Concept): void {
        this.concept.pocket_id = this.pocket_id;
        this.conceptsService.new(this.concept).subscribe({
            next: () => {
                this.notificationService.openSnackBar('Concepto almacenado correctamente');
                this.loadConcepts();
                this.clearFields();
            },
            error: (error: any) => {
                console.log('Error creating concept: ' + JSON.stringify(error));
                this.notificationService.openSnackBar('Ups... Algo malo ocurrió. Intenta de nuevo.');
            }
        });
    }

    private updateConcept(concept: Concept): void {
        this.conceptsService.edit(concept).subscribe({
            next: () => {
                this.notificationService.openSnackBar('Concepto actualizado correctamente');
                this.isEditMode = false;
                this.clearFields();
            },
            error: (error: any) => {
                console.log('Error updating concept: ' + JSON.stringify(error));
                this.notificationService.openSnackBar('Ups... Algo malo ocurrió. Intenta de nuevo.');
            }
        });
    }

    private loadConcepts(): void {
        this.conceptsService.getByPocketID(this.pocket_id).subscribe({
            next: (response: Concept[]) => {
                this.concepts = response;
                this.pocketName = this.concepts[0]?.pocket_name;
            },
            error: (error: any) => {
                console.log('Error getting concepts: ' + JSON.stringify(error));
                this.notificationService.openSnackBar('Ups... Algo malo ocurrió. Intenta de nuevo.');
            }
        });
    }

    private clearFields(): void {
        this.concept = {};
    }
}