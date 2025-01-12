import {Component,OnInit} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {Title} from '@angular/platform-browser';

import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import {MatTableModule} from '@angular/material/table';
import {MatIconButton} from "@angular/material/button";
import {MatFormField, MatSuffix} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {NgIf} from "@angular/common";

import {PaymentType} from "../../domain/payment_type";
import {environment} from "../../../environments/environment";

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
    ],
    templateUrl: './list.component.html',
    styleUrl: './list.component.css'
})
export class ListPaymentTypeComponent implements OnInit {
    paymentTypes: PaymentType[] = [
        {payment_type_id: 1, name: 'Débito', is_editing: false},
        {payment_type_id: 2, name: 'Crédito', is_editing: false},
        {payment_type_id: 3, name: 'Efectivo', is_editing: false},
    ];
    displayedColumns: string[] = ['payment_type_id', 'name', 'actions'];

    constructor(
        private titleService: Title,
    ) {
    }

    ngOnInit() {
        this.titleService.setTitle(environment.titleWebSite + ' - Bolsillos');
    }

    onEdit(paymentType: any) {
        this.paymentTypes.forEach(element => {
            element.is_editing = false;
        });
        paymentType.is_editing = true;
    }

    onSave(paymentType: any) {
        paymentType.is_editing = false;
    }

    onCancel(paymentType: any) {
        paymentType.is_editing = false;
    }
}
