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
import {MatTooltip} from "@angular/material/tooltip";

import {PaymentType} from "../../domain/payment_type";
import {environment} from "../../../environments/environment";
import {PaymentsTypeService} from "../../clients/paymentstype/paymentstype.service";
import {NotificationService} from "../../services/notification/notification.service";

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
        MatTooltip,
    ],
    templateUrl: './list.component.html',
    styleUrl: './list.component.css'
})
export class ListPaymentTypeComponent implements OnInit {
    displayedColumns: string[] = ['payment_type_id', 'name', 'actions'];
    paymentTypes: PaymentType[] = [];

    constructor(
        private titleService: Title,
        private paymentsTypeService: PaymentsTypeService,
        private notificationService: NotificationService
    ) {
    }

    ngOnInit() {
        this.titleService.setTitle(environment.titleWebSite + ' - Medios de pago');
        this.loadPaymentTypes();
    }

    onEdit(paymentType: any) {
        this.paymentTypes.forEach(element => {
            element.is_editing = false;
        });
        paymentType.is_editing = true;
    }

    onSave(paymentType: any) {
        this.paymentsTypeService.editPaymentType(paymentType).subscribe({
            next: () => {
                paymentType.is_editing = false;
                this.notificationService.openSnackBar(
                    'Medio de pago actualizado correctamente',
                );
            },
            error: (error) => {
                console.log('Error updating payment type: ' + JSON.stringify(error));
                this.notificationService.openSnackBar(
                    'Ups... Algo malo ocurrió. Intenta de nuevo.'
                );
            }
        });
    }

    onCancel(paymentType: any) {
        paymentType.is_editing = false;
    }

    loadPaymentTypes() {
        this.paymentsTypeService.getAll().subscribe({
            next: (response) => {
                this.paymentTypes = response;
            },
            error: (error) => {
                console.log('Error getting payments type: ' + JSON.stringify(error));
                this.notificationService.openSnackBar(
                    'Ups... Algo malo ocurrió. Intenta de nuevo.'
                );
            }
        })
    }
}
