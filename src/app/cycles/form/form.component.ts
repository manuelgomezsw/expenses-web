import {Component, OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CommonModule, NgForOf} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {NgxCurrencyDirective} from "ngx-currency";
import {Title} from "@angular/platform-browser";

import {MatToolbar} from "@angular/material/toolbar";
import {MatCard, MatCardContent, MatCardFooter} from "@angular/material/card";
import {MatFormField, MatFormFieldModule, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatButton} from "@angular/material/button";
import {
    MatDatepickerModule,
    MatDatepickerToggle,
    MatDateRangeInput,
    MatDateRangePicker,
} from '@angular/material/datepicker';
import {MatOption, provideNativeDateAdapter} from '@angular/material/core';
import {MatSelect, MatSelectChange} from "@angular/material/select";

import {Cycle} from "../../domain/cycle";
import {Pocket} from "../../domain/pocket";
import {environment} from "../../../environments/environment";
import {CycleService} from "../../clients/cycles/cycle.service";
import {PocketService} from "../../clients/pockets/pocket.service";
import {Concept} from "../../domain/concept";
import {NotificationService} from "../../services/notification/notification.service";
import {ConceptsService} from '../../clients/concepts/concepts.service';
import {MatProgressBar} from "@angular/material/progress-bar";

@Component({
    selector: 'app-form',
    imports: [
        FormsModule,
        CommonModule,
        NgxCurrencyDirective,
        NgForOf,
        MatToolbar,
        MatCard,
        MatCardContent,
        MatFormField,
        MatFormFieldModule,
        MatSelect,
        MatOption,
        MatLabel,
        MatDateRangeInput,
        MatInput,
        MatDatepickerToggle,
        MatDateRangePicker,
        MatDatepickerModule,
        MatCardFooter,
        MatButton,
        MatProgressBar
    ],
    providers: [
        provideNativeDateAdapter()
    ],
    templateUrl: './form.component.html',
    styleUrl: './form.component.css'
})
export class CycleFormComponent implements OnInit {
    cycle: Cycle = {};
    pockets: Pocket[] = [];
    selectedPocket: Pocket = {};
    isEditMode = false;

    constructor(
        private titleService: Title,
        private cycleService: CycleService,
        private pocketServices: PocketService,
        private notificationService: NotificationService,
        private conceptsService: ConceptsService,
        private router: Router,
        private route: ActivatedRoute,
    ) {
        const cycle_id = this.route.snapshot.paramMap.get('id');
        if (cycle_id) {
            this.isEditMode = true;
            this.loadCycle(cycle_id);
        }
    }

    ngOnInit(): void {
        this.titleService.setTitle(environment.titleWebSite + (this.isEditMode ? 'Editar Ciclo' : 'Nuevo Ciclo'));
        this.loadPockets();
    }

    onSave(cycle: Cycle) {
        if (this.isEditMode) {
            this.updateCycle(cycle);
        } else {
            this.createCycle(cycle);
        }
    }

    onCancelNewCycle(): void {
        this.router.navigate(['/cycles', 'list']);
    }

    onPocketSelected(event: MatSelectChange): void {
        const selectedPocketId = event.value;
        this.getBudgetProjected(selectedPocketId);
    }

    private getBudgetProjected(pocketId: number): void {
        this.conceptsService.getByPocketID(pocketId).subscribe({
            next: (response: Concept[]) => {
                this.cycle.budget = response.reduce((acc, concept) => {
                    return acc + (concept.value ?? 0);
                }, 0);
            },
            error: (error: any) => {
                console.log('Error summing concept values: ' + JSON.stringify(error));
                this.notificationService.openSnackBar('Ups... Algo malo ocurrió. Intenta de nuevo.');
            }
        });
    }

    private loadCycle(cycle_id: string): void {
        this.cycleService.getByID(cycle_id).subscribe({
            next: (result) => {
                this.cycle = result;
            },
            error: (err) => console.error(err)
        });
    }

    private loadPockets() {
        this.pocketServices.getActive().subscribe({
            next: (response: any) => {
                this.pockets = response;
            },
            error: (error: any) => {
                console.log('Error getting pockets: ' + JSON.stringify(error));
                this.notificationService.openSnackBar(
                    'Ups... Algo malo ocurrió. Intenta de nuevo.'
                );
            }
        });
    }

    private createCycle(cycle: Cycle) {
        this.cycleService.newCycle(cycle).subscribe({
            next: () => {
                this.notificationService.openSnackBar(
                    'Ciclo creado correctamente',
                );
                this.router.navigate(['/cycles', 'list']);
            },
            error: (error) => {
                console.log('Error creating cycle: ' + JSON.stringify(error));
                this.notificationService.openSnackBar(
                    'Ups... Algo malo ocurrió. Intenta de nuevo.'
                );
            }
        });
    }

    private updateCycle(cycle: Cycle) {
        this.cycleService.updateCycle(cycle).subscribe({
            next: () => {
                this.notificationService.openSnackBar(
                    'Ciclo actualizado correctamente',
                );
                this.router.navigate(['/cycles', 'list']);
            },
            error: (error) => {
                console.log('Error updating cycle: ' + JSON.stringify(error));
                this.notificationService.openSnackBar(
                    'Ups... Algo malo ocurrió. Intenta de nuevo.'
                );
            }
        });
    }
}
