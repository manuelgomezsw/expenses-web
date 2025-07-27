import {Component, OnInit} from '@angular/core';
import {MatToolbar} from '@angular/material/toolbar';
import {FormsModule} from '@angular/forms';
import {CurrencyPipe, NgIf} from '@angular/common';
import {NgxCurrencyDirective} from 'ngx-currency';

import {MatButton, MatIconButton} from '@angular/material/button';
import {MatCard, MatCardContent, MatCardFooter} from '@angular/material/card';
import {MatFormField, MatLabel, MatSuffix} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';

import {environment} from '../../../environments/environment';
import {Concept} from '../../domain/concept';
import {NotificationService} from '../../services/notification/notification.service';
import {ConceptsService} from '../../clients/concepts/concepts.service';
import {ConfirmDialogComponent} from '../../components/confirm-dialog/confirm-dialog.component';
import {StatusPipe} from "../../pipes/status/status.pipe";

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
import {MatDialog} from '@angular/material/dialog';
import {MatTooltip} from '@angular/material/tooltip';
import {ActivatedRoute} from "@angular/router";
import {MatCheckbox} from "@angular/material/checkbox";
import {
    MatDatepickerToggle,
    MatDateRangeInput,
    MatDateRangePicker,
    MatEndDate,
    MatStartDate
} from "@angular/material/datepicker";
import {MatOption, MatSelect} from "@angular/material/select";
import {MatProgressBar} from "@angular/material/progress-bar";

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
        MatCheckbox,
        MatDateRangeInput,
        MatDateRangePicker,
        MatDatepickerToggle,
        MatEndDate,
        MatStartDate,
        MatSelect,
        MatOption,
        MatProgressBar
    ],
    templateUrl: './concepts.component.html',
    styleUrls: ['./concepts.component.css']
})
export class ConceptsComponent implements OnInit {
    displayedColumns: string[] = ['name', 'value', 'paymentDay', 'payed', 'actions'];
    days: number[] = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31];
    concepts: Concept[] = [];
    concept: Concept = {};
    pocketName: string | undefined = "";
    pocket_id: number | undefined;
    isEditMode = false;
    isLoading = false;

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
            this.newConcept();
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
                this.isLoading = true;
                this.conceptsService.delete(concept_id).subscribe({
                    next: () => {
                        this.concepts = this.concepts.filter(c => c.id !== concept_id);
                        this.notificationService.openSnackBar('Concepto eliminado correctamente');
                        this.isLoading = false;
                    },
                    error: (error: any) => {
                        console.log('Error deleting concept: ' + JSON.stringify(error));
                        this.notificationService.openSnackBar('Ups... Algo malo ocurrió. Intenta de nuevo.');
                        this.isLoading = false;
                    }
                });
            }
        });
    }

    onCancel(): void {
        this.isEditMode = false;
        this.clearFields();
    }

    onPayedChange(element: any): void {
        this.payedUpdate(element.id, element.payed);
    }

    private newConcept(): void {
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
        this.isLoading = true;
        this.conceptsService.edit(concept).subscribe({
            next: () => {
                this.notificationService.openSnackBar('Concepto actualizado correctamente');
                this.isEditMode = false;
                this.isLoading = false;
                this.clearFields();
            },
            error: (error: any) => {
                console.log('Error updating concept: ' + JSON.stringify(error));
                this.notificationService.openSnackBar('Ups... Algo malo ocurrió. Intenta de nuevo.');
                this.isLoading = false;
            }
        });
    }

    private payedUpdate(id_concept: number, payed: boolean): void {
        this.isEditMode = true;
        this.isLoading = true;

        this.conceptsService.payedEdit(id_concept, payed).subscribe({
            next: () => {
                this.isEditMode = false;
                this.clearFields();
                this.isLoading = false;
            },
            error: (error: any) => {
                console.log('Error updating concept: ' + JSON.stringify(error));
                this.notificationService.openSnackBar('Ups... Algo malo ocurrió. Intenta de nuevo.');
                this.isLoading = false;
            }
        });
    }

    private loadConcepts(): void {
        this.isLoading = true;
        this.conceptsService.getByPocketID(this.pocket_id).subscribe({
            next: (response: Concept[]) => {
                this.concepts = response;
                this.pocketName = this.concepts[0]?.pocket_name;
                this.isLoading = false;
            },
            error: (error: any) => {
                console.log('Error getting concepts: ' + JSON.stringify(error));
                this.notificationService.openSnackBar('Ups... Algo malo ocurrió. Intenta de nuevo.');
                this.isLoading = false;
            }
        });
    }

    private clearFields(): void {
        this.concept = {};
    }
}